import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'

export function EmptyState({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <div className="glass flex flex-col items-center px-5 py-8 text-center">
      <span className="icon-tile mb-4"><Inbox size={22} aria-hidden="true" /></span>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{description}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
