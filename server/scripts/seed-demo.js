// Idempotent synthetic catalog. No sends, real credentials, or copied testimonials.
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import fs from 'node:fs';
import {User} from '../models/user.model.js';
import {Course} from '../models/course.model.js';
import {Lecture} from '../models/lecture.model.js';
import {CourseComment} from '../models/courseComment.model.js';
const topics=[
 ['React','Frontend','components, props and state','Build a component with a clear input and a single responsibility. Pass data through props, keep local changes in state, and render a list with stable keys.','Create a task list with an add form and a completed toggle. Keep the input controlled.','Compare component state and derived values. Explain why list keys must stay stable.'],
 ['Python','Python','functions and data structures','Use lists for ordered collections and dictionaries for keyed records. Define functions that take explicit inputs and return values rather than changing global state.','Write a function that groups expenses by category and returns the total for each group.','Handle an empty list and invalid amounts. Test one ordinary case and two edge cases.'],
 ['Node.js APIs','Backend','routing and validation','Give each route one purpose. Validate request data before touching the database and return consistent status codes for success, invalid input and unauthorized access.','Design a task API with create, list and complete routes. Document the request fields.','Add a test proving that one user cannot change another user\'s task.'],
 ['Data Analysis','Data Science','cleaning and summaries','Inspect missing values and types before calculating a result. Separate source data from cleaned data, and write down every assumption you make.','Use a small sales table to calculate revenue by month. Check for duplicated rows first.','Compare the mean and median. Explain how an outlier changes the result.'],
 ['SQL','Backend','queries and relations','Use primary keys to identify rows and foreign keys to connect tables. Select only the fields you need, filter before grouping, and parameterize user inputs.','Design students, courses and enrollments tables. Write a query listing each student\'s courses.','Explain the difference between an inner join and a left join using an empty enrollment.'],
 ['Docker','Docker','images and containers','An image is the packaged application; a container is a running instance. Keep builds repeatable and supply configuration through environment variables.','Write a Dockerfile for a small Node application. Copy the dependency lockfile before the source files.','Explain why secrets should not be baked into image layers.'],
 ['JavaScript','Java Script','arrays and asynchronous code','Use map to transform, filter to select, and reduce to combine values. Await a promise when the next step needs its result, and handle errors at the boundary.','Fetch a list of posts and show loading, empty and error states.','Compare Promise.all with sequential awaits. Describe when each is useful.'],
 ['MongoDB','MongoDB','documents and indexes','Model documents around the reads the app performs. Add indexes for frequently filtered fields and use atomic updates when concurrent requests can change a value.','Create a course collection with creator and published fields. Add an index for public discovery.','Explain the difference between embedding a comment and storing it separately.'],
 ['Accessible CSS','Frontend','layout and responsive design','Start with semantic HTML and a simple layout. Use grid or flexbox for structure, preserve focus indicators, and test long text at narrow widths.','Build a card grid that changes from one to three columns without horizontal overflow.','Test keyboard focus, readable contrast and reduced-motion preferences.'],
 ['AI Fundamentals','AI','data, evaluation and responsible use','Split data into training and evaluation sets before fitting a model. Choose a metric that matches the task and record the limits of your dataset.','Compare precision and recall on a small classification example.','Identify one source of bias and explain how you would check for it.']
];
const first=['Aarav','Diya','Kabir','Meera','Rohan','Ananya','Ishaan','Kavya','Arjun','Nisha'];const last=['Sharma','Verma','Singh','Patel','Gupta','Rao','Das','Mehta','Kapoor','Joshi'];
const uri=process.env.MONGO_URI || fs.readFileSync('/tmp/tl-muri','utf8').trim();
await mongoose.connect(uri);
const password=await bcrypt.hash(crypto.randomBytes(48).toString('hex'),10);
let students=[],teachers=[];
for(let i=0;i<150;i++){
 const role=i<100?'student':'instructor';const n=i<100?i:i-100;
 const demoKey=`techlearn-demo-${role}-${n}`;const t=topics[n%topics.length];
 const u=await User.findOneAndUpdate({demoKey},{$setOnInsert:{demoKey,password,email:`${role}.${n+1}@techlearn-demo.example.com`,name:`${first[n%10]} ${last[Math.floor(n/10)%10]}`,role,isDemo:true,teachingTopic:role==='instructor'?t[0]:undefined}},{upsert:true,returnDocument:'after'});
 (i<100?students:teachers).push(u);
}
for(let i=0;i<50;i++){
 const t=topics[i%10],track=['Foundations','Practice Lab','Problem Solving','Project Workshop','Next Steps'][Math.floor(i/10)];
 const demoKey=`techlearn-demo-course-${i}`;
 let course=await Course.findOneAndUpdate({demoKey},{$set:{isDemo:true,isPublished:true,creator:teachers[i]._id,courseTitle:`${t[0]}: ${track}`,subTitle:`A written demo course covering ${t[2]}.`,description:`<p>Synthetic demonstration course by a demo instructor. Contains written lessons and exercises, not a real paid video course. Topic: ${t[2]}.</p>`,category:t[1],courseLevel:Math.floor(i/10)<2?'Beginner':Math.floor(i/10)<4?'Medium':'Advanced',coursePrice:0},$setOnInsert:{demoKey}},{upsert:true,returnDocument:'after'});
 if(!course.lectures.length){
  const lectures=await Lecture.insertMany([{lectureTitle:`${t[0]} essentials`,content:`Learning goal: understand ${t[2]}.\n\n${t[3]}\n\nTry it: explain the concept in your own words before moving on.`,isDemo:true,isPreviewFree:true},{lectureTitle:`${t[0]} guided exercise`,content:`Practice task\n\n${t[4]}\n\nWork in small steps. Check the output after each change. Keep a short note of what you tried and what you changed.`,isDemo:true,isPreviewFree:true},{lectureTitle:`${t[0]} review and next steps`,content:`Review question\n\n${t[5]}\n\nExtension: create your own variation, add an edge case, and explain your choice. These are synthetic demo lesson notes.`,isDemo:true,isPreviewFree:true}]);course.lectures=lectures.map(l=>l._id);
 }
 const enrolled=Array.from({length:6+(i*7)%35},(_,k)=>students[(i*3+k)%100]._id);const likes=Array.from({length:3+(i*11)%40},(_,k)=>students[(i+k)%100]._id);
 course.enrolledStudents=enrolled;course.likes=likes;course.likeCount=likes.length;
 if(!(await CourseComment.exists({course:course._id,isDemo:true}))){const comments=Array.from({length:1+(i*3)%8},(_,k)=>({course:course._id,user:students[(i+k*7)%100]._id,isDemo:true,text:`Demo discussion prompt ${k+1}: ${k%2===0?t[4]:t[5]}`}));await CourseComment.insertMany(comments);}
 course.commentCount=await CourseComment.countDocuments({course:course._id});await course.save();
 await User.updateMany({_id:{$in:enrolled}},{$addToSet:{enrolledCourses:course._id}});
}
console.log(JSON.stringify({demoStudents:await User.countDocuments({isDemo:true,role:'student'}),demoTeachers:await User.countDocuments({isDemo:true,role:'instructor'}),demoCourses:await Course.countDocuments({isDemo:true}),demoLectures:await Lecture.countDocuments({isDemo:true}),demoComments:await CourseComment.countDocuments({isDemo:true})}));
await mongoose.disconnect();
