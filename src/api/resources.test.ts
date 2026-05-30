import { describe, it, expect, vi } from 'vitest'
import { resourcesApi } from '@/api/resources'
import { server } from '@/test/server'
import { http, HttpResponse } from 'msw'
import { TEST_API_BASE as BASE } from '@/test/constants'

const DOMAIN_ID = 'dom-1'

describe('resourcesApi', () => {
  it('list returns resources for a domain', async () => {
    const result = await resourcesApi.list(DOMAIN_ID)
    expect(result.data).toHaveLength(1)
    expect(result.data[0].Title).toBe('Document')
    expect(result.data[0].DomainID).toBe(DOMAIN_ID)
  })

  it('list includes meta pagination fields', async () => {
    const result = await resourcesApi.list(DOMAIN_ID)
    expect(result.meta.total).toBe(1)
    expect(result.meta.offset).toBe(0)
  })

  it('get returns a resource by id', async () => {
    const result = await resourcesApi.get(DOMAIN_ID, 'r1')
    expect(result.ID).toBe('r1')
    expect(result.DomainID).toBe(DOMAIN_ID)
    expect(result.Title).toBe('Document')
  })

  it('create returns the new resource', async () => {
    const result = await resourcesApi.create(DOMAIN_ID, 'Invoice')
    expect(result.Title).toBe('Invoice')
    expect(result.ID).toBe('r-new')
    expect(result.DomainID).toBe(DOMAIN_ID)
  })

  it('update returns the updated resource', async () => {
    const result = await resourcesApi.update(DOMAIN_ID, 'r1', 'Updated')
    expect(result.Title).toBe('Updated')
    expect(result.ID).toBe('r1')
  })

  it('delete resolves without error', async () => {
    await expect(resourcesApi.delete(DOMAIN_ID, 'r1')).resolves.toBeUndefined()
  })

  it('list propagates ApiError on server error', async () => {
    server.use(
      http.get(`${BASE}/api/v1/domains/:domainId/resources`, () =>
        HttpResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      ),
    )
    await expect(resourcesApi.list(DOMAIN_ID)).rejects.toMatchObject({ status: 401 })
  })
})

describe('resourcesApi.list query params', () => {
  it('forwards search param in URL', async () => {
    const spy = vi.fn<(req: Request) => void>()
    server.use(
      http.get(`${BASE}/api/v1/domains/:domainId/resources`, ({ request }) => {
        spy(request)
        return HttpResponse.json({
          data: [],
          meta: { total: 0, offset: 0, limit: 20, sort: 'title', order: 'asc' },
        })
      }),
    )
    await resourcesApi.list(DOMAIN_ID, { search: 'invoice' })
    expect(spy.mock.calls[0]?.[0].url).toContain('search=invoice')
  })
})
