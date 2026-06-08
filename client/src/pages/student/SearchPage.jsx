import Filter from './Filter'
import React, { useState } from 'react'
import SearchResult from './SearchResult';
import { useGetSearchCourseQuery } from '@/features/api/courseApi';
import { useSearchParams } from 'react-router-dom';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("query");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [shortByPrice, setShortByPrice] = useState("");
    const { data, isLoading } = useGetSearchCourseQuery({
        searchQuery: query,
        categories: selectedCategories,
        shortByPrice
    });

    const isEmpty = !isLoading && data?.courses.length === 0;

    const handleFilterChange = (categories, price) => {
        setSelectedCategories(categories);
        setShortByPrice(price);
    }
    return (
        <div className='max-w-7xl mx-auto p-4 mt-3 md:p-8'>
            <div className='my-6'>
                <h1 className='font-bold text-xl md:text-2xl'>Result for "{query}"</h1>
                <p>
                    Showing results for {""}
                    <span className='text-blue-800 font-bold italic'>{query}</span>
                </p>
            </div>
            <div className='flex flex-col md:flex-row gap-10'>
                <Filter handleFilterChange={handleFilterChange} />
                <div className='flex-1'>
                    {
                        isLoading ? (
                            Array.from({ length: 3 }).map((_, idx) => (
                                <CourseSkeleton key={idx} />)
                            )) : isEmpty ? (<CourseNotFound />) : (
                                data?.courses?.map((course) => (
                                    <SearchResult key={course._id} course={course} />
                                ))
                            )

                    }
                </div>
            </div>
        </div>
    );
};

export default SearchPage

const CourseSkeleton = () => {
    return (
        <div className="flex gap-4 mb-6 animate-pulse">
            {/* Thumbnail */}
            <div className="w-40 h-24 bg-gray-300 rounded-lg"></div>

            {/* Content */}
            <div className="flex flex-col flex-1 gap-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/3"></div>

                <div className="flex gap-2 mt-2">
                    <div className="h-6 w-16 bg-gray-300 rounded"></div>
                    <div className="h-6 w-20 bg-gray-300 rounded"></div>
                </div>
            </div>
        </div>
    );
};

const CourseNotFound = () => {
    return (
        <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-gray-700">
                No courses found
            </h2>
            <p className="text-gray-500 mt-2">
                Try searching with different keywords.
            </p>
        </div>
    );
};