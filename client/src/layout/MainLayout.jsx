import Navbar from '@/components/Navbar';
import { Link, Outlet } from 'react-router-dom';
export default function MainLayout() {
  return <div className="flex min-h-screen flex-col bg-background"><Navbar /><div id="main-content" className="flex-1 pt-16"><Outlet /></div><footer className="border-t bg-muted/30"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-5 py-7 text-sm sm:flex-row sm:items-center sm:px-8"><Link to="/" className="font-semibold">TechLearn</Link><p className="text-muted-foreground">A space to learn, practice, and grow.</p><Link to="/course/search" className="text-muted-foreground hover:text-foreground">Browse courses</Link></div></footer></div>;
}
