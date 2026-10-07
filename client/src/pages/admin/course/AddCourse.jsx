import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useCreateCourseMutation } from '@/features/api/courseApi'
import { toast } from 'sonner'

const AddCourse = () => {
    const [courseTitle, setCourseTitle] = useState("");
    const [category, setCategory] = useState("");

    const [createCourse, { data, isLoading, error, isSuccess }] = useCreateCourseMutation();
    const navigate = useNavigate();


    const getSelectedCategory = (value) => {
        setCategory(value);
    }

    const createCourseHandler = async () => {
        if (!courseTitle.trim() || !category) return toast.error("Add a title and select a category");
        await createCourse({ courseTitle, category });

    };

    //for display message toast

    useEffect(() => {
        if (error) toast.error(error?.data?.message || "Could not create course");
        if (isSuccess) {
            toast.success(data?.message || "course created")
            navigate("/admin/course");
        }


    }, [isSuccess, error])
    return (
        <div className='max-w-2xl rounded-2xl border bg-card p-5 sm:p-8'>
            <div className='mb-4'>
                <h1 className='font-bold text-xl'>
                    Create a new course
                </h1>


            </div>
            <div className='space-y-4'>
                <div className='gap-4'>
                    <Label htmlFor="course-title">Course title</Label>

                    <Input id="course-title" className="mt-2" type="text" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} placeholder='Your Course Name' />
                </div>
                <div>
                    <Label>
                        Category
                    </Label>
                    <Select onValueChange={getSelectedCategory}>
                        <SelectTrigger className="w-full max-w-48">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Category</SelectLabel>
                                <SelectItem value="Next JS">Next JS</SelectItem>
                                <SelectItem value="Data Science">Data Science</SelectItem>
                                <SelectItem value="AI">AI</SelectItem>
                                <SelectItem value="Frontend">Frontend</SelectItem>
                                <SelectItem value="Backend">Backend</SelectItem>
                                <SelectItem value="Python">Python</SelectItem>
                                <SelectItem value="MongoDB">MongoDB</SelectItem>
                                <SelectItem value="Docker">Docker</SelectItem>
                                <SelectItem value="Java Script">Java Script</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className='flex items-center gap-2'>
                    <Button variant="outline" onClick={() => navigate(`/admin/course`)}>Back</Button>
                    <Button disabled={isLoading} onClick={createCourseHandler}>
                        {
                            isLoading ? (
                                <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />Please wait
                                </>
                            ) : "Create course"

                        }
                    </Button>
                </div>

            </div>
        </div>
    )
}

export default AddCourse