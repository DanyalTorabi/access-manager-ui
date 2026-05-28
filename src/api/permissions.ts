import { api } from './client'
import type { Permission, ListParams, ListResponse } from './types'

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

export const permissionsApi = {
  list: (domainId: string, params: ListParams = {}) =>
    api.get<ListResponse<Permission>>(
      `/api/v1/domains/${domainId}/permissions${buildQuery(params)}`,
    ),

  get: (domainId: string, id: string) =>
    api.get<Permission>(`/api/v1/domains/${domainId}/permissions/${id}`),

  create: (domainId: string, title: string, resourceId: string, accessMask: string) =>
    api.post<Permission>(`/api/v1/domains/${domainId}/permissions`, {
      title,
      resource_id: resourceId,
      access_mask: accessMask,
    }),

  update: (
    domainId: string,
    id: string,
    data: { title?: string; resourceId?: string; accessMask?: string },
  ) =>
    api.patch<Permission>(`/api/v1/domains/${domainId}/permissions/${id}`, {
      title: data.title,
      resource_id: data.resourceId,
      access_mask: data.accessMask,
    }),

  delete: (domainId: string, id: string) =>
    api.delete(`/api/v1/domains/${domainId}/permissions/${id}`),
}
