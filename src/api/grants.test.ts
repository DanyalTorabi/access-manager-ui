import { describe, it, expect } from 'vitest'
import { grantsApi } from '@/api/grants'
import { TEST_API_BASE as BASE, TEST_DOMAIN_ID as DOMAIN_ID } from '@/test/constants'
import { server } from '@/test/server'
import { http, HttpResponse } from 'msw'

const USER_ID = 'u1'
const GROUP_ID = 'g1'
const PERM_ID = 'p1'

describe('grantsApi', () => {
  describe('addUserToGroup', () => {
    it('resolves void on 204', async () => {
      const result = await grantsApi.addUserToGroup(DOMAIN_ID, USER_ID, GROUP_ID)
      expect(result).toBeUndefined()
    })

    it('throws on error response', async () => {
      server.use(
        http.post(
          `${BASE}/api/v1/domains/:domainId/users/:userId/groups/:groupId`,
          () => HttpResponse.json({ error: 'Not found' }, { status: 404 }),
        ),
      )
      await expect(grantsApi.addUserToGroup(DOMAIN_ID, USER_ID, GROUP_ID)).rejects.toThrow(
        'Not found',
      )
    })
  })

  describe('removeUserFromGroup', () => {
    it('resolves void on 204', async () => {
      const result = await grantsApi.removeUserFromGroup(DOMAIN_ID, USER_ID, GROUP_ID)
      expect(result).toBeUndefined()
    })

    it('throws on error response', async () => {
      server.use(
        http.delete(
          `${BASE}/api/v1/domains/:domainId/users/:userId/groups/:groupId`,
          () => HttpResponse.json({ error: 'Not found' }, { status: 404 }),
        ),
      )
      await expect(grantsApi.removeUserFromGroup(DOMAIN_ID, USER_ID, GROUP_ID)).rejects.toThrow()
    })
  })

  describe('grantPermissionToUser', () => {
    it('resolves void on 204', async () => {
      const result = await grantsApi.grantPermissionToUser(DOMAIN_ID, USER_ID, PERM_ID)
      expect(result).toBeUndefined()
    })

    it('throws on error response', async () => {
      server.use(
        http.post(
          `${BASE}/api/v1/domains/:domainId/users/:userId/permissions/:permissionId`,
          () => HttpResponse.json({ error: 'Forbidden' }, { status: 403 }),
        ),
      )
      await expect(grantsApi.grantPermissionToUser(DOMAIN_ID, USER_ID, PERM_ID)).rejects.toThrow()
    })
  })

  describe('revokePermissionFromUser', () => {
    it('resolves void on 204', async () => {
      const result = await grantsApi.revokePermissionFromUser(DOMAIN_ID, USER_ID, PERM_ID)
      expect(result).toBeUndefined()
    })

    it('throws on error response', async () => {
      server.use(
        http.delete(
          `${BASE}/api/v1/domains/:domainId/users/:userId/permissions/:permissionId`,
          () => HttpResponse.json({ error: 'Forbidden' }, { status: 403 }),
        ),
      )
      await expect(grantsApi.revokePermissionFromUser(DOMAIN_ID, USER_ID, PERM_ID)).rejects.toThrow()
    })
  })

  describe('grantPermissionToGroup', () => {
    it('resolves void on 204', async () => {
      const result = await grantsApi.grantPermissionToGroup(DOMAIN_ID, GROUP_ID, PERM_ID)
      expect(result).toBeUndefined()
    })

    it('throws on error response', async () => {
      server.use(
        http.post(
          `${BASE}/api/v1/domains/:domainId/groups/:groupId/permissions/:permissionId`,
          () => HttpResponse.json({ error: 'Forbidden' }, { status: 403 }),
        ),
      )
      await expect(grantsApi.grantPermissionToGroup(DOMAIN_ID, GROUP_ID, PERM_ID)).rejects.toThrow()
    })
  })

  describe('revokePermissionFromGroup', () => {
    it('resolves void on 204', async () => {
      const result = await grantsApi.revokePermissionFromGroup(DOMAIN_ID, GROUP_ID, PERM_ID)
      expect(result).toBeUndefined()
    })

    it('throws on error response', async () => {
      server.use(
        http.delete(
          `${BASE}/api/v1/domains/:domainId/groups/:groupId/permissions/:permissionId`,
          () => HttpResponse.json({ error: 'Forbidden' }, { status: 403 }),
        ),
      )
      await expect(grantsApi.revokePermissionFromGroup(DOMAIN_ID, GROUP_ID, PERM_ID)).rejects.toThrow()
    })
  })

  describe('getUserAuthzResources', () => {
    it('returns resource list with effective_mask and meta', async () => {
      const result = await grantsApi.getUserAuthzResources(DOMAIN_ID, USER_ID)
      expect(result.data).toHaveLength(1)
      expect(result.data[0].resource_id).toBe('r1')
      expect(result.data[0].effective_mask).toBe('1')
      expect(result.meta.total).toBe(1)
    })

    it('throws on error response', async () => {
      server.use(
        http.get(
          `${BASE}/api/v1/domains/:domainId/users/:userId/authz/resources`,
          () => HttpResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        ),
      )
      await expect(grantsApi.getUserAuthzResources(DOMAIN_ID, USER_ID)).rejects.toThrow()
    })
  })

  describe('getGroupAuthzResources', () => {
    it('returns resource list with mask and meta', async () => {
      const result = await grantsApi.getGroupAuthzResources(DOMAIN_ID, GROUP_ID)
      expect(result.data).toHaveLength(1)
      expect(result.data[0].resource_id).toBe('r1')
      expect(result.data[0].mask).toBe('1')
      expect(result.meta.total).toBe(1)
    })

    it('throws on error response', async () => {
      server.use(
        http.get(
          `${BASE}/api/v1/domains/:domainId/groups/:groupId/authz/resources`,
          () => HttpResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        ),
      )
      await expect(grantsApi.getGroupAuthzResources(DOMAIN_ID, GROUP_ID)).rejects.toThrow()
    })
  })
})
