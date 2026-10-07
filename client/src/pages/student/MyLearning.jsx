import React from "react";
import PageState from "@/components/PageState";
import Course from "./Course";
import { useLoadUserQuery } from "@/features/api/authApi";
import { BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const MyLearning = () => {
    const { data, isLoading, isError, refetch } = useLoadUserQuery();
    const myLearningCourses = data?.user?.enrolledCourses || [];

    if (isError) return <div className="mx-auto max-w-4xl p-6"><PageState error title="Your learning couldn't load" description="Please try again in a moment." onRetry={refetch} /></div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                            <GraduationCap className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                My Learning
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Track your progress and continue learning
                            </p>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    {!isLoading && myLearningCourses.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <BookOpen className="w-5 h-5 text-blue-500" />
                                <span className="text-gray-600 dark:text-gray-300 font-medium">
                                    {myLearningCourses.length} {myLearningCourses.length === 1 ? 'Course' : 'Courses'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">
                                    {myLearningCourses.filter(c => c.coursePrice === 0).length} Free
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                {isLoading ? (
                    <MyLearningSkeleton />
                ) : myLearningCourses.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {myLearningCourses.map((course) => (
                            <Course key={course._id} course={course} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Empty State Component
const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <BookOpen className="w-16 h-16 text-blue-600 dark:text-blue-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
            Start Your Learning Journey
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-8">
            You haven't enrolled in any courses yet. Explore our catalog and find the perfect course to begin your learning adventure.
        </p>
        <Link
            to="/course/search"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
            Explore Courses
            <ArrowRight className="w-5 h-5" />
        </Link>
    </div>
);

// Skeleton Loader Component
const MyLearningSkeleton = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
                <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                    <div className="h-40 bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    <div className="p-4 space-y-3">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                        </div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
                        <div className="flex justify-between items-center">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MyLearning;