import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LoaderCircle, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../lib/api'
import { useAuth } from '../auth/useAuth'
import { deleteResource, type Resource } from './api'

const dangerClass = 'border-red-500/40 text-red-500 hover:bg-red-500/10'

export function ResourceDeleteButton({ resource }: { resource: Resource }) {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)

  const mutation = useMutation({
    mutationFn: () => deleteResource(accessToken!, resource.id),
    onSuccess: () => {
      // Drop the deleted item's cache entry first so it isn't refetched (it would 404).
      queryClient.removeQueries({ queryKey: ['resources', accessToken, 'detail', resource.id] })
      void queryClient.invalidateQueries({ queryKey: ['resources'] })
      navigate('/resources', { replace: true })
    },
    onError: (error) => {
      // Already gone (404): treat as success from the user's point of view.
      if (error instanceof ApiError && error.status === 404) {
        void queryClient.invalidateQueries({ queryKey: ['resources'] })
        navigate('/resources', { replace: true })
      }
    },
  })

  if (!confirming) {
    return (
      <button
        aria-label="Delete resource"
        className={`btn-secondary ${dangerClass}`}
        onClick={() => setConfirming(true)}
        type="button"
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Confirm deletion">
      <span className="text-xs text-muted" aria-live="polite">
        {mutation.isError ? 'Delete failed. Try again?' : 'Delete permanently?'}
      </span>
      <button
        className="btn-secondary"
        disabled={mutation.isPending}
        onClick={() => { mutation.reset(); setConfirming(false) }}
        type="button"
      >
        Cancel
      </button>
      <button
        className={`btn-secondary ${dangerClass}`}
        disabled={mutation.isPending}
        onClick={() => mutation.mutate()}
        type="button"
      >
        {mutation.isPending
          ? <><LoaderCircle size={16} aria-hidden="true" className="animate-spin" />Deleting…</>
          : <><Trash2 size={16} aria-hidden="true" />Yes, delete</>}
      </button>
    </div>
  )
}