import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import CourseTab from './CourseTab'

const EditCourse = () => {

    return (
        <div className='flex-1'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 '>
                <h1 className='font-bold text-xl'>Edit course details</h1>
                <Link to='lecture'>
                    <Button className="hover:text-blue-300">Manage lectures</Button>
                </Link>

            </div>
            <CourseTab></CourseTab>
        </div>

    )
}

export default EditCourse