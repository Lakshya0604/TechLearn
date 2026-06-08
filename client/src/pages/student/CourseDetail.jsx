import BuyCourseButton from '@/components/BuyCourseButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useGetCourseDetailWithStatusQuery } from '@/features/api/purchaseApi';
import { BadgeInfo, Lock, PlayCircle, Video, VideoIcon } from 'lucide-react';
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom';

const CourseDetail = () => {
    const params = useParams();
    const courseId = params.courseId;
    const { data, isLoading, isError } = useGetCourseDetailWithStatusQuery(courseId);
    const navigate = useNavigate();
    if (isLoading) {
        return <h1>Loading...</h1>;
    }
    if (isError) {
        return <h1>Error loading course details</h1>;
    }

    const { course, purchased } = data || {};

    if (!course) {
        return <h1>Course not found</h1>;
    }


    const handleContinueCourse = () => {
        navigate(`/course-progress/${courseId}`);
    };


    return (
        <div className='mt-20 space-y-5'>
            <div className='bg-[#2D2F31] text-white '>
                <div className='max-w-7xl mx-auto py-8 px-4 md:px-8 flex flex-col gap-2 '>
                    <h1 className='font-bold text-2xl md:text-3xl'>
                        {course.courseTitle}
                    </h1>
                    <p className='text-base md:text-lg'>
                        {course?.subTitle || course?.description?.substring(0, 100)}
                    </p>
                    <p>
                        Created By{""} <span className='text-orange-500 underline italic   text-sm md:text-base'> {course.creator?.name || 'Unknown'}</span>
                    </p>
                    <div className='flex items-center gap-2 text-sm'>
                        <BadgeInfo size='16' />
                        <p>Last updated: {course?.createdAt.split("T")[0]}</p>
                    </div>
                    <p>Student Enrolled : {course?.enrolledStudents.length}</p>
                </div>
            </div>
            <div className='max-w-7xl mx-auto my-5 px-4 md:px-8 flex flex-col lg:flex-row justify-between gap-4'>
                <div className='w-full lg:w-1/2 space-y-5'>
                    <h1 className='font-bold text-xl md:text-2xl'>Description</h1>
                    <p className='text-sm' dangerouslySetInnerHTML={{ __html: course.description }} />
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Content</CardTitle>
                            <CardDescription>{course.lectures?.length || 0} Lectures</CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-3'>
                            {
                                course.lectures?.map((lecture) => (
                                    <div key={lecture._id} className='p-4 bg-gray-100 rounded-lg'>
                                        <span>
                                            {
                                                true ? (<PlayCircle />) : <Lock size='16' />
                                            }
                                        </span>
                                        <p>{lecture.lectureTitle}</p>
                                    </div>
                                ))
                            }
                        </CardContent>
                    </Card>
                </div>
                <div className='w-full lg:w-1/3'>
                    <Card>
                        <CardContent className='p-4 flex flex-col'>
                            <div className='w-full aspect-video mb-4'>
                                {
                                    course?.lectures?.[0]?.videoUrl ? (
                                        <video width="100%" controls>
                                            <source
                                                src={course.lectures[0].videoUrl}
                                                type="video/mp4"
                                            />
                                        </video>
                                    ) : (
                                        <div className='text-muted-foreground'>Video Not Upload
                                            <Video size='48' className='mx-auto mt-20' />

                                        </div>
                                    )
                                }
                            </div><h1>Course Title : <span className='text-orange-500 text-lg font-semibold'>{course.courseTitle}</span></h1>

                            <Separator className='my-2' />
                            <h1 className='text-lg md:text-xl font-semibold'>Course Price : <span className='text-green-400'>₹{course?.coursePrice}</span></h1>
                        </CardContent>
                        <CardFooter className='flex p-4 justify-center'>
                            {
                                purchased ? (
                                    <Button onClick={handleContinueCourse} className='w-full'>Continue Course</Button>
                                ) : (
                                    <BuyCourseButton courseId={courseId} />
                                )
                            }
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default CourseDetail;