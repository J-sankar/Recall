import { useQuery } from '@tanstack/react-query'
import { ArrowRight, ArrowUpRight, Braces, FileText, Inbox, Layers3, Link2, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { KnowledgeGraphic } from '../components/KnowledgeGraphic'
import { EmptyState } from '../components/ui/EmptyState'
import { ResourceSkeletons } from '../components/ui/Skeleton'
import { useAuth } from '../features/auth/useAuth'
import { getResources } from '../features/resources/api'
import { ResourceCard } from '../features/resources/ResourceCard'

const features = [
  { icon: Link2, title: 'Essential references', description: 'Keep documentation, articles, and useful websites with the context that makes them valuable.', number: '01 / LINKS' },
  { icon: FileText, title: 'Ideas with context', description: 'Capture observations and working notes in a focused space, ready to revisit when you need them.', number: '02 / NOTES' },
  { icon: Braces, title: 'Code worth reusing', description: 'Save commands and code snippets. Preserve the formatting and copy exactly what you need.', number: '03 / SNIPPETS' },
]

function LandingPage() {
  return (
    <div>
      <section className="grid items-center gap-8 py-6 md:grid-cols-[1.1fr_1fr] lg:py-12">
        <div>
          <p className="eyebrow mb-7">Your personal knowledge system</p>
          <h1 className="font-display text-[clamp(40px,4.8vw,66px)] font-medium leading-[1.09] tracking-[-.045em]">Knowledge,<br />within reach</h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-muted">A focused workspace for your references, notes, and code. Capture what matters. Return to it with clarity.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link className="btn-primary" to="/register">Create account<ArrowRight size={16} aria-hidden="true" /></Link>
            <Link className="btn-secondary" to="/login">Sign in<ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>
          <p className="mt-6 flex flex-wrap items-center gap-4 font-mono text-[10px] tracking-wide text-muted"><span>LINKS</span><span>NOTES</span><span>SNIPPETS</span></p>
        </div>
        <KnowledgeGraphic />
      </section>
      <div className="mb-6 mt-8 flex items-center gap-4"><p className="text-[10px] uppercase tracking-[.15em] text-muted">Three ways to capture in one workspace</p><span className="h-px flex-1 bg-line" /></div>
      <section aria-label="Why Recall" className="grid gap-4 md:grid-cols-3">
        {features.map(({ icon: Icon, title, description, number }) => (
          <article className="glass p-6" key={number}>
            <div className="mb-7 flex items-center justify-between"><Icon size={21} className="text-muted" strokeWidth={1.5} aria-hidden="true" /><span className="font-mono text-[9px] tracking-wide text-muted">{number}</span></div>
            <h2 className="text-base font-medium tracking-tight">{title}</h2>
            <p className="mt-3 text-xs leading-6 text-muted">{description}</p>
          </article>
        ))}
      </section>
      <footer className="mt-10 flex flex-wrap justify-between gap-3 border-t border-line pt-6 text-[10px] text-muted"><span>Recall — Personal knowledge workspace</span><span>Capture / Connect / Revisit</span></footer>
    </div>
  )
}

function Dashboard() {
  const { accessToken } = useAuth()
  const query = useQuery({
    queryKey: ['resources', accessToken, 'recent'],
    queryFn: () => getResources(accessToken!, { limit: 6 }),
    enabled: Boolean(accessToken),
  })
  return (
    <section>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow mb-3">Workspace overview</p>
          <h1 className="page-title">Your knowledge, organized</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-muted">Continue where you left off, or add a new resource to your library.</p>
        </div>
        <Link className="btn-primary" to="/resources/new"><Plus size={16} aria-hidden="true" />New resource</Link>
      </div>
      <div className="my-6 grid gap-4 sm:grid-cols-2">
        {[{ to: '/inbox', title: 'Inbox', description: 'Review resources without a collection', icon: Inbox }, { to: '/resources', title: 'All resources', description: 'Browse your complete resource library', icon: Layers3 }].map(({ to, title, description, icon: Icon }) => (
          <Link className="glass resource-card flex items-center gap-4 p-5" to={to} key={to}>
            <span className="icon-tile"><Icon size={20} aria-hidden="true" /></span>
            <div className="min-w-0 flex-1"><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-xs text-muted">{description}</p></div>
            <ArrowUpRight size={18} className="text-muted" aria-hidden="true" />
          </Link>
        ))}
      </div>
      <div className="mb-5 mt-10 flex items-center justify-between border-b border-line pb-4"><h2 className="text-base font-medium tracking-tight">Recent resources</h2><Link className="flex items-center gap-2 text-xs text-accent" to="/resources">View all<ArrowRight size={14} aria-hidden="true" /></Link></div>
      {query.isPending && <ResourceSkeletons />}
      {query.isError && <div className="error-panel" role="alert">Could not load recent captures. <button className="ml-2 underline" disabled={query.isFetching} onClick={() => void query.refetch()}>Try again</button></div>}
      {query.isSuccess && (query.data.length ? <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{query.data.map((resource) => <li className="min-w-0" key={resource.id}><ResourceCard resource={resource} /></li>)}</ul> : <EmptyState title="No resources yet" description="Add your first link, note, or snippet to start your library."><Link className="btn-primary" to="/resources/new">New resource<Plus size={16} aria-hidden="true" /></Link></EmptyState>)}
    </section>
  )
}

export function HomePage() {
  const { isAuthenticated, isRestoringSession } = useAuth()
  if (isRestoringSession) return <ResourceSkeletons />
  return isAuthenticated ? <Dashboard /> : <LandingPage />
}
