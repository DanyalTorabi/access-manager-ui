import { api } from './client'
import type { UserAuthzResource, GroupAuthzResource, ListResponse } from './types'

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
    api.get<ListResponse<UserAuthzResource>>(
      `/api/v1/domains/${domainId}/users/${userId}/authz/resources?limit=100`,
    ),

  getGroupAuthzResources: (domainId: string, groupId: string) =>
    api.get<ListResponse<GroupAuthzResource>>(
      `/api/v1/domains/${domainId}/groups/${groupId}/authz/resources?limit=100`,
    ),
}
