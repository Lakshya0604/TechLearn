import PageState from '@/components/PageState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateLectureMutation, useGetCourseLectureQuery } from '@/features/api/courseApi'
import { Loader2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import Lecture from './Lecture'

const CreateLecture = () => {
    const [lectureTitle, setLectureTitle] = useState("")
    const params = useParams()
    const courseId = params.courseId
    const navigate = useNavigate()

    const [createLecture, { data, isLoading, isSuccess, error }] = useCreateLectureMutation()
    const { data: lectureData, isLoading: lectureLoading, isError: lectureError, refetch } = useGetCourseLectureQuery(courseId);

    const createLectureHandler = async () => {
        if (!lectureTitle.trim()) {
            toast.error("Lecture title is required")
            return
        }

        await createLecture({ lectureTitle, courseId })
    }

    useEffect(() => {
        refetch();
        if (isSuccess && data) {
            toast.success(data?.message || "Lecture created successfully")
            setLectureTitle("")
        }

        if (error) {
            const errorMessage = error?.data?.message || error?.message || "Failed to create lecture"
            toast.error(errorMessage)
        }
    }, [isSuccess, error, data])


    return (
        <div className='max-w-3xl'>
            <div className='mb-4'>
                <h1 className='font-bold text-xl'>
                    Add a lecture
                </h1>
            </div>

            <div className='space-y-4'>
                <div className='gap-4'>
                    <Label>Title</Label>
                    <Input
                        type="text"
                        value={lectureTitle}
                        onChange={(e) => setLectureTitle(e.target.value)}
                        placeholder='Your lecture title'
                    />
                </div>

                <div className='flex items-center gap-2'>
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/admin/course/${courseId}`)}
                    >
                        Back to Course
                    </Button>

                    <Button disabled={isLoading} onClick={createLectureHandler}>
                        {
                            isLoading ? (
                                <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    Please wait
                                </>
                            ) : "Create Lecture"
                        }
                    </Button>
                </div>
                <div className='mt-10'>
                    {
                        lectureLoading ? (<PageState loading title="Loading lectures" />) : lectureError ? (<PageState error title="Lectures couldn't load" onRetry={refetch} />) : lectureData?.lectures?.length === 0 ? <PageState title="No lectures yet" description="Add the first lecture using the form above." /> :
                            (
                                lectureData.lectures.map((lecture, index) => (<Lecture key={lecture._id} lecture={lecture} courseId={courseId} index={index} />))

                            )
                    }
                </div>
            </div>
        </div>
    )
}

export default CreateLecture
