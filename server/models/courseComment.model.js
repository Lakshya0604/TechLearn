import mongoose from 'mongoose';
const schema = new mongoose.Schema({course:{type:mongoose.Schema.Types.ObjectId,ref:'Course',required:true,index:true},user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},text:{type:String,required:true,maxlength:1000},isDemo:{type:Boolean,default:false}},{timestamps:true});
export const CourseComment = mongoose.model('CourseComment',schema);
