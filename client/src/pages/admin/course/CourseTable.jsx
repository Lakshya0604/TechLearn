import React from 'react';
import PageState from '@/components/PageState';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

import {
    useGetCreatorCourseQuery,
    useDeleteCourseMutation,
} from '@/features/api/courseApi';

const CourseTable = () => {
    const navigate = useNavigate();

    const { data, isLoading, isError, refetch } = useGetCreatorCourseQuery();
    const [deleteCourse, { isLoading: isDeleting }] =
        useDeleteCourseMutation();

    const handleDelete = async (courseId) => {
        if (!window.confirm("Delete this course? This cannot be undone.")) return;
        try {
            const response = await deleteCourse(courseId).unwrap();

            toast.success(
                response?.message || 'Course deleted successfully'
            );
        } catch (error) {
            console.error(error);

            toast.error(
                error?.data?.message || 'Failed to delete course'
            );
        }
    };

    if (isLoading) {
        return <PageState loading title="Loading your courses" />;
    }

    if (isError) return <PageState error title="Your courses couldn't load" onRetry={refetch} />;
    return (
        <div>
            <Button onClick={() => navigate('create')}>
                Create a New Course
            </Button>

            <Table>
                <TableCaption>
                    A list of your recent courses.
                </TableCaption>

                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">
                            Price
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead className="text-right">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {data?.courses?.length > 0 ? (
                        data.courses.map((course) => (
                            <TableRow key={course._id}>
                                <TableCell className="font-medium">
                                    {course.coursePrice == null ? "Not set" : `₹${course.coursePrice}`}
                                </TableCell>

                                <TableCell>
                                    <Badge>
                                        {course.isPublished
                                            ? 'Published'
                                            : 'Draft'}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    {course.courseTitle}
                                </TableCell>

                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            size="sm"
                                            aria-label={`Edit ${course.courseTitle}`}
                                            variant="ghost"
                                            onClick={() =>
                                                navigate(`${course._id}`)
                                            }
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            size="sm"
                                            aria-label={`Delete ${course.courseTitle}`}
                                            variant="destructive"
                                            disabled={isDeleting}
                                            onClick={() =>
                                                handleDelete(course._id)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={4}
                                className="text-center"
                            >
                                No courses found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default CourseTable;