import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Check, Inbox, LoaderCircle, Plus } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { createResource, type CreateResourceInput, type ResourceType } from './api'
import { resourceTypeStyles } from './resourceTypes'

const resourceTypes: ResourceType[] = ['note', 'link', 'snippet']

export function ResourceCreatePage() {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  const [type, setType] = useState<ResourceType>('note')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [validationError, setValidationError] = useState('')
  const mutation = useMutation({
    mutationFn: (resource: CreateResourceInput) => createResource(accessToken!, resource),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resources'] }),
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (mutation.isPending) return
    setValidationError('')
    if (!title.trim() || (type !== 'link' && !content.trim())) {
      setValidationError('Enter a title and content. Fields cannot contain only spaces.')
      return
    }
    mutation.mutate({ type, title, ...(description && { description }), ...(type === 'link' ? { url } : { content }) })
  }

  function reset() {
    setTitle(''); setDescription(''); setContent(''); setUrl('')
    setValidationError('')
    mutation.reset()
  }

  if (mutation.isSuccess) {
    return (
      <section className="glass mx-auto max-w-2xl p-6 text-center" aria-labelledby="saved-title">
        <span className="icon-tile mb-4"><Check size={22} aria-hidden="true" /></span>
        <p className="eyebrow mb-2">Saved to Inbox</p>
        <h1 id="saved-title" className="page-title">Resource saved</h1>
        <p className="mt-3 text-sm leading-6 text-muted [overflow-wrap:anywhere]">“{mutation.data.title}” is now available in your library.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link className="btn-primary" to={`/resources/${mutation.data.id}`}>View resource<ArrowRight size={16} aria-hidden="true" /></Link>
          <button className="btn-secondary" onClick={reset}><Plus size={16} aria-hidden="true" />Capture another</button>
        </div>
        <Link className="mt-4 inline-block text-xs text-muted hover:text-accent" to="/inbox">Back to Inbox</Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl">
      <Link className="mb-4 inline-flex items-center gap-2 text-xs text-muted hover:text-accent" to="/inbox"><ArrowLeft size={14} aria-hidden="true" />Back to Inbox</Link>
      <p className="eyebrow mb-2">Quick capture</p>
      <h1 className="page-title">New resource</h1>
      <p className="mb-5 mt-2 text-sm text-muted">Add a link, note, or code snippet to your workspace.</p>
      <form className="glass space-y-5 p-4 sm:p-5" onSubmit={submit}>
        <fieldset disabled={mutation.isPending} className="space-y-5">
          <legend className="field-label mb-3">Resource type</legend>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {resourceTypes.map((value) => {
              const { icon: Icon, label, description: hint } = resourceTypeStyles[value]
              return <button aria-pressed={type === value} className={`flex flex-col items-start gap-1.5 rounded-lg border p-2.5 text-left transition sm:flex-row sm:items-center sm:gap-3 sm:p-3 ${type === value ? 'border-accent bg-accent-soft text-accent' : 'border-line text-muted hover:border-accent'}`} key={value} onClick={() => { setType(value); setValidationError('') }} type="button"><Icon size={18} aria-hidden="true" /><span><span className="block text-sm font-medium">{label}</span><span className="mt-0.5 hidden text-[10px] leading-4 text-muted sm:block">{hint}</span></span></button>
            })}
          </div>
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
            <div className="space-y-4">
              <label className="field-label">Title<input className="field" maxLength={300} onChange={(event) => setTitle(event.target.value)} placeholder={type === 'link' ? 'e.g. React documentation' : type === 'snippet' ? 'e.g. Database connection helper' : 'e.g. Architecture review notes'} required value={title} /></label>
              {type === 'link' ? (
                <label className="field-label">URL<input className="field" onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com" required type="url" pattern="https?://.*" title="Enter a URL starting with https:// or http://" value={url} /></label>
              ) : (
                <label className="field-label">Description <span className="font-normal text-muted">(optional)</span><textarea className="field resize-y" onChange={(event) => setDescription(event.target.value)} placeholder="Add a short summary or context" rows={4} value={description} /></label>
              )}
            </div>
            {type === 'link' ? (
              <label className="field-label">Description <span className="font-normal text-muted">(optional)</span><textarea className="field resize-y" onChange={(event) => setDescription(event.target.value)} placeholder="Add a short summary or context" rows={5} value={description} /></label>
            ) : (
              <label className="field-label">{type === 'snippet' ? 'Code or command' : 'Note content'}<textarea className={`field resize-y leading-7 ${type === 'snippet' ? 'font-mono text-sm' : ''}`} spellCheck={type !== 'snippet'} onChange={(event) => setContent(event.target.value)} placeholder={type === 'snippet' ? '// Paste your code here' : 'Write your note…'} required rows={8} value={content} /></label>
            )}
          </div>
        </fieldset>
        {validationError && <p className="error-panel" role="alert">{validationError}</p>}
        {mutation.isError && <p className="error-panel" role="alert">Unable to save this resource. Your content is still here — please try again.</p>}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
          <p className="flex items-center gap-2 text-[11px] text-muted"><Inbox size={15} aria-hidden="true" />Saved to your Inbox</p>
          <button className="btn-primary" disabled={mutation.isPending} type="submit">{mutation.isPending ? <><LoaderCircle size={16} aria-hidden="true" className="animate-spin" />Saving…</> : <>Save resource<ArrowRight size={16} aria-hidden="true" /></>}</button>
        </div>
      </form>
    </section>
  )
}
