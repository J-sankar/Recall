import { useQuery } from '@tanstack/react-query'
import { ArrowDownWideNarrow, ArrowLeft, ArrowRight, LayoutGrid, List, Plus, RefreshCw } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/ui/EmptyState'
import { ResourceSkeletons } from '../../components/ui/Skeleton'
import { useAuth } from '../auth/useAuth'
import { getResources } from './api'
import { ResourceCard } from './ResourceCard'

const PAGE_SIZE = 12
type View = 'grid' | 'list'

function savedView(): View {
  try { return localStorage.getItem('recall-resource-view') === 'list' ? 'list' : 'grid' } catch { return 'grid' }
}

type ResourceListProps = {
  title: string
  description: string
  emptyTitle: string
  emptyDescription: string
  inboxOnly?: boolean
}

export function ResourceList({ title, description, emptyTitle, emptyDescription, inboxOnly = false }: ResourceListProps) {
  const { accessToken } = useAuth()
  const [page, setPage] = useState(0)
  const [view, setView] = useState<View>(savedView)

  function changeView(next: View) {
    setView(next)
    try { localStorage.setItem('recall-resource-view', next) } catch { /* Keep the preference for this page. */ }
  }
  const query = useQuery({
    queryKey: ['resources', accessToken, 'list', { inboxOnly, page }],
    queryFn: () => getResources(accessToken!, { inbox: inboxOnly, skip: page * PAGE_SIZE, limit: PAGE_SIZE + 1 }),
    enabled: Boolean(accessToken),
  })
  const resources = (query.data ?? []).slice(0, PAGE_SIZE)
  const hasNext = (query.data?.length ?? 0) > PAGE_SIZE

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">{inboxOnly ? 'Unsorted resources' : 'Resource library'}</p>
          <h1 className="page-title">{title}</h1>
          <p className="mt-2 max-w-lg text-sm leading-6 text-muted">{description}</p>
        </div>
        <Link className="btn-primary" to="/resources/new"><Plus aria-hidden="true" size={16} />New resource</Link>
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-y border-line py-2">
        <p className="text-xs text-muted">{inboxOnly ? 'No collection assigned' : 'Links, notes & snippets'}</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-[11px] text-muted"><ArrowDownWideNarrow size={14} aria-hidden="true" />Newest first</span>
          <div className="view-toggle" role="group" aria-label="Resource view">
            <button type="button" aria-label="Grid view" title="Grid view" aria-pressed={view === 'grid'} onClick={() => changeView('grid')}><LayoutGrid size={16} aria-hidden="true" /></button>
            <button type="button" aria-label="List view" title="List view" aria-pressed={view === 'list'} onClick={() => changeView('list')}><List size={17} aria-hidden="true" /></button>
          </div>
        </div>
      </div>
      {query.isPending && <ResourceSkeletons layout={view} />}
      {query.isError && (
        <div className="error-panel mb-6 flex flex-wrap items-center justify-between gap-4" role="alert">
          <span>Unable to load your resources. Please try again.</span>
          <button className="btn-secondary" disabled={query.isFetching} onClick={() => void query.refetch()}><RefreshCw size={14} aria-hidden="true" />Try again</button>
        </div>
      )}
      {query.isSuccess && resources.length === 0 && (
        <EmptyState title={page === 0 ? emptyTitle : 'No more resources here'} description={page === 0 ? emptyDescription : 'Go back a page to keep exploring your library.'}>
          {page === 0 && <Link className="btn-primary" to="/resources/new"><Plus size={16} aria-hidden="true" />New resource</Link>}
        </EmptyState>
      )}
      {resources.length > 0 && (
        <ul className={view === 'grid' ? 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3' : 'overflow-hidden rounded-xl border border-line [&>li+li]:border-t [&>li+li]:border-line'}>
          {resources.map((resource, index) => (
            <li className="stagger min-w-0" style={{ '--index': index } as CSSProperties} key={resource.id}><ResourceCard resource={resource} layout={view} /></li>
          ))}
        </ul>
      )}
      {(page > 0 || hasNext) && (
        <nav aria-label="Resource pages" className="mt-5 flex items-center justify-between gap-3">
          <button className="btn-secondary" disabled={page === 0 || query.isFetching} onClick={() => setPage((current) => current - 1)}><ArrowLeft size={14} aria-hidden="true" />Previous</button>
          <span className="text-xs text-muted" aria-live="polite">Page {page + 1}</span>
          <button className="btn-secondary" disabled={!hasNext || query.isFetching} onClick={() => setPage((current) => current + 1)}>Next<ArrowRight size={14} aria-hidden="true" /></button>
        </nav>
      )}
    </section>
  )
}
