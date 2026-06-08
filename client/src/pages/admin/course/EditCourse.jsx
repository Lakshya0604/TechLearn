import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import CourseTab from './CourseTab'

const EditCourse = () => {

    return (
        <div className='flex-1'>
            <div className='flex items-center justify-between mb-4 '>
                <h1 className='font-bold text-xl'>Add detaile information regarding course</h1>
                <Link to='lecture'>
                    <Button className="hover:text-blue-300">Go to lectures page</Button>
                </Link>

            </div>
            <CourseTab></CourseTab>
        </div>

    )
}

export default EditCourse