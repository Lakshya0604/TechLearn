import { AlertCircle, BookOpen, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
export default function PageState({ loading = false, error = false, title, description, onRetry, children }) {
  const Icon = loading ? Loader2 : error ? AlertCircle : BookOpen;
  return <div role={error ? 'alert' : 'status'} className="flex flex-col items-center rounded-2xl border bg-card px-6 py-14 text-center">
    <div className="mb-4 rounded-2xl bg-muted p-4"><Icon className={`h-7 w-7 text-primary ${loading ? 'animate-spin' : ''}`} /></div>
    <h2 className="text-xl font-semibold">{title || (loading ? 'Loading...' : 'Nothing here yet')}</h2>
    {description && <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>}
    {onRetry && <Button variant="outline" onClick={onRetry} className="mt-5">Try again</Button>}
    {children}
  </div>;
}
