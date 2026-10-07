import crypto from 'node:crypto';
import {InstructorInvite} from '../models/instructorInvite.model.js';
import {User} from '../models/user.model.js';
export const hashInvite=(email,code)=>crypto.createHmac('sha256',process.env.SECRET_KEY).update(`${email}:${code}`).digest('hex');
export const requestInstructorInvite=async(req,res)=>{
 const email=typeof req.body.email==='string'?req.body.email.trim().toLowerCase():'';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)return res.status(400).json({message:'Enter a valid email address'});
 if(!process.env.BREVO_API_KEY||process.env.INSTRUCTOR_EMAIL_ENABLED!=='true')return res.status(503).json({message:'Instructor email signup is not available yet. Please try again later.'});
 try{
  if(await User.exists({email}))return res.status(400).json({message:'This email already has an account. Please sign in.'});
  const previous=await InstructorInvite.findOne({email});
  if(previous&&Date.now()-previous.sentAt.getTime()<60000)return res.status(429).json({message:'Please wait one minute before requesting another code'});
  const code=crypto.randomInt(100000,1000000).toString();
  const invite=await InstructorInvite.findOneAndUpdate({email},{$set:{codeHash:hashInvite(email,code),expiresAt:new Date(Date.now()+15*60000),sentAt:new Date(),attempts:0}},{upsert:true,returnDocument:'after'});
  const response=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{'api-key':process.env.BREVO_API_KEY,'content-type':'application/json'},body:JSON.stringify({sender:{name:'TechLearn',email:process.env.INSTRUCTOR_EMAIL_FROM||'lakshyayaduvanshi28@gmail.com'},to:[{email}],subject:'Your TechLearn instructor signup code',textContent:`Your TechLearn instructor signup code is ${code}. It expires in 15 minutes and can be used once for this email address. If you did not request it, ignore this email.`}),signal:AbortSignal.timeout(15000)});
  if(!response.ok){await InstructorInvite.deleteOne({_id:invite._id,codeHash:invite.codeHash});return res.status(503).json({message:'Email could not be sent. Please try again shortly.'});}
  res.json({success:true,message:'Your code is on its way. Check your inbox and spam folder. It expires in 15 minutes.'});
 }catch(e){console.error('Instructor email request failed:',e.name);res.status(503).json({message:'Email could not be sent. Please try again shortly.'});}
};
export async function consumeInstructorInvite(email,code){
 if(typeof code!=='string'||!/^\d{6}$/.test(code))return false;
 const invite=await InstructorInvite.findOneAndUpdate({email,expiresAt:{$gt:new Date()},attempts:{$lt:5}},{$inc:{attempts:1}},{returnDocument:'after'});
 if(!invite)return false;
 const wanted=Buffer.from(hashInvite(email,code),'hex'),actual=Buffer.from(invite.codeHash,'hex');
 if(wanted.length!==actual.length||!crypto.timingSafeEqual(wanted,actual))return false;
 return !!(await InstructorInvite.findOneAndDelete({_id:invite._id,codeHash:invite.codeHash}));
}
