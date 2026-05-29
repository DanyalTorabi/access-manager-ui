import { describe, it, expect } from 'vitest'
import { groupsApi } from '@/api/groups'
import { server } from '@/test/server'
import { http, HttpResponse } from 'msw'
import { TEST_API_BASE as BASE } from '@/test/constants'

const DOMAIN_ID = 'dom-1'

describe('groupsApi', () => {
  it('list returns groups for a domain', async () => {
    const result = await groupsApi.list(DOMAIN_ID)
    expect(result.data).toHaveLength(1)
    expect(result.data[0].Title).toBe('Admins')
    expect(result.data[0].DomainID).toBe(DOMAIN_ID)
    expect(result.data[0].ParentGroupID).toBeNull()
  })

  it('list includes meta pagination fields', async () => {
    const result = await groupsApi.list(DOMAIN_ID)
    expect(result.meta.total).toBe(1)
    expect(result.meta.offset).toBe(0)
  })

  it('create returns the new group without parent', async () => {
    const result = await groupsApi.create(DOMAIN_ID, 'Editors')
    expect(result.Title).toBe('Editors')
    expect(result.DomainID).toBe(DOMAIN_ID)
    expect(result.ParentGroupID).toBeNull()
  })

  it('create returns the new group with a parent group id', async () => {
    const result = await groupsApi.create(DOMAIN_ID, 'Sub-Admins', 'g1')
    expect(result.Title).toBe('Sub-Admins')
    expect(result.ParentGroupID).toBe('g1')
  })

  it('update returns updated group', async () => {
    const result = await groupsApi.update(DOMAIN_ID, 'g1', { title: 'Updated' })
    expect(result.Title).toBe('Updated')
  })

  it('update can clear parent group id', async () => {
    const result = await groupsApi.update(DOMAIN_ID, 'g1', { title: 'Admins', parentGroupId: null })
    expect(result.ParentGroupID).toBeNull()
  })

  it('delete resolves without error', async () => {
    await expect(groupsApi.delete(DOMAIN_ID, 'g1')).resolves.toBeUndefined()
  })

  it('propagates ApiError on 401', async () => {
    server.use(
      http.get(`${BASE}/api/v1/domains/:domainId/groups`, () =>
        HttpResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      ),
    )
    await expect(groupsApi.list(DOMAIN_ID)).rejects.toMatchObject({ status: 401 })
  })
})
