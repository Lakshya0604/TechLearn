import Filter from './Filter';
import { useState } from 'react';
import Course from './Course';
import PageState from '@/components/PageState';
import { useGetSearchCourseQuery } from '@/features/api/courseApi';
import { useSearchParams } from 'react-router-dom';
import { Search, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function SearchPage() {
  const [params,setParams]=useSearchParams();
  const query=params.get('query')||'';const sort=params.get('sort')||'trending';const page=Number(params.get('page'))||1;
  const [input,setInput]=useState(query);const [categories,setCategories]=useState([]);const [price,setPrice]=useState('');const [hideDemo,setHideDemo]=useState(false);
  const update=(values)=>{const next=new URLSearchParams(params);Object.entries(values).forEach(([k,v])=>next.set(k,v));setParams(next);};
  const {data,isLoading,isError,refetch}=useGetSearchCourseQuery({searchQuery:query,categories,shortByPrice:price,sort,page,demo:hideDemo?'hide':'all'});
  return <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
    <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary"><TrendingUp size={16}/>Discover your next skill</p><h1 className="text-3xl font-semibold tracking-tight">{query?`Results for "${query}"`:'Explore courses'}</h1><p className="mt-2 text-muted-foreground">Browse topics and see what gets the community talking.</p>
    <form onSubmit={e=>{e.preventDefault();update({query:input.trim(),page:1});}} className="my-7 flex max-w-xl items-center gap-3 rounded-xl border bg-card p-2"><Search size={20} className="ml-2 shrink-0 text-muted-foreground"/><input aria-label="Search courses" type="search" value={input} onChange={e=>setInput(e.target.value)} className="min-w-0 flex-1 bg-transparent py-2 outline-none" placeholder="Search by course or topic"/><button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Search</button></form>
    <div className="mb-5 flex flex-wrap gap-2">{[['trending','Trending'],['liked','Most liked'],['commented','Most discussed'],['newest','Newest']].map(([value,label])=><Button key={value} variant={sort===value?'default':'outline'} aria-pressed={sort===value} onClick={()=>update({sort:value,page:1})}>{label}</Button>)}</div>
    <div className="mb-7 rounded-xl border bg-muted/40 p-4 text-sm"><p className="text-muted-foreground">Trending score = 3 × likes + 2 × comments + enrollments. Demo courses and their activity are synthetic, not real learner popularity.</p><label className="mt-3 flex items-center gap-2"><input type="checkbox" checked={hideDemo} onChange={e=>{setHideDemo(e.target.checked);update({page:1});}}/>Hide demo data</label></div>
    <div className="flex flex-col gap-8 md:flex-row"><Filter handleFilterChange={(c,p)=>{setCategories(c);setPrice(p);update({page:1});}}/><div className="min-w-0 flex-1">{isLoading?<PageState loading title="Finding your next course"/>:isError?<PageState error title="Search couldn't load" onRetry={refetch}/>:!data?.courses?.length?<PageState title="No courses found" description="Try a different keyword or remove a filter."/>:<><p className="mb-4 text-sm text-muted-foreground">{data.total} courses · page {page}</p><div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{data.courses.map(course=><Course key={course._id} course={course}/>)}</div><div className="mt-8 flex items-center justify-center gap-4"><Button variant="outline" disabled={page===1} onClick={()=>update({page:page-1})}>Previous</Button><span className="text-sm">{page} / {Math.ceil(data.total/data.limit)||1}</span><Button variant="outline" disabled={page*data.limit>=data.total} onClick={()=>update({page:page+1})}>Next</Button></div></>}</div></div>
  </div>;
}
