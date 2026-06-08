import React from 'react'
import Course from './Course';
import { useGetPublishedCoursesQuery } from '@/features/api/courseApi';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';




const Courses = () => {
    const { user } = useSelector((state) => state.auth);
    const isInstructor = user?.role === "instructor";
    const { data, isLoading, isError } = useGetPublishedCoursesQuery();
    if (isError) {
        toast.error("Failed to fetch published courses");
    }
    return (
        <div className='max-w-7xl mx-auto py-8 px-4 dark:bg-gray-900 bg-gray-100 min-h-screen '>
            <div className='max-w-2x2 mx-auto py-16 px-4'>
                <h2 className='text-3xl font-bold mb-6'>{isInstructor ? "Your Created Courses" : "Explore Courses"}</h2>
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                    {isLoading ? (
                        Array.from({ length: 8 }).map((_, index) => (
                            <CourseSkeleton key={`skeleton-${index}`} />))
                    ) : (
                        data?.courses?.map((course) => <Course key={course._id} course={course} />)
                    )}
                </div>
            </div>

        </div>
    )
}

export default Courses;

const CourseSkeleton = () => {

    return (
        <div className='animate-pulse flex flex-col gap-4'>
            <div className='h-40 bg-gray-300 rounded mb-4'></div>
            <div className='h-6 bg-gray-300 rounded w-3/4 mb-2'></div>
            <div className='h-6 bg-gray-300 rounded w-1/2 mb-2'></div>
            <div className='h-6 bg-gray-300 rounded w-1/4'></div>
        </div>
    )
}