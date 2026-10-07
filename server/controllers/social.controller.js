import {Course} from '../models/course.model.js';
import {CourseComment} from '../models/courseComment.model.js';
import mongoose from 'mongoose';
export const socialState = async (req,res) => {
    if(!mongoose.isValidObjectId(req.params.courseId)) return res.status(400).json({message:'Invalid course'});
    const course = await Course.findOne({_id:req.params.courseId,isPublished:true}).select('likes likeCount commentCount isDemo');
    if(!course) return res.status(404).json({message:'Course not found'});
    const comments = await CourseComment.find({course:course._id}).sort({createdAt:-1}).limit(50).populate('user','name isDemo');
    res.json({likeCount:course.likes.length,commentCount:await CourseComment.countDocuments({course:course._id}),comments,liked:req.id ? course.likes.some(id=>id.toString()===req.id):false,isDemo:course.isDemo});
};
export const likeCourse = async(req,res) => {
    if(!mongoose.isValidObjectId(req.params.courseId)) return res.status(400).json({message:'Invalid course'});
    if(typeof req.body.liked!=='boolean') return res.status(400).json({message:'Choose liked or unliked'});
    const course=await Course.findOneAndUpdate({_id:req.params.courseId,isPublished:true},req.body.liked?{$addToSet:{likes:req.id}}:{$pull:{likes:req.id}},{returnDocument:'after'});
    if(!course) return res.status(404).json({message:'Course not found'});
    await Course.updateOne({_id:course._id},[{$set:{likeCount:{$size:{$ifNull:['$likes',[]]}}}}],{updatePipeline:true});
    res.json({liked:req.body.liked,likeCount:course.likes.length});
};
export const addComment = async(req,res) => {
    if(!mongoose.isValidObjectId(req.params.courseId)) return res.status(400).json({message:'Invalid course'});
    const text=typeof req.body.text==='string'?req.body.text.trim():'';
    if(!text || text.length>1000) return res.status(400).json({message:'Write a comment between 1 and 1000 characters'});
    const course=await Course.findOne({_id:req.params.courseId,isPublished:true});
    if(!course) return res.status(404).json({message:'Course not found'});
    const comment=await CourseComment.create({course:course._id,user:req.id,text});
    await Course.updateOne({_id:course._id},{$inc:{commentCount:1}});
    res.status(201).json({comment:await comment.populate('user','name isDemo')});
};
export const removeComment = async(req,res) => {
    if(!mongoose.isValidObjectId(req.params.commentId)) return res.status(400).json({message:'Invalid comment'});
    const comment=await CourseComment.findById(req.params.commentId);
    if(!comment) return res.status(404).json({message:'Comment not found'});
    if(comment.user.toString()!==req.id) return res.status(403).json({message:'Only the author can delete this comment'});
    const deleted=await CourseComment.deleteOne({_id:comment._id,user:req.id});
    if(!deleted.deletedCount)return res.status(404).json({message:'Comment not found'});
    await Course.updateOne({_id:comment.course,commentCount:{$gt:0}},{$inc:{commentCount:-1}});
    res.json({success:true});
};
