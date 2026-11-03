import { Braces, FileText, Link2, type LucideIcon } from 'lucide-react'
import type { ResourceType } from './api'

export const resourceTypeStyles: Record<ResourceType, { label: string; description: string; icon: LucideIcon; className: string }> = {
  link: { label: 'Link', description: 'Keep a useful URL', icon: Link2, className: 'text-accent bg-accent-soft' },
  note: { label: 'Note', description: 'Put a thought into words', icon: FileText, className: 'text-accent bg-accent-soft' },
  snippet: { label: 'Snippet', description: 'Save code or a command', icon: Braces, className: 'text-accent bg-accent-soft' },
}
