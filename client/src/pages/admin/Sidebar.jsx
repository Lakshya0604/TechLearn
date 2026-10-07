import { NavLink, Outlet } from 'react-router-dom';
import { ChartNoAxesColumn, SquareLibrary } from 'lucide-react';
export default function Sidebar() {
  return <div className="mx-auto flex max-w-[1440px] flex-col lg:flex-row">
    <aside className="border-b bg-muted/30 p-4 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r lg:p-6"><p className="mb-4 hidden text-xs font-semibold uppercase tracking-widest text-muted-foreground lg:block">Instructor workspace</p><nav className="flex gap-2 lg:flex-col">{[{to:'/admin/dashboard',label:'Dashboard',Icon:ChartNoAxesColumn},{to:'/admin/course',label:'Courses',Icon:SquareLibrary}].map(({to,label,Icon}) => <NavLink key={to} to={to} className={({isActive}) => `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}><Icon size={18} />{label}</NavLink>)}</nav></aside><div className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10"><Outlet /></div>
  </div>;
}
