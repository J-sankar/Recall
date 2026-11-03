export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton ${className}`} />
}

export function ResourceSkeletons({ layout = 'grid' }: { layout?: 'grid' | 'list' }) {
  if (layout === 'list') {
    return (
      <div role="status" className="glass divide-y divide-line">
        <span className="sr-only">Loading resources…</span>
        {Array.from({ length: 6 }, (_, index) => <div className="flex items-center gap-3 px-4 py-3" key={index}><Skeleton className="h-10 w-10 shrink-0" /><div className="flex-1 space-y-3"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/3" /></div></div>)}
      </div>
    )
  }
  return (
    <div role="status" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <span className="sr-only">Loading resources…</span>
      {Array.from({ length: 6 }, (_, index) => (
        <div className="glass space-y-3 p-4" key={index}>
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  )
}
