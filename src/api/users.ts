import { api } from './client'
import type { User, ListParams, ListResponse } from './types'

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

export const usersApi = {
  list: (domainId: string, params: ListParams = {}) =>
    api.get<ListResponse<User>>(`/api/v1/domains/${domainId}/users${buildQuery(params)}`),

  get: (domainId: string, id: string) =>
    api.get<User>(`/api/v1/domains/${domainId}/users/${id}`),

  create: (domainId: string, title: string) =>
    api.post<User>(`/api/v1/domains/${domainId}/users`, { title }),

  update: (domainId: string, id: string, title: string) =>
    api.patch<User>(`/api/v1/domains/${domainId}/users/${id}`, { title }),

  delete: (domainId: string, id: string) =>
    api.delete(`/api/v1/domains/${domainId}/users/${id}`),
}
