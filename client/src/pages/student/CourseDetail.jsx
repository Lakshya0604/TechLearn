import CourseCommunity from "@/components/CourseCommunity";
import PageState from '@/components/PageState';
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
    const { data, isLoading, isError, refetch } = useGetCourseDetailWithStatusQuery(courseId);
    const navigate = useNavigate();
    if (isLoading) {
        return <div className="mx-auto max-w-5xl p-6"><PageState loading title="Loading course details" /></div>;
    }
    if (isError) {
        return <div className="mx-auto max-w-5xl p-6"><PageState error title="Course details couldn't load" onRetry={refetch} /></div>;
    }

    const { course, purchased } = data || {};

    if (!course) {
        return <div className="mx-auto max-w-5xl p-6"><PageState title="Course not found" description="It may no longer be available." /></div>;
    }


    const handleContinueCourse = () => {
        navigate(`/course-progress/${courseId}`);
    };


    return (
        <div className='space-y-5 pb-12'>
            <div className='bg-[#2D2F31] text-white '>
                <div className='max-w-7xl mx-auto py-8 px-4 md:px-8 flex flex-col gap-2 '>
                    <h1 className='font-bold text-2xl md:text-3xl'>
                        {course.courseTitle}
                    </h1>
                    <p className='text-base md:text-lg'>
                        {course?.subTitle || course?.description?.substring(0, 100)}
                    </p>
                    <p>
                        Created by{""} <span className='text-orange-500 underline italic   text-sm md:text-base'> {course.creator?.name || 'Unknown'}</span>
                    </p>
                    <div className='flex items-center gap-2 text-sm'>
                        <BadgeInfo size='16' />
                        <p>Last updated: {course?.updatedAt?.split("T")[0] || course?.createdAt?.split("T")[0]}</p>
                    </div>
                    <p>Students enrolled: {course?.enrolledStudents?.length || 0}</p>
                </div>
            </div>
            <div className='max-w-7xl mx-auto my-5 px-4 md:px-8 flex flex-col lg:flex-row justify-between gap-4'>
                <div className='w-full lg:w-1/2 space-y-5'>
                    {course.isDemo && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">Synthetic demo course. Teacher, enrollments, likes and seeded comments are demonstration data.</p>}
                    <h1 className='font-bold text-xl md:text-2xl'>Description</h1>
                    <p className='text-sm' dangerouslySetInnerHTML={{ __html: course.description === "undefined" ? "" : course.description }} />
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Content</CardTitle>
                            <CardDescription>{course.lectures?.length || 0} Lectures</CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-3'>
                            {
                                course.lectures?.map((lecture) => (
                                    <div key={lecture._id} className='flex items-center gap-3 p-4 bg-muted rounded-lg'>
                                        <span>
                                            {
                                                lecture.isPreviewFree || purchased ? (<PlayCircle />) : <Lock size='16' />
                                            }
                                        </span>
                                        <p>{lecture.lectureTitle}</p>
                                    </div>
                                ))
                            }
                        </CardContent>
                    </Card>
                    <CourseCommunity courseId={courseId} />
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
                                        <div className='text-muted-foreground'>Course preview not available
                                            <Video size='48' className='mx-auto mt-4' />

                                        </div>
                                    )
                                }
                            </div><h1>Course title: <span className='text-orange-500 text-lg font-semibold'>{course.courseTitle}</span></h1>

                            <Separator className='my-2' />
                            <h1 className='text-lg md:text-xl font-semibold'>Price: <span className='text-green-400'>₹{course?.coursePrice}</span></h1>
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
