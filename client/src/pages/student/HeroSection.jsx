import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const searchHandler = (e) => {
        e.preventDefault();
        if (searchQuery.trim() !== "") {
            navigate(`/course/search?query=${searchQuery}`)
        }
        setSearchQuery("");
    }
    return (
        <div className='relative bg-gradient-to-r from-blue-500 to bg-indigo-600 dark:from-gray-800 dark:to-gray-900 py-16 px-4 '>
            <div className='max-w-3xl mx-auto justify-center
             items-center text-center flex flex-col'>
                <h1 className='text-4xl  font-bold text-white mb-4'>Find the perfect course for you</h1>
                <p className=' text-gray-200 dark:text-gray-400 mb-8'>Discover a world of knowledge at your fingertips. Join us today and start learning!</p>
                <form onSubmit={searchHandler} className='flex flex-col sm:flex-row gap-4 items-center justify-center dark:bg-gray-800 ' >
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for courses..."
                        className="flex-1 py-3 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <button type='submit' className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300">Search</button>
                </form>
                <button onClick={() => navigate(`/course/search?query`)} className="mt-8 bg-white dark:bg-gray-700 hover:bg-gray-100 text-gray-800 font-bold py-3 px-6 rounded-full shadow-lg transition duration-300
                ">Explore Course</button>
            </div>

        </div>

    )
}

export default HeroSection;