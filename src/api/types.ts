import type { components } from './schema'

export type Domain = components['schemas']['Domain']
export type User = components['schemas']['User']
export type Group = components['schemas']['Group']
export type Resource = components['schemas']['Resource']
export type AccessType = components['schemas']['AccessType']
export type Permission = components['schemas']['Permission']
export type UserAuthzResource = components['schemas']['UserAuthzResource']
export type GroupAuthzResource = components['schemas']['GroupAuthzResource']
export type ListMeta = components['schemas']['ListMeta']
export type ErrorBody = components['schemas']['ErrorBody']

export interface ListResponse<T> {
  data: T[]
  meta: ListMeta
}

export interface ListParams {
  offset?: number
  limit?: number
  search?: string
  search_type?: 'contains' | 'starts_with' | 'ends_with' | 'exact'
  sort?: string
  order?: 'asc' | 'desc'
}
