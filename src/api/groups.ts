import { api } from './client'
import type { Group, ListParams, ListResponse } from './types'

function buildQuery(params: ListParams): string {
  const q = new URLSearchParams()
  if (params.offset !== undefined) q.set('offset', String(params.offset))
  if (params.limit !== undefined) q.set('limit', String(params.limit))
  if (params.search) q.set('search', params.search)
  if (params.search_type) q.set('search_type', params.search_type)
  if (params.sort) q.set('sort', params.sort)
  if (params.order) q.set('order', params.order)
  const s = q.toString()
  return s ? `?${s}` : ''
}

export const groupsApi = {
  list: (domainId: string, params: ListParams = {}) =>
    api.get<ListResponse<Group>>(`/api/v1/domains/${domainId}/groups${buildQuery(params)}`),

  get: (domainId: string, id: string) =>
    api.get<Group>(`/api/v1/domains/${domainId}/groups/${id}`),

  create: (domainId: string, title: string, parentGroupId?: string | null) =>
    api.post<Group>(`/api/v1/domains/${domainId}/groups`, {
      title,
      parent_group_id: parentGroupId ?? null,
    }),

  update: (
    domainId: string,
    id: string,
    data: { title?: string; parentGroupId?: string | null },
  ) =>
    api.patch<Group>(`/api/v1/domains/${domainId}/groups/${id}`, {
      title: data.title,
      parent_group_id: data.parentGroupId,
    }),

  delete: (domainId: string, id: string) =>
    api.delete(`/api/v1/domains/${domainId}/groups/${id}`),
}
