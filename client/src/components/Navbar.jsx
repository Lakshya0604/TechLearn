import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { GraduationCap, Menu, LogOut, BookOpen, User, LayoutDashboard } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import DarkMode from '../pages/DarkMode';
import { useLogoutUserMutation } from '@/features/api/authApi';
import { toast } from 'sonner';
export default function Navbar() {
  const {user, isAuthenticated} = useSelector(state => state.auth);
  const [open, setOpen] = useState(false);
  const [logout, {isLoading}] = useLogoutUserMutation();
  const navigate = useNavigate();
  const links = user?.role === 'instructor' ? [{to:'/admin/dashboard', label:'Dashboard', icon:LayoutDashboard}, {to:'/admin/course', label:'My courses', icon:BookOpen}] : [{to:'/my-learning', label:'My learning', icon:BookOpen}];
  links.push({to:'/profile', label:'Profile', icon:User});
  const signOut = async () => { try { await logout().unwrap(); setOpen(false); toast.success('You are signed out'); navigate('/'); } catch {toast.error('Sign out failed. Please try again.');} };
  return <header className="fixed inset-x-0 top-0 z-40 h-16 border-b bg-background/95 backdrop-blur-xl">
    <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:p-3">Skip to content</a>
    <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
      <Link to="/" aria-label="TechLearn home" className="flex shrink-0 items-center gap-2.5"><span className="rounded-xl bg-indigo-600 p-2 text-white"><GraduationCap size={22} /></span><span className="text-lg font-bold tracking-tight">Tech<span className="text-primary">Learn</span></span></Link>
      <div className="hidden items-center gap-6 md:flex"><NavLink to="/course/search" className="text-sm font-medium text-muted-foreground hover:text-foreground">Browse courses</NavLink>{isAuthenticated && <NavLink to={links[0].to} className="text-sm font-medium text-muted-foreground hover:text-foreground">{links[0].label}</NavLink>}</div>
      <div className="flex items-center gap-2"><DarkMode /><div className="hidden md:block">{isAuthenticated ? <DropdownMenu><DropdownMenuTrigger asChild><button aria-label="Open account menu" className="rounded-full"><Avatar className="h-9 w-9"><AvatarImage src={user?.photoUrl} alt={user?.name} /><AvatarFallback className="bg-indigo-100 text-indigo-700">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback></Avatar></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-56"><DropdownMenuLabel className="truncate">{user?.name || 'My account'}</DropdownMenuLabel><DropdownMenuSeparator />{links.map(({to,label,icon:Icon}) => <DropdownMenuItem key={to} asChild><Link to={to}><Icon size={16} />{label}</Link></DropdownMenuItem>)}<DropdownMenuSeparator /><DropdownMenuItem disabled={isLoading} onClick={signOut}><LogOut size={16} />Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu> : <div className="flex gap-2"><Button variant="ghost" onClick={() => navigate('/login')}>Log in</Button><Button onClick={() => navigate('/login?tab=signup')}>Get started</Button></div>}</div>
      <Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><Button size="icon" variant="ghost" className="md:hidden" aria-label="Open navigation"><Menu size={22} /></Button></SheetTrigger><SheetContent className="w-[min(320px,90vw)]"><SheetHeader><SheetTitle>TechLearn</SheetTitle></SheetHeader><nav className="mt-8 flex flex-col gap-2"><Link onClick={() => setOpen(false)} to="/course/search" className="rounded-lg p-3 hover:bg-muted">Browse courses</Link>{isAuthenticated ? <>{links.map(({to,label}) => <Link key={to} to={to} onClick={() => setOpen(false)} className="rounded-lg p-3 hover:bg-muted">{label}</Link>)}<Button variant="outline" disabled={isLoading} onClick={signOut} className="mt-4">Sign out</Button></> : <><Button onClick={() => {setOpen(false);navigate('/login');}}>Log in</Button><Button variant="outline" onClick={() => {setOpen(false);navigate('/login?tab=signup');}}>Create account</Button></>}</nav></SheetContent></Sheet>
      </div>
    </div>
  </header>;
}
