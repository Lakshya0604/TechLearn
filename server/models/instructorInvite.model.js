import mongoose from 'mongoose';
const schema=new mongoose.Schema({email:{type:String,unique:true,required:true},codeHash:{type:String,required:true},expiresAt:{type:Date,required:true},attempts:{type:Number,default:0},sentAt:{type:Date,required:true}},{timestamps:true});
schema.index({expiresAt:1},{expireAfterSeconds:0});
export const InstructorInvite=mongoose.model('InstructorInvite',schema);
