import { api } from './client'
import type { UserAuthzResource, GroupAuthzResource } from './types'

export const grantsApi = {
  addUserToGroup: (domainId: string, userId: string, groupId: string) =>
    api.post<void>(
      `/api/v1/domains/${domainId}/users/${userId}/groups/${groupId}`,
      undefined,
    ),

  removeUserFromGroup: (domainId: string, userId: string, groupId: string) =>
    api.delete(`/api/v1/domains/${domainId}/users/${userId}/groups/${groupId}`),

  grantPermissionToUser: (domainId: string, userId: string, permissionId: string) =>
    api.post<void>(
      `/api/v1/domains/${domainId}/users/${userId}/permissions/${permissionId}`,
      undefined,
    ),

  revokePermissionFromUser: (domainId: string, userId: string, permissionId: string) =>
    api.delete(
      `/api/v1/domains/${domainId}/users/${userId}/permissions/${permissionId}`,
    ),

  grantPermissionToGroup: (domainId: string, groupId: string, permissionId: string) =>
    api.post<void>(
      `/api/v1/domains/${domainId}/groups/${groupId}/permissions/${permissionId}`,
      undefined,
    ),

  revokePermissionFromGroup: (domainId: string, groupId: string, permissionId: string) =>
    api.delete(
      `/api/v1/domains/${domainId}/groups/${groupId}/permissions/${permissionId}`,
    ),

  getUserAuthzResources: (domainId: string, userId: string) =>
    api.get<{ data: UserAuthzResource[] }>(
      `/api/v1/domains/${domainId}/users/${userId}/authz/resources`,
    ),

  getGroupAuthzResources: (domainId: string, groupId: string) =>
    api.get<{ data: GroupAuthzResource[] }>(
      `/api/v1/domains/${domainId}/groups/${groupId}/authz/resources`,
    ),
}
