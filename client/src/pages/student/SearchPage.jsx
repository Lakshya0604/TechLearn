import Filter from './Filter';
import { useState } from 'react';
import Course from './Course';
import PageState from '@/components/PageState';
import { useGetSearchCourseQuery } from '@/features/api/courseApi';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('query') || '';
  const [input, setInput] = useState(query);
  const [categories, setCategories] = useState([]);
  const [price, setPrice] = useState('');
  const {data, isLoading, isError, refetch} = useGetSearchCourseQuery({searchQuery:query,categories,shortByPrice:price});
  return <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
    <h1 className="text-3xl font-semibold tracking-tight">{query ? `Results for "${query}"` : 'Browse courses'}</h1><p className="mt-2 text-muted-foreground">Find a topic that sparks your next idea.</p>
    <form onSubmit={e => {e.preventDefault();setParams({query:input.trim()});}} className="my-7 flex max-w-xl items-center gap-3 rounded-xl border bg-card p-2"><Search size={20} className="ml-2 shrink-0 text-muted-foreground" /><input aria-label="Search courses" type="search" value={input} onChange={e=>setInput(e.target.value)} className="min-w-0 flex-1 bg-transparent py-2 outline-none" placeholder="Search by course or topic" /><button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Search</button></form>
    <div className="flex flex-col gap-8 md:flex-row"><Filter handleFilterChange={(c,p)=>{setCategories(c);setPrice(p);}} /><div className="min-w-0 flex-1">{isLoading ? <PageState loading title="Finding your next course" /> : isError ? <PageState error title="Search couldn't load" description="Check your connection and try again." onRetry={refetch} /> : !data?.courses?.length ? <PageState title="No courses found" description="Try a different keyword or remove a filter." /> : <><p className="mb-4 text-sm text-muted-foreground">{data.courses.length} {data.courses.length === 1 ? 'course' : 'courses'}</p><div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{data.courses.map(course=><Course key={course._id} course={course} />)}</div></>}</div></div>
  </div>;
}
