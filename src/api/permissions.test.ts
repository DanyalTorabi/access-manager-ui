import { describe, it, expect, vi } from 'vitest'
import { permissionsApi } from '@/api/permissions'
import { server } from '@/test/server'
import { http, HttpResponse } from 'msw'
import { TEST_API_BASE as BASE, TEST_DOMAIN_ID as DOMAIN_ID } from '@/test/constants'

describe('permissionsApi', () => {
  it('list returns permissions for a domain', async () => {
    const result = await permissionsApi.list(DOMAIN_ID)
    expect(result.data).toHaveLength(1)
    expect(result.data[0].Title).toBe('Read Document')
    expect(result.data[0].DomainID).toBe(DOMAIN_ID)
    expect(result.data[0].ResourceID).toBe('r1')
    expect(result.data[0].AccessMask).toBe(1)
  })

  it('list includes meta pagination fields', async () => {
    const result = await permissionsApi.list(DOMAIN_ID)
    expect(result.meta.total).toBe(1)
    expect(result.meta.offset).toBe(0)
  })

  it('get returns a permission by id', async () => {
    const result = await permissionsApi.get(DOMAIN_ID, 'p1')
    expect(result.ID).toBe('p1')
    expect(result.DomainID).toBe(DOMAIN_ID)
    expect(result.Title).toBe('Read Document')
    expect(result.ResourceID).toBe('r1')
    expect(result.AccessMask).toBe(1)
  })

  it('create returns the new permission with correct fields', async () => {
    const bodySpy = vi.fn<(body: unknown) => void>()
    server.use(
      http.post(`${BASE}/api/v1/domains/:domainId/permissions`, async ({ params, request }) => {
        const body = await request.json()
        bodySpy(body)
        const b = body as { title: string; resource_id: string; access_mask: string }
        return HttpResponse.json(
          {
            ID: 'p-new',
            DomainID: params['domainId'],
            Title: b.title,
            ResourceID: b.resource_id,
            AccessMask: parseInt(b.access_mask, 10),
          },
          { status: 201 },
        )
      }),
    )
    const result = await permissionsApi.create(DOMAIN_ID, 'Write Document', 'r1', '7')
    expect(result.Title).toBe('Write Document')
    expect(result.ID).toBe('p-new')
    expect(result.DomainID).toBe(DOMAIN_ID)
    expect(result.ResourceID).toBe('r1')
    expect(result.AccessMask).toBe(7)
    expect(bodySpy.mock.calls[0]?.[0]).toMatchObject({
      title: 'Write Document',
      resource_id: 'r1',
      access_mask: '7',
    })
  })

  it('update returns the updated permission when only title changes', async () => {
    const result = await permissionsApi.update(DOMAIN_ID, 'p1', { title: 'Updated' })
    expect(result.Title).toBe('Updated')
    expect(result.ID).toBe('p1')
    expect(result.AccessMask).toBe(1)
  })

  it('update returns the updated permission when only accessMask changes', async () => {
    const result = await permissionsApi.update(DOMAIN_ID, 'p1', { accessMask: '3' })
    expect(result.AccessMask).toBe(3)
    expect(result.ID).toBe('p1')
  })

  it('update returns the updated permission when all fields change', async () => {
    const result = await permissionsApi.update(DOMAIN_ID, 'p1', {
      title: 'Admin Document',
      resourceId: 'r2',
      accessMask: '15',
    })
    expect(result.Title).toBe('Admin Document')
    expect(result.ResourceID).toBe('r2')
    expect(result.AccessMask).toBe(15)
  })

  it('delete resolves without error', async () => {
    await expect(permissionsApi.delete(DOMAIN_ID, 'p1')).resolves.toBeUndefined()
  })

  it('list propagates ApiError on server error', async () => {
    server.use(
      http.get(`${BASE}/api/v1/domains/:domainId/permissions`, () =>
        HttpResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      ),
    )
    await expect(permissionsApi.list(DOMAIN_ID)).rejects.toMatchObject({ status: 401 })
  })
})

describe('permissionsApi.list query params', () => {
  it('forwards search param in URL', async () => {
    const spy = vi.fn<(req: Request) => void>()
    server.use(
      http.get(`${BASE}/api/v1/domains/:domainId/permissions`, ({ request }) => {
        spy(request)
        return HttpResponse.json({
          data: [],
          meta: { total: 0, offset: 0, limit: 20, sort: 'title', order: 'asc' },
        })
      }),
    )
    await permissionsApi.list(DOMAIN_ID, { search: 'read' })
    expect(spy.mock.calls[0]?.[0].url).toContain('search=read')
  })

  it('forwards limit and offset params in URL', async () => {
    const spy = vi.fn<(req: Request) => void>()
    server.use(
      http.get(`${BASE}/api/v1/domains/:domainId/permissions`, ({ request }) => {
        spy(request)
        return HttpResponse.json({
          data: [],
          meta: { total: 0, offset: 20, limit: 10, sort: 'title', order: 'asc' },
        })
      }),
    )
    await permissionsApi.list(DOMAIN_ID, { limit: 10, offset: 20 })
    const url = spy.mock.calls[0]?.[0].url
    expect(url).toContain('limit=10')
    expect(url).toContain('offset=20')
  })
})
