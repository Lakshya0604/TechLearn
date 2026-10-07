import { GraduationCap, Loader2 } from 'lucide-react';
export default function LoadingSpinner() {
  return <div role="status" className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-6 text-center"><div className="rounded-2xl bg-indigo-600 p-4 text-white"><GraduationCap size={32} /></div><p className="text-xl font-semibold">TechLearn</p><Loader2 className="h-6 w-6 animate-spin text-primary" /><p className="text-sm text-muted-foreground">Getting things ready...</p><p className="max-w-xs text-xs text-muted-foreground">The first visit may take a moment while the server wakes up.</p></div>;
}
