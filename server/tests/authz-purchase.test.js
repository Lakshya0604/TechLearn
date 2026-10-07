// Regression tests for the authorization and payment bugs found in the
// production-readiness audit. Run with: npm test
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';

process.env.SECRET_KEY = process.env.SECRET_KEY || 'test-secret';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

const { default: app } = await import('../index.js');
const { Course } = await import('../models/course.model.js');
const { CoursePurchase } = await import('../models/coursePurchase.model.js');
const { User } = await import('../models/user.model.js');
const { default: stripe } = await import('../utils/stripe.js');

let mongod;

before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri('techlearn-test'));
});

after(async () => {
    await mongoose.disconnect();
    await mongod.stop();
});

async function registerUser(agent, { name, email, role = 'student' }) {
    const res = await agent
        .post('/api/v1/user/register')
        .send({ name, email, password: 'password123', role });
    return res;
}

// ---------------------------------------------------------
// Course ownership / role authorization
// ---------------------------------------------------------
test('student cannot create a course', async () => {
    const agent = request.agent(app);
    await registerUser(agent, { name: 'Stu', email: 'stu1@test.com' });
    const res = await agent
        .post('/api/v1/course')
        .send({ courseTitle: 'Hacking 101', category: 'Web' });
    assert.equal(res.status, 403);
});

test('instructor cannot edit another instructor\'s course', async () => {
    const owner = request.agent(app);
    await registerUser(owner, { name: 'Owner', email: 'owner1@test.com', role: 'instructor' });
    const created = await owner
        .post('/api/v1/course')
        .send({ courseTitle: 'My Course', category: 'Web' });
    assert.equal(created.status, 201);
    const courseId = created.body.course._id;

    const attacker = request.agent(app);
    await registerUser(attacker, { name: 'Evil', email: 'evil1@test.com', role: 'instructor' });

    const edit = await attacker
        .put(`/api/v1/course/${courseId}`)
        .send({ courseTitle: 'Defaced' });
    assert.equal(edit.status, 403);

    const del = await attacker.delete(`/api/v1/course/${courseId}`);
    assert.equal(del.status, 403);

    const patch = await attacker.patch(`/api/v1/course/${courseId}?publish=true`);
    assert.equal(patch.status, 403);

    const lecture = await attacker
        .post(`/api/v1/course/${courseId}/lecture`)
        .send({ lectureTitle: 'Injected lecture' });
    assert.equal(lecture.status, 403);

    // course untouched
    const course = await Course.findById(courseId);
    assert.equal(course.courseTitle, 'My Course');
    assert.equal(course.isPublished, false);
    assert.equal(course.lectures.length, 0);
});

test('instructor cannot remove another instructor\'s lecture', async () => {
    const owner = request.agent(app);
    await registerUser(owner, { name: 'Owner2', email: 'owner2@test.com', role: 'instructor' });
    const created = await owner
        .post('/api/v1/course')
        .send({ courseTitle: 'Course A', category: 'Web' });
    const courseId = created.body.course._id;
    const lec = await owner
        .post(`/api/v1/course/${courseId}/lecture`)
        .send({ lectureTitle: 'Lecture 1' });
    const lectureId = lec.body.lecture._id;

    const attacker = request.agent(app);
    await registerUser(attacker, { name: 'Evil2', email: 'evil2@test.com', role: 'instructor' });

    const res = await attacker.delete(`/api/v1/course/lecture/${lectureId}`);
    assert.equal(res.status, 403);
});

test('unauthenticated requests to media upload are rejected', async () => {
    const res = await request(app)
        .post('/api/v1/media/upload-video')
        .attach('file', Buffer.from('fake'), 'video.mp4');
    assert.equal(res.status, 401);
});

// ---------------------------------------------------------
// Purchase / payment authorization
// ---------------------------------------------------------
test('pending purchase does not grant course access', async () => {
    const owner = request.agent(app);
    await registerUser(owner, { name: 'Owner3', email: 'owner3@test.com', role: 'instructor' });
    const created = await owner
        .post('/api/v1/course')
        .send({ courseTitle: 'Paid Course', category: 'Web' });
    const courseId = created.body.course._id;

    const buyer = request.agent(app);
    await registerUser(buyer, { name: 'Buyer', email: 'buyer1@test.com' });
    const buyerUser = await User.findOne({ email: 'buyer1@test.com' });

    // simulate an abandoned checkout: purchase record stuck at pending
    await CoursePurchase.create({
        course: courseId,
        userId: buyerUser._id,
        amount: 499,
        status: 'pending',
        paymentId: 'cs_test_pending_1',
    });

    const res = await buyer.get(`/api/v1/purchase/course/${courseId}/detail-with-status`);
    assert.equal(res.status, 200);
    assert.equal(res.body.purchased, false, 'pending purchase must not unlock the course');

    // and a completed one must
    await CoursePurchase.updateOne({ paymentId: 'cs_test_pending_1' }, { status: 'completed' });
    const res2 = await buyer.get(`/api/v1/purchase/course/${courseId}/detail-with-status`);
    assert.equal(res2.body.purchased, true);
});

test('verifyPayment enrolls the purchase owner, not the caller', async (t) => {
    const owner = request.agent(app);
    await registerUser(owner, { name: 'Owner4', email: 'owner4@test.com', role: 'instructor' });
    const created = await owner
        .post('/api/v1/course')
        .send({ courseTitle: 'Victim Course', category: 'Web' });
    const courseId = created.body.course._id;

    const buyer = request.agent(app);
    await registerUser(buyer, { name: 'RealBuyer', email: 'buyer2@test.com' });
    const buyerUser = await User.findOne({ email: 'buyer2@test.com' });

    const attacker = request.agent(app);
    await registerUser(attacker, { name: 'Freeloader', email: 'evil3@test.com' });
    const attackerUser = await User.findOne({ email: 'evil3@test.com' });

    await CoursePurchase.create({
        course: courseId,
        userId: buyerUser._id,
        amount: 499,
        status: 'pending',
        paymentId: 'cs_test_verify_1',
    });

    // stub the Stripe lookup to claim the session is paid
    const originalRetrieve = stripe.checkout.sessions.retrieve;
    stripe.checkout.sessions.retrieve = async () => ({ id: 'cs_test_verify_1', payment_status: 'paid' });
    t.after(() => { stripe.checkout.sessions.retrieve = originalRetrieve; });

    // attacker tries to verify someone else's session: rejected, nobody enrolled
    const evilRes = await attacker
        .post('/api/v1/purchase/verify-payment')
        .send({ sessionId: 'cs_test_verify_1' });
    assert.equal(evilRes.status, 403);

    let fresh = await User.findById(attackerUser._id);
    assert.equal(fresh.enrolledCourses.length, 0, 'attacker must not be enrolled');
    fresh = await User.findById(buyerUser._id);
    assert.equal(fresh.enrolledCourses.length, 0, 'attacker attempt must not complete the purchase');

    // the real buyer verifies: the buyer gets enrolled
    const okRes = await buyer
        .post('/api/v1/purchase/verify-payment')
        .send({ sessionId: 'cs_test_verify_1' });
    assert.equal(okRes.status, 200);

    fresh = await User.findById(buyerUser._id);
    assert.equal(fresh.enrolledCourses.map(String).includes(courseId), true, 'buyer must be enrolled');
});

test('course creator has access without a purchase', async () => {
    const owner = request.agent(app);
    await registerUser(owner, { name: 'Owner5', email: 'owner5@test.com', role: 'instructor' });
    const created = await owner
        .post('/api/v1/course')
        .send({ courseTitle: 'Creator Access', category: 'Web' });
    const courseId = created.body.course._id;

    const res = await owner.get(`/api/v1/purchase/course/${courseId}/detail-with-status`);
    assert.equal(res.status, 200);
    assert.equal(res.body.purchased, true, 'creator sees their own course');
});

test('video upload signing is owner-only and respects provider size cap, not duration', async () => {
    const {v2: cloudinary} = await import('cloudinary');
    const originalUsage = cloudinary.api.usage;
    cloudinary.api.usage = async () => ({media_limits:{video_max_size_bytes:104857600}});
    process.env.API_SECRET = 'upload-test-secret';
    process.env.API_KEY = 'upload-test-key';
    process.env.CLOUD_NAME = 'upload-test-cloud';
    try {
        const owner = request.agent(app);
        await registerUser(owner, {name:'Video Owner',email:'video-owner@test.com',role:'instructor'});
        const created = await owner.post('/api/v1/course').send({courseTitle:'Video test',category:'Frontend'});
        const lecture = await owner.post(`/api/v1/course/${created.body.course._id}/lecture`).send({lectureTitle:'Long video'});
        const id = lecture.body.lecture._id;
        assert.equal((await request(app).post(`/api/v1/media/video-upload-signature/${id}`).send({size:1})).status,401);
        const student = request.agent(app);
        await registerUser(student,{name:'Video Student',email:'video-student@test.com'});
        assert.equal((await student.post(`/api/v1/media/video-upload-signature/${id}`).send({size:1})).status,403);
        const other = request.agent(app);
        await registerUser(other,{name:'Other Instructor',email:'other-video@test.com',role:'instructor'});
        assert.equal((await other.post(`/api/v1/media/video-upload-signature/${id}`).send({size:1})).status,403);
        const config = await owner.get(`/api/v1/media/video-upload-config/${id}`);
        assert.equal(config.body.maxBytes,104857600);
        const signed = await owner.post(`/api/v1/media/video-upload-signature/${id}`).send({size:41943040,duration:86400});
        assert.equal(signed.status,200);
        assert.ok(signed.body.signature);
        assert.equal(signed.body.apiKey,'upload-test-key');
        assert.equal(JSON.stringify(signed.body).includes('upload-test-secret'),false);
        assert.equal((await owner.post(`/api/v1/media/video-upload-signature/${id}`).send({size:104857601})).status,413);
        assert.equal((await owner.post(`/api/v1/media/video-upload-signature/${id}`).send({size:0})).status,400);
    } finally {cloudinary.api.usage = originalUsage;}
});

test('social likes are idempotent, comments are plain text and author-only',async()=>{
 const a=request.agent(app),b=request.agent(app);
 const ar=await registerUser(a,{name:'Social A',email:'sociala@test.com'});
 await registerUser(b,{name:'Social B',email:'socialb@test.com'});
 const c=await Course.create({courseTitle:'Social course',category:'Frontend',isPublished:true});
 const url=`/api/v1/course/social/${c._id}`;
 assert.equal((await request(app).put(`${url}/like`).send({liked:true})).status,401);
 for(let k=0;k<2;k++)assert.equal((await a.put(`${url}/like`).send({liked:true})).body.likeCount,1);
 assert.equal((await a.put(`${url}/like`).send({liked:false})).body.likeCount,0);
 assert.equal((await a.post(`${url}/comments`).send({text:'   '})).status,400);
 assert.equal((await a.post(`${url}/comments`).send({text:'x'.repeat(1001)})).status,400);
 const r=await a.post(`${url}/comments`).send({text:'<script>alert(1)</script> demo discussion'});
 assert.equal(r.status,201);assert.equal(r.body.comment.text,'<script>alert(1)</script> demo discussion');
 const id=r.body.comment._id;
 assert.equal((await b.delete(`/api/v1/course/comments/${id}`)).status,403);
 assert.equal((await a.delete(`/api/v1/course/comments/${id}`)).status,200);
 const state=await a.get(`${url}/mine`);assert.equal(state.body.commentCount,0);
});

test('discovery ranking, pagination, demo exclusion and literal regex search',async()=>{
 const base='ranking-unique';
 await Course.insertMany([{courseTitle:`${base} [A]`,category:'Python',isPublished:true,likeCount:10,commentCount:1,isDemo:true},{courseTitle:`${base} B`,category:'Python',isPublished:true,likeCount:1,commentCount:15},{courseTitle:`${base} C`,category:'Python',isPublished:true,likeCount:4,commentCount:3}]);
 const run=q=>request(app).get(`/api/v1/course/search?query=${base}&${q}`);
 assert.match((await run('sort=liked')).body.courses[0].courseTitle,/\[A\]/);
 assert.match((await run('sort=commented')).body.courses[0].courseTitle,/ B/);
 assert.match((await run('sort=trending')).body.courses[0].courseTitle,/ B/);
 const page=await run('sort=liked&limit=1&page=2');assert.equal(page.body.courses.length,1);assert.equal(page.body.total,3);
 assert.equal((await run('demo=hide')).body.total,2);
 assert.equal((await request(app).get('/api/v1/course/search?query=%5BA%5D')).body.total,1);
 const row=(await run('sort=liked')).body.courses[0];assert.equal(row.likes,undefined);assert.equal(row.enrolledStudents,undefined);
});

test('instructor codes bind email, expire, limit attempts and are single-use',async()=>{
 const {InstructorInvite}=await import('../models/instructorInvite.model.js');
 const {hashInvite,consumeInstructorInvite}=await import('../controllers/invite.controller.js');
 const make=(email,code='654321',expiresAt=new Date(Date.now()+60000))=>InstructorInvite.create({email,codeHash:hashInvite(email,code),expiresAt,sentAt:new Date()});
 await make('one@test.com');
 assert.equal(await consumeInstructorInvite('other@test.com','654321'),false);
 assert.equal(await consumeInstructorInvite('one@test.com','000000'),false);
 assert.equal(await consumeInstructorInvite('one@test.com','654321'),true);
 assert.equal(await consumeInstructorInvite('one@test.com','654321'),false);
 await make('expired@test.com','654321',new Date(Date.now()-1000));assert.equal(await consumeInstructorInvite('expired@test.com','654321'),false);
 await make('attempts@test.com');for(let i=0;i<5;i++)assert.equal(await consumeInstructorInvite('attempts@test.com','000000'),false);
 assert.equal(await consumeInstructorInvite('attempts@test.com','654321'),false);
 await make('race@test.com');const results=await Promise.all([consumeInstructorInvite('race@test.com','654321'),consumeInstructorInvite('race@test.com','654321')]);assert.equal(results.filter(Boolean).length,1);
});

test('invite delivery uses the approved TechLearn sender and text, rejects immediate resend',async()=>{
 const {requestInstructorInvite}=await import('../controllers/invite.controller.js');const {InstructorInvite}=await import('../models/instructorInvite.model.js');
 const oldFetch=global.fetch,oldEnabled=process.env.INSTRUCTOR_EMAIL_ENABLED,oldKey=process.env.BREVO_API_KEY;
 process.env.INSTRUCTOR_EMAIL_ENABLED='true';process.env.BREVO_API_KEY='test-only';let sent;
 global.fetch=async(url,opts)=>{sent={url,...JSON.parse(opts.body)};return {ok:true};};
 const call=async(email)=>{let status=200,body;const res={status(n){status=n;return this;},json(v){body=v;return this;}};await requestInstructorInvite({body:{email}},res);return {status,body};};
 try{assert.equal((await call('invite-test@example.com')).status,200);assert.equal(sent.sender.name,'TechLearn');assert.equal(sent.sender.email,'lakshyayaduvanshi28@gmail.com');assert.equal(sent.subject,'Your TechLearn instructor signup code');assert.match(sent.textContent,/^Your TechLearn instructor signup code is \d{6}\. It expires in 15 minutes and can be used once for this email address\. If you did not request it, ignore this email\.$/);assert.equal((await call('invite-test@example.com')).status,429);const saved=await InstructorInvite.findOne({email:'invite-test@example.com'});assert.match(saved.codeHash,/^[a-f0-9]{64}$/);}
 finally{global.fetch=oldFetch;if(oldEnabled===undefined)delete process.env.INSTRUCTOR_EMAIL_ENABLED;else process.env.INSTRUCTOR_EMAIL_ENABLED=oldEnabled;if(oldKey===undefined)delete process.env.BREVO_API_KEY;else process.env.BREVO_API_KEY=oldKey;}
});
