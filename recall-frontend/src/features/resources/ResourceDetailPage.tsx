import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { ArrowLeft, Archive, Braces, CalendarDays, Check, Copy, ExternalLink, FileText, Globe, Inbox, Pencil, RefreshCw, Star } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Skeleton } from '../../components/ui/Skeleton'
import { ApiError } from '../../lib/api'
import { useAuth } from '../auth/useAuth'
import { getResource, updateResource, type Resource } from './api'
import { resourceTypeStyles } from './resourceTypes'
import { ResourceEditForm } from './ResourceEditForm'
import { ResourceDeleteButton } from './ResourceDeleteButton'


function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function urlHostname(url: string) {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

function LinkContent({ url }: { url: string }) {
  return (
    <div className="mt-5 rounded-lg border border-line bg-accent-soft p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-3">
        <span className="icon-tile"><Globe aria-hidden="true" size={22} /></span>
        <div className="min-w-0"><p className="eyebrow mb-1">Saved destination</p><h2 className="break-all text-lg font-medium">{urlHostname(url)}</h2></div>
      </div>
      <p className="break-all rounded-lg border border-line bg-panel p-3 font-mono text-xs leading-6 text-muted">{url}</p>
      <a className="btn-primary mt-4" href={url} rel="noopener noreferrer" target="_blank">
        Open link
        <ExternalLink aria-hidden="true" size={14} />
      </a>
      <span className="ml-3 inline-block text-[10px] text-muted">Opens in a new tab</span>
    </div>
  )
}

function SnippetContent({ content }: { content: string }) {
  const lines = content.split('\n')
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  async function copy() {
    setCopyError(false)
    setCopied(false)
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2000)
    } catch { setCopyError(true) }
  }

  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-white/15 bg-[#101417] text-[#e7ecef]">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[.025] px-4 py-2">
        <span className="flex items-center gap-2 font-mono text-xs text-[#aab5bc]"><Braces size={16} aria-hidden="true" />Snippet</span>
        <button className="inline-flex min-h-10 items-center gap-2 rounded-md border border-white/10 px-3 py-1 text-xs text-[#d4dde2] hover:bg-white/10" onClick={() => void copy()} type="button">
          {copied ? <Check aria-hidden="true" size={13} /> : <Copy aria-hidden="true" size={13} />}
          <span aria-live="polite">{copied ? 'Copied' : 'Copy code'}</span>
        </button>
      </div>
      {copyError && <p className="px-5 pt-4 text-xs text-[#d4dde2]" role="alert">Clipboard unavailable. Select the code and copy it manually.</p>}
      <pre tabIndex={0} aria-label="Saved code" className="overflow-x-auto py-4 font-mono text-[13px] leading-7 [tab-size:4]"><code className="code-content">{lines.map((line, index) => <span className="code-line" key={index}>{line}{index < lines.length - 1 ? '\n' : ''}</span>)}</code></pre>
      <div className="flex items-center justify-between border-t border-white/10 px-5 py-3 font-mono text-[10px] text-[#aab5bc]"><span>{lines.length} {lines.length === 1 ? 'line' : 'lines'}</span><span>Plain text</span></div>
    </div>
  )
}

function NoteContent({ content }: { content: string }) {
  return (
    <section className="mt-5 border-t border-line pt-4">
      <h2 className="mb-3 flex items-center gap-2 text-xs text-muted"><FileText size={15} aria-hidden="true" />Your note</h2>
      <div className="max-w-[68ch] whitespace-pre-wrap text-[15px] leading-8 text-ink [overflow-wrap:anywhere]">{content}</div>
    </section>
  )
}

function ResourceBody({ resource }: { resource: Resource }) {
  if (resource.type === 'link' && resource.url) return <LinkContent url={resource.url} />
  if (resource.type === 'snippet' && resource.content) return <SnippetContent key={resource.id} content={resource.content} />
  if (resource.type === 'note' && resource.content) return <NoteContent content={resource.content} />
  if (resource.url) return <LinkContent url={resource.url} />
  if (resource.content) return <NoteContent content={resource.content} />
  return <p className="mt-6 text-sm italic text-muted">This resource has no content.</p>
}

export function ResourceDetailPage() {
  const { accessToken } = useAuth()
  const { resourceId } = useParams<{ resourceId: string }>()
  const query = useQuery({
    queryKey: ['resources', accessToken, 'detail', resourceId],
    queryFn: () => getResource(accessToken!, resourceId!),
    enabled: Boolean(resourceId && accessToken),
    retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 1,
  })
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)

  const flagMutation = useMutation({
    mutationFn: (changes: { is_favorite?: boolean; is_archived?: boolean }) =>
      updateResource(accessToken!, resourceId!, changes),
    onSuccess: (updated) => {
      queryClient.setQueryData(['resources', accessToken, 'detail', resourceId], updated)
      void queryClient.invalidateQueries({ queryKey: ['resources'] })
    },
  })
  if (query.isPending) {
    return <div className="glass mx-auto max-w-5xl space-y-5 p-5" role="status"><span className="sr-only">Loading resource…</span><Skeleton className="h-5 w-28" /><Skeleton className="h-10 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-48 w-full" /></div>
  }

  if (query.isError || !query.data) {
    const notFound = query.error instanceof ApiError && [404, 422].includes(query.error.status)
    return (
      <section className="glass mx-auto max-w-3xl p-5" role="alert">
        <h1 className="text-xl font-semibold">{notFound ? 'Resource not found' : 'Unable to load this resource'}</h1>
        <p className="mt-3 text-sm leading-6 text-muted">{notFound ? 'It may have been deleted, or this link is incorrect.' : 'Check your connection and try again. If your session expired, sign in again.'}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="btn-secondary" to="/resources">
            <ArrowLeft aria-hidden="true" size={14} />
            Back to all resources
          </Link>
          {!notFound && <button className="btn-primary" disabled={query.isFetching} onClick={() => void query.refetch()}><RefreshCw size={14} aria-hidden="true" />Try again</button>}
        </div>
      </section>
    )
  }

  const resource = query.data
  const type = resourceTypeStyles[resource.type]
  const Icon = type.icon

  return (
    <article className={`mx-auto ${resource.type === 'snippet' ? 'max-w-6xl' : 'max-w-5xl'}`}>
      <Link className="inline-flex items-center gap-2 text-xs text-muted hover:text-accent" to="/resources">
        <ArrowLeft aria-hidden="true" size={14} />
        All resources
      </Link>
      <section className="glass mt-4 min-w-0 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="icon-tile"><Icon size={20} aria-hidden="true" /></span>
          <span className="eyebrow">{type.label}</span>
          {!resource.collection_id && <span className="flex items-center gap-1.5 text-[11px] text-muted"><Inbox size={13} aria-hidden="true" />Inbox</span>}

          {!editing && (
            <div className="ml-auto flex items-center gap-2">
              <button
                aria-label={resource.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                aria-pressed={resource.is_favorite}
                className={`btn-secondary ${resource.is_favorite ? 'text-accent' : ''}`}
                disabled={flagMutation.isPending}
                onClick={() => flagMutation.mutate({ is_favorite: !resource.is_favorite })}
                type="button"
              >
                <Star size={16} aria-hidden="true" fill={resource.is_favorite ? 'currentColor' : 'none'} />
              </button>
              <button
                aria-label={resource.is_archived ? 'Unarchive' : 'Archive'}
                aria-pressed={resource.is_archived}
                className={`btn-secondary ${resource.is_archived ? 'text-accent' : ''}`}
                disabled={flagMutation.isPending}
                onClick={() => flagMutation.mutate({ is_archived: !resource.is_archived })}
                type="button"
              >
                <Archive size={16} aria-hidden="true" />
              </button>
                            {/* ...favorite button, archive button... */}
              <ResourceDeleteButton resource={resource} />
              <button className="btn-primary" onClick={() => setEditing(true)} type="button">
                <Pencil size={14} aria-hidden="true" />Edit
              </button>
            </div>
          )}
        </div>

        {flagMutation.isError && <p className="error-panel mt-3" role="alert">Unable to update this resource. Please try again.</p>}

        {editing ? (
          <ResourceEditForm
            key={resource.updated_at}
            resource={resource}
            onCancel={() => setEditing(false)}
            onSaved={() => setEditing(false)}
          />
        ) : (
          <>
            <h1 className="page-title mt-4 [overflow-wrap:anywhere]">{resource.title}</h1>
            {resource.description && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted [overflow-wrap:anywhere]">{resource.description}</p>}
            <ResourceBody resource={resource} />
          </>
        )}

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-4 text-[10px] text-muted">
          <span className="flex items-center gap-2"><CalendarDays size={13} aria-hidden="true" />Captured <time dateTime={resource.created_at}>{formatDate(resource.created_at)}</time></span>
          <span>Updated <time dateTime={resource.updated_at}>{formatDate(resource.updated_at)}</time></span>
        </div>
      </section>
    </article>
  )
}
