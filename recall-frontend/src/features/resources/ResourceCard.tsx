import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ResourceSummary } from './api'
import { resourceTypeStyles } from './resourceTypes'

export function ResourceCard({ resource, layout = 'grid' }: { resource: ResourceSummary; layout?: 'grid' | 'list' }) {
  const { icon: Icon, label } = resourceTypeStyles[resource.type]
  const description = resource.description || resource.url || (resource.type === 'snippet' ? 'Open to view saved code.' : 'Open to read this note.')
  const date = new Date(resource.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

  if (layout === 'list') {
    return (
      <Link className="resource-row group" to={`/resources/${resource.id}`}>
        <span className="icon-tile"><Icon size={18} aria-hidden="true" strokeWidth={1.6} /></span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-medium group-hover:text-accent">{resource.title}</h2>
          <p className="mt-1 truncate text-xs text-muted">{description}</p>
          <div className="mt-2 flex items-center gap-3 text-[10px] text-muted sm:hidden"><span>{label}</span><time dateTime={resource.created_at}>{date}</time></div>
        </div>
        <span className="hidden w-16 text-xs text-muted sm:block">{label}</span>
        <time className="hidden w-24 text-right font-mono text-[10px] text-muted sm:block" dateTime={resource.created_at}>{date}</time>
        <ArrowUpRight size={16} className="text-muted group-hover:text-accent" aria-hidden="true" />
      </Link>
    )
  }
  return (
    <Link className="glass resource-card group flex h-full min-w-0 flex-col p-4" to={`/resources/${resource.id}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="icon-tile"><Icon size={20} aria-hidden="true" strokeWidth={1.6} /></span>
        <ArrowUpRight size={17} className="text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden="true" />
      </div>
      <h2 className="line-clamp-2 text-base font-medium tracking-tight [overflow-wrap:anywhere]">{resource.title}</h2>
      <p className="mb-3 mt-1.5 line-clamp-2 text-xs leading-5 text-muted [overflow-wrap:anywhere]">
        {description}
      </p>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3 text-[10px] text-muted">
        <span className="type-badge">{label}</span>
        <time className="font-mono" dateTime={resource.created_at}>{date}</time>
      </div>
    </Link>
  )
}
