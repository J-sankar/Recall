import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LoaderCircle, Save, X } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { updateResource, type Resource, type UpdateResourceInput } from './api'

type Props = {
  resource: Resource
  onCancel: () => void
  onSaved: () => void
}

export function ResourceEditForm({ resource, onCancel, onSaved }: Props) {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState(resource.title)
  const [description, setDescription] = useState(resource.description ?? '')
  const [content, setContent] = useState(resource.content ?? '')
  const [url, setUrl] = useState(resource.url ?? '')
  const [validationError, setValidationError] = useState('')

  const mutation = useMutation({
    mutationFn: (changes: UpdateResourceInput) => updateResource(accessToken!, resource.id, changes),
    onSuccess: (updated) => {
      queryClient.setQueryData(['resources', accessToken, 'detail', resource.id], updated)
      void queryClient.invalidateQueries({ queryKey: ['resources'] })
      onSaved()
    },
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (mutation.isPending) return
    setValidationError('')

    const nextTitle = title.trim()
    const nextDescription = description.trim() || null
    const nextUrl = url.trim()

    if (!nextTitle) return setValidationError('Title cannot be empty.')
    if (resource.type === 'link' && !nextUrl) return setValidationError('A link needs a URL.')
    if (resource.type !== 'link' && !content.trim()) return setValidationError('Content cannot be empty.')

    // Send only what actually changed (the backend uses PATCH + extra="forbid").
    const changes: UpdateResourceInput = {}
    if (nextTitle !== resource.title) changes.title = nextTitle
    if (nextDescription !== resource.description) changes.description = nextDescription
    if (resource.type === 'link') {
      if (nextUrl !== (resource.url ?? '')) changes.url = nextUrl
    } else if (content !== (resource.content ?? '')) {
      changes.content = content
    }

    if (Object.keys(changes).length === 0) return onCancel()
    mutation.mutate(changes)
  }

  return (
    <form className="mt-4 space-y-4" onSubmit={submit}>
      <fieldset className="space-y-4" disabled={mutation.isPending}>
        <label className="field-label">Title
          <input className="field" maxLength={300} onChange={(e) => setTitle(e.target.value)} required value={title} />
        </label>

        <label className="field-label">Description <span className="font-normal text-muted">(optional)</span>
          <textarea className="field resize-y" onChange={(e) => setDescription(e.target.value)} rows={3} value={description} />
        </label>

        {resource.type === 'link' ? (
          <label className="field-label">URL
            <input className="field" onChange={(e) => setUrl(e.target.value)} pattern="https?://.*" required title="Enter a URL starting with https:// or http://" type="url" value={url} />
          </label>
        ) : (
          <label className="field-label">{resource.type === 'snippet' ? 'Code or command' : 'Note content'}
            <textarea
              className={`field resize-y leading-7 ${resource.type === 'snippet' ? 'font-mono text-sm' : ''}`}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={10}
              spellCheck={resource.type !== 'snippet'}
              value={content}
            />
          </label>
        )}
      </fieldset>

      {validationError && <p className="error-panel" role="alert">{validationError}</p>}
      {mutation.isError && <p className="error-panel" role="alert">Unable to save changes. Your edits are still here, so please try again.</p>}

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line pt-4">
        <button className="btn-secondary" disabled={mutation.isPending} onClick={onCancel} type="button">
          <X size={16} aria-hidden="true" />Cancel
        </button>
        <button className="btn-primary" disabled={mutation.isPending} type="submit">
          {mutation.isPending
            ? <><LoaderCircle size={16} aria-hidden="true" className="animate-spin" />Saving…</>
            : <><Save size={16} aria-hidden="true" />Save changes</>}
        </button>
      </div>
    </form>
  )
}