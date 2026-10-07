import PageState from '@/components/PageState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import {
    useCompleteCourseMutation,
    useGetCourseProgressQuery,
    useIncompleteCourseMutation,
    useUpdateLectureProgressMutation
} from '@/features/api/courseProgressApi'
import { useVerifyPaymentMutation } from '@/features/api/purchaseApi'
import { CheckCircle, CheckCircle2, CirclePlay } from 'lucide-react'
import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const CourseProgress = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    // ✅ All hooks MUST be at the top, before any conditional returns
    const { data, isLoading, isError, refetch } =
        useGetCourseProgressQuery(courseId);
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const hasVerifiedPayment = useRef(false);

    const [updateLectureProgress] = useUpdateLectureProgressMutation();

    const [
        completeCourse,
        { data: markCompleteData, isSuccess: completedSuccess, isLoading: completing }
    ] = useCompleteCourseMutation();

    const [
        inCompleteCourse,
        { data: markInCompleteData, isSuccess: inCompletedSuccess, isLoading: incompleting }
    ] = useIncompleteCourseMutation();

    const [verifyPayment, { isLoading: isVerifyingPayment }] = useVerifyPaymentMutation();

    const [currentLecture, setCurrentLecture] = useState(null);
    const [completedLectures, setCompletedLectures] = useState([]);

    // ✅ Compute derived values with useMemo BEFORE early returns
    const courseDetails = data?.data?.courseDetails;
    const progress = data?.data?.progress || [];
    const completed = data?.data?.completed || false;
    const courseTitle = courseDetails?.courseTitle;
    const lectures = courseDetails?.lectures || [];

    // Get current lecture - prefer explicit state over derived
    const currentLectureId = currentLecture?._id || (lectures.length > 0 ? lectures[0]?._id : null);

    // ✅ lecture completed checker - using useMemo for performance
    const completedLectureIds = useMemo(() => {
        const ids = new Set(completedLectures);
        if (progress) {
            progress.forEach((prog) => {
                if (prog.viewed) {
                    ids.add(prog.lectureId?._id || prog.lectureId);
                }
            });
        }
        return ids;
    }, [completedLectures, progress]);

    // ✅ check ALL lectures completed
    const allLecturesCompleted = useMemo(() => {
        if (!lectures || lectures.length === 0) return false;
        return lectures.every((lec) => completedLectureIds.has(lec._id));
    }, [lectures, completedLectureIds]);

    const lectureIndex = useMemo(() => {
        if (!currentLectureId || !lectures.length) return 0;
        return lectures.findIndex((lec) => lec._id === currentLectureId);
    }, [lectures, currentLectureId]);

    // ✅ Reset local state when course changes
    useEffect(() => {
        setCompletedLectures([]);
        setCurrentLecture(null);
    }, [courseId]);

    // ✅ Verify payment after Stripe redirect (only once)
    useEffect(() => {
        const handleVerifyPayment = async () => {
            // Only verify once per session
            if (sessionId && !hasVerifiedPayment.current && !isVerifyingPayment) {
                hasVerifiedPayment.current = true;
                try {
                    await verifyPayment({ sessionId, courseId }).unwrap();
                    toast.success('Payment verified! You are now enrolled.');
                    // Remove session_id from URL to prevent re-verification on refresh
                    navigate(`/course-progress/${courseId}`, { replace: true });
                    refetch();
                } catch (error) {
                    console.error('Payment verification error:', error);
                    toast.error('Payment verification failed. Please contact support.');
                }
            }
        };
        handleVerifyPayment();
    }, [sessionId, courseId, navigate, refetch, verifyPayment, isVerifyingPayment]);

    // ✅ Initialize current lecture when data loads
    useEffect(() => {
        if (lectures.length > 0 && !currentLecture) {
            setCurrentLecture(lectures[0]);
        }
    }, [lectures]); // Remove currentLecture dependency to avoid circular dependency

    // ✅ success handling
    useEffect(() => {
        if (completedSuccess && markCompleteData) {
            toast.success(markCompleteData.message);
            refetch();
        }
    }, [completedSuccess, markCompleteData, refetch]);

    useEffect(() => {
        if (inCompletedSuccess && markInCompleteData) {
            toast.success(markInCompleteData.message);
            refetch();
        }
    }, [inCompletedSuccess, markInCompleteData, refetch]);

    // ✅ Now we can do conditional returns AFTER all hooks
    if (isLoading) return <div className="p-6"><PageState loading title="Loading your progress" /></div>;
    if (isError || !data) return <div className="p-6"><PageState error title="Your progress couldn't load" onRetry={refetch} /></div>;
    if (!courseDetails) return <h1>Course not found</h1>;
    if (!lectures || lectures.length === 0) return <h1>No lectures available</h1>;

    // ✅ Helper functions
    const isLectureCompleted = (lectureId) => {
        return completedLectureIds.has(lectureId);
    };

    const handleSelectLecture = (lecture) => {
        setCurrentLecture(lecture);
    };

    // ✅ mark lecture complete
    const handleLectureProgress = async (lectureId) => {
        if (isLectureCompleted(lectureId)) return;

        // instant UI update
        setCompletedLectures((prev) =>
            prev.includes(lectureId) ? prev : [...prev, lectureId]
        );

        try {
            await updateLectureProgress({ courseId, lectureId }).unwrap();
            await refetch();
        } catch (error) {
            console.error('Error updating lecture progress:', error);
            toast.error('Failed to update progress');
        }
    };

    // ✅ complete course
    const handleCompleteCourse = async () => {
        if (completing) return;

        try {
            await completeCourse(courseId).unwrap();
        } catch (err) {
            console.error('Error completing course:', err);
            toast.error('Failed to complete course');
        }
    };

    // ✅ incomplete course
    const handleInCompleteCourse = async () => {
        if (incompleting) return;

        try {
            await inCompleteCourse(courseId).unwrap();
        } catch (err) {
            console.error('Error marking incomplete:', err);
            toast.error('Failed to update status');
        }
    };

    return (
        <div className='max-w-7xl mx-auto p-4 mt-20'>
            {/* Header */}
            <div className='flex justify-between mb-4'>
                <h1 className='text-2xl font-bold'>{courseTitle}</h1>

                <Button
                    disabled={
                        completing ||
                        incompleting ||
                        (!completed && !allLecturesCompleted)
                    }
                    variant={completed ? 'outline' : 'default'}
                    className='flex items-center gap-2'
                    onClick={
                        completed
                            ? handleInCompleteCourse
                            : handleCompleteCourse
                    }
                >
                    {completed ? (
                        <>
                            <CheckCircle className='text-green-500' />
                            Completed
                        </>
                    ) : completing ? (
                        "Marking..."
                    ) : (
                        "Mark As Completed"
                    )}
                </Button>
            </div>

            <div className='flex flex-col md:flex-row gap-6'>
                {/* Video Section */}
                <div className='flex-1 md:w-3/5 rounded-lg shadow-lg p-4'>
                    {currentLecture?.videoUrl ? (
                        <video
                            src={currentLecture.videoUrl}
                            controls
                            className='w-full rounded-lg'
                            onEnded={() => handleLectureProgress(currentLecture._id)}
                        />
                    ) : (
                        <div className='w-full h-64 bg-gray-900 flex items-center justify-center rounded-lg'>
                            <p className='text-gray-400'>{currentLecture?.content ? 'Written lesson below' : 'No video available'}</p>
                        </div>
                    )}

                    {currentLecture?.content && <article className="my-5 rounded-xl border bg-card p-5"><p className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-300">{currentLecture.isDemo ? 'Written demo lesson' : 'Lesson notes'}</p><div className="whitespace-pre-wrap text-sm leading-7">{currentLecture.content}</div></article>}
                    <div className='mt-2'>
                        <h3 className='font-medium text-lg'>
                            Lecture {lectureIndex >= 0 ? lectureIndex + 1 : 1} :{" "}
                            {currentLecture?.lectureTitle || 'No Title'}
                        </h3>
                    </div>
                </div>

                {/* Sidebar */}
                <div className='flex flex-col w-full md:w-2/5 border-t md:border-l border-gray-200 md:pl-4 pt-4'>
                    <h2 className='font-semibold text-xl mb-4'>
                        Course Lectures
                    </h2>

                    <div className='flex-1 overflow-y-auto'>
                        {courseDetails.lectures.map((lecture) => {
                            const isCompleted = isLectureCompleted(lecture._id);

                            return (
                                <Card
                                    key={lecture._id}
                                    className={`mb-3 cursor-pointer transition-colors ${lecture._id === currentLectureId
                                        ? 'bg-gray-200 dark:bg-gray-700'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                    onClick={() => handleSelectLecture(lecture)}
                                >
                                    <CardContent className='flex items-center justify-between p-4'>
                                        <div className='flex items-center'>
                                            {isCompleted ? (
                                                <CheckCircle2 className='text-green-500 mr-2' />
                                            ) : (
                                                <CirclePlay className='text-gray-500 mr-2' />
                                            )}

                                            <CardTitle className='text-sm font-medium'>
                                                {lecture.lectureTitle || 'Untitled Lecture'}
                                            </CardTitle>
                                        </div>

                                        <Badge
                                            variant='outline'
                                            className={
                                                isCompleted
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-600"
                                            }
                                        >
                                            {isCompleted
                                                ? "Completed"
                                                : "Not Completed"}
                                        </Badge>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseProgress;
