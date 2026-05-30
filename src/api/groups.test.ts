import { describe, it, expect, vi } from 'vitest'
import { groupsApi } from '@/api/groups'
import { server } from '@/test/server'
import { http, HttpResponse } from 'msw'
import { TEST_API_BASE as BASE, TEST_DOMAIN_ID as DOMAIN_ID } from '@/test/constants'

describe('groupsApi', () => {
  it('list returns groups for a domain', async () => {
    const result = await groupsApi.list(DOMAIN_ID)
    expect(result.data).toHaveLength(1)
    expect(result.data[0].Title).toBe('Admins')
    expect(result.data[0].DomainID).toBe(DOMAIN_ID)
    expect(result.data[0].ParentGroupID).toBeNull()
  })

  it('list returns groups with non-null parent group id', async () => {
    server.use(
      http.get(`${BASE}/api/v1/domains/:domainId/groups`, ({ params }) =>
        HttpResponse.json({
          data: [{ ID: 'g2', DomainID: params['domainId'], Title: 'Sub-Admins', ParentGroupID: 'g1' }],
          meta: { total: 1, offset: 0, limit: 20, sort: 'title', order: 'asc' },
        }),
      ),
    )
    const result = await groupsApi.list(DOMAIN_ID)
    expect(result.data[0].ParentGroupID).toBe('g1')
  })

  it('list includes meta pagination fields', async () => {
    const result = await groupsApi.list(DOMAIN_ID)
    expect(result.meta.total).toBe(1)
    expect(result.meta.offset).toBe(0)
  })

  it('get returns a group by id', async () => {
    const result = await groupsApi.get(DOMAIN_ID, 'g1')
    expect(result.ID).toBe('g1')
    expect(result.DomainID).toBe(DOMAIN_ID)
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
    const spy = vi.fn<(body: unknown) => void>()
    server.use(
      http.patch(`${BASE}/api/v1/domains/:domainId/groups/:id`, async ({ params, request }) => {
        const body = await request.json()
        spy(body)
        return HttpResponse.json({
          ID: params['id'],
          DomainID: params['domainId'],
          Title: (body as { title?: string }).title ?? 'Admins',
          ParentGroupID: null,
        })
      }),
    )
    const result = await groupsApi.update(DOMAIN_ID, 'g1', { title: 'Admins', parentGroupId: null })
    expect(result.ParentGroupID).toBeNull()
    expect(spy.mock.calls[0]?.[0]).toMatchObject({ parent_group_id: null })
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

describe('groupsApi.list query params', () => {
  it('forwards search param in URL', async () => {
    const spy = vi.fn<(req: Request) => void>()
    server.use(
      http.get(`${BASE}/api/v1/domains/:domainId/groups`, ({ request }) => {
        spy(request)
        return HttpResponse.json({ data: [], meta: { total: 0, offset: 0, limit: 20, sort: 'title', order: 'asc' } })
      }),
    )
    await groupsApi.list(DOMAIN_ID, { search: 'admin' })
    expect(spy.mock.calls[0]?.[0].url).toContain('search=admin')
  })
})
