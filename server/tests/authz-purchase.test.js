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
