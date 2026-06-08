import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import { ChartNoAxesColumn, SquareLibrary } from 'lucide-react'

const Sidebar = () => {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <div className='hidden lg:block w-[250px] sm:w-[300px] space-y-8 border-r border-gray-300 dark:border-gray-700 dark:p-5 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto transition-colors duration-300'>
                <div className='mt-20'>
                    <Link
                        to="dashboard"
                        className='flex items-center gap-2 text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 px-3 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800'
                    >
                        <ChartNoAxesColumn size={22} className="text-gray-600 dark:text-gray-400" />
                        <h1 className="font-medium">Dashboard</h1>
                    </Link>

                    <Link
                        to="course"
                        className='flex items-center gap-2 mt-4 text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 px-3 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800'
                    >
                        <SquareLibrary size={22} className="text-gray-600 dark:text-gray-400" />
                        <h1 className="font-medium">Courses</h1>
                    </Link>
                </div>
            </div>

            {/* Page content */}
            <div className="flex-1 md:p-20 p-6 bg-white dark:bg-gray-950 transition-colors duration-300">
                <Outlet />
            </div>
        </div>
    )
}

export default Sidebar
