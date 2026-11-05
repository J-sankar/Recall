import { apiFetch,apiJson } from '../../lib/api'

export type ResourceType = 'link' | 'note' | 'snippet'

export type CreateResourceInput = {
  type: ResourceType
  title: string
  description?: string
  content?: string
  url?: string
}

export type Resource = {
  id: string
  type: ResourceType
  title: string
  description: string | null
  content: string | null
  url: string | null
  collection_id: string | null
  is_favorite: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
  last_accessed_at: string | null
}

export type ResourceSummary = {
  id: string
  type: ResourceType
  title: string
  description: string | null
  url: string | null
  created_at: string
}

type ResourceListResponse = { resources: ResourceSummary[] }

export type ResourceListParams = {
  collectionId?: string
  inbox?: boolean
  skip?: number
  limit?: number
}

export function getResources(accessToken: string, params: ResourceListParams = {}): Promise<ResourceSummary[]> {
  const search = new URLSearchParams()
  if (params.collectionId) search.set('collection_id', params.collectionId)
  if (params.inbox) search.set('inbox', 'true')
  if (params.skip !== undefined) search.set('skip', String(params.skip))
  if (params.limit !== undefined) search.set('limit', String(params.limit))
  const query = search.toString()
  return apiJson<ResourceListResponse>(`/resources/${query ? `?${query}` : ''}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  }).then((response) => response.resources)
}

export function getResource(accessToken: string, resourceId: string): Promise<Resource> {
  return apiJson<Resource>(`/resources/${resourceId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export function createResource(accessToken: string, resource: CreateResourceInput): Promise<Resource> {
  return apiJson<Resource>('/resources/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resource),
  })
}


export type UpdateResourceInput = {
  title?: string
  description?: string | null
  content?: string | null
  url?: string | null
  collection_id?: string | null
  is_favorite?: boolean
  is_archived?: boolean
}

export function updateResource(accessToken: string, resourceId: string, changes: UpdateResourceInput): Promise<Resource> {
  return apiJson<Resource>(`/resources/${resourceId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(changes),
  })
}

export async function deleteResource(accessToken: string, resourceId: string): Promise<void> {
  // 204 has no body, so use apiFetch (apiJson would fail on response.json()).
  await apiFetch(`/resources/${resourceId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}


export type LinkPreview = {
  title: string | null
  description: string | null
  image: string | null
  favicon: string | null
  site_name: string | null
  final_url: string
}

export function getLinkPreview(
  accessToken: string,
  url: string,
): Promise<LinkPreview> {
  return apiJson<LinkPreview>('/link-previews/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  })
}