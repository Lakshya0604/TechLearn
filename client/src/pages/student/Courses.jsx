import {Link} from 'react-router-dom';
import Course from './Course';
import { useGetPublishedCoursesQuery } from '@/features/api/courseApi';
import PageState from '@/components/PageState';
export default function Courses() {
  const { data, isLoading, isError, refetch } = useGetPublishedCoursesQuery();
  return <section id="courses" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-12 sm:px-8 sm:py-16">
    <div className="mb-8"><p className="mb-2 text-xs font-semibold uppercase tracking-[.18em] text-primary">Keep moving forward</p><h2 className="text-3xl font-semibold tracking-tight">Explore courses</h2><p className="mt-2 text-muted-foreground">Trending across the catalog. Demo activity is clearly marked.</p><Link to="/course/search?sort=trending" className="mt-4 inline-block text-sm font-medium text-primary">Explore the full catalog →</Link></div>
    {isError ? <PageState error title="Courses couldn't load" description="Check your connection and try again." onRetry={refetch} /> : isLoading ? <div aria-label="Loading courses" role="status" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({length:4}, (_, i) => <div key={i} className="overflow-hidden rounded-2xl border bg-card"><div className="aspect-video animate-pulse bg-muted" /><div className="space-y-3 p-5"><div className="h-5 w-3/4 animate-pulse rounded bg-muted" /><div className="h-4 w-1/2 animate-pulse rounded bg-muted" /><div className="h-8 animate-pulse rounded bg-muted" /></div></div>)}</div> : data?.courses?.length ? <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{data.courses.map(course => <Course key={course._id} course={course} />)}</div> : <PageState title="New courses are on the way" description="Published courses will appear here. Check back soon to find your next learning project." />}
  </section>;
}
