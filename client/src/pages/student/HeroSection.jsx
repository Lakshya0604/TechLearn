import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Code2, Play, Search } from 'lucide-react';

export default function HeroSection() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const search = (event) => {
    event.preventDefault();
    navigate(`/course/search?query=${encodeURIComponent(query.trim())}`);
  };
  return (
    <section className="relative overflow-hidden border-b bg-slate-950 text-white">
      <div aria-hidden="true" className="absolute -right-32 -top-48 h-[550px] w-[550px] rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/25 bg-indigo-400/10 px-3 py-1.5 text-xs font-medium tracking-wide text-indigo-200"><Code2 size={15} /> YOUR NEXT SKILL STARTS HERE</span>
          <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">Learn something.<br /><span className="text-indigo-300">Build something.</span></h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-300 sm:text-lg">Make room for your next idea. Explore tech courses, learn at your pace, and keep your progress in one place.</p>
          <form onSubmit={search} className="mt-8 flex w-full max-w-lg items-center gap-2 rounded-xl border border-white/15 bg-white p-2 text-slate-900 shadow-lg">
            <Search size={20} className="ml-2 shrink-0 text-slate-400" aria-hidden="true" />
            <input aria-label="Search courses" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="What do you want to learn?" className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm outline-none" />
            <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700">Search</button>
          </form>
          <a href="#courses" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-indigo-200 hover:text-white">Browse courses <ArrowRight size={16} /></a>
        </div>
        <div className="hidden lg:block" aria-hidden="true">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4"><div className="h-2 w-2 rounded-full bg-indigo-400" /><span className="text-sm text-slate-300">A little progress, every day</span></div>
            <div className="my-6 flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/25 to-blue-500/10"><Code2 size={64} className="text-indigo-300" /></div>
            <div className="flex items-center justify-between"><div><p className="text-lg font-medium">From curious to capable</p><p className="mt-1 text-sm text-slate-400">Watch. Practice. Keep going.</p></div><div className="rounded-full bg-indigo-500 p-3"><Play size={20} /></div></div>
            <div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-lg border border-white/10 p-3 text-sm text-slate-300"><BookOpen size={18} className="mb-2 text-indigo-300" />Learn at your pace</div><div className="rounded-lg border border-white/10 p-3 text-sm text-slate-300"><Code2 size={18} className="mb-2 text-indigo-300" />Grow your skill set</div></div>
          </div>
        </div>
      </div>
    </section>
  );
}
