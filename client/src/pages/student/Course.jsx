import { Card } from "@/components/ui/card";
import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Clock, Star, Users, PlayCircle, BookOpen } from "lucide-react";

const Course = ({ course }) => {
    const instructorName = course?.creator?.name || "Instructor";
    const instructorPhoto = course?.creator?.photoUrl || "";
    const [imageFailed, setImageFailed] = useState(false);
    const thumbnail = !imageFailed && course?.courseThumbnail;

    return (
        <Link to={`/course-detail/${course?._id}`}>
            <Card className="group h-full flex flex-col bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                {/* Thumbnail Section */}
                <div className="relative overflow-hidden">
                    {thumbnail ? <img
                        loading="lazy"
                        onError={() => setImageFailed(true)}
                        src={thumbnail}
                        alt={course?.courseTitle}
                        className="w-full aspect-video object-cover transform group-hover:scale-105 transition-transform duration-500"
                    /> : <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-50 dark:from-indigo-950 dark:to-slate-900">{course.isDemo?<div className="text-center"><BookOpen className="mx-auto h-10 w-10 text-indigo-400"/><p className="mt-3 text-xs font-medium uppercase tracking-widest text-indigo-500">{course.category} · Written lessons</p></div>:<PlayCircle className="h-12 w-12 text-indigo-400"/>}</div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <div className="bg-white/90 dark:bg-gray-800/90 rounded-full p-2">
                            <PlayCircle className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="absolute top-3 right-3">
                        <Badge className="bg-blue-600 text-white font-medium px-3 py-1 rounded-full text-xs shadow-lg">
                            {course?.courseLevel}
                        </Badge>
                    </div>
                </div>

                {course.isDemo && <div className="border-b bg-amber-50 px-4 py-2 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">Demo course · synthetic teacher and activity</div>}
                {/* Content Section */}
                <div className="flex-1 p-4 flex flex-col">
                    {/* Course Title */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {course?.courseTitle}
                    </h3>

                    {/* Subtitle */}
                    {course?.subTitle && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                            {course?.subTitle}
                        </p>
                    )}

                    {/* Instructor Section */}
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                        <Avatar className="h-10 w-10 ring-2 ring-gray-100 dark:ring-gray-700">
                            <AvatarImage src={instructorPhoto} alt={instructorName} />
                            <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold">
                                {instructorName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                                Instructor
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {instructorName}
                            </p>
                        </div>
                    </div>

                    <p className="mb-3 text-xs text-muted-foreground">{course.likeCount || 0} likes · {course.commentCount || 0} comments · {course.enrollmentCount ?? course.enrolledStudents?.length ?? 0} enrolled{course.isDemo ? ' (demo)' : ''}</p>
                    {/* Footer Section */}
                    <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${course?.coursePrice === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                                {course?.coursePrice === 0 ? "Free" : `₹${Number(course?.coursePrice || 0).toLocaleString("en-IN")}`}
                            </span>
                        </div>
                        <span className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg">
                            View Course
                        </span>
                    </div>
                </div>
            </Card>
        </Link>
    );
};

export default Course;
