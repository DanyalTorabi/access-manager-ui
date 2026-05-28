import { describe, it, expect, vi } from 'vitest'
import { domainsApi } from '@/api/domains'
import { server } from '@/test/server'
import { http, HttpResponse } from 'msw'

const BASE = 'http://127.0.0.1:8080'

describe('domainsApi', () => {
  it('list returns data and meta', async () => {
    const result = await domainsApi.list()
    expect(result.data).toHaveLength(1)
    expect(result.data[0].Title).toBe('example.com')
    expect(result.meta.total).toBe(1)
  })

  it('get returns a domain by id', async () => {
    const result = await domainsApi.get('d1')
    expect(result.ID).toBe('d1')
    expect(result.Title).toBe('example.com')
  })

  it('create returns the new domain', async () => {
    const result = await domainsApi.create('new.com')
    expect(result.Title).toBe('new.com')
    expect(result.ID).toBe('new-id')
  })

  it('update returns the updated domain', async () => {
    const result = await domainsApi.update('d1', 'updated.com')
    expect(result.Title).toBe('updated.com')
  })

  it('delete resolves without error', async () => {
    await expect(domainsApi.delete('d1')).resolves.toBeUndefined()
  })

  it('list propagates ApiError on server error', async () => {
    server.use(
      http.get(`${BASE}/api/v1/domains`, () =>
        HttpResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      ),
    )
    await expect(domainsApi.list()).rejects.toMatchObject({ status: 401 })
  })
})

describe('domainsApi.list query params', () => {
  it('builds search param', async () => {
    const spy = vi.fn<(req: Request) => Promise<Response>>()
    server.use(
      http.get(`${BASE}/api/v1/domains`, ({ request }) => {
        spy(request)
        return HttpResponse.json({ data: [], meta: { total: 0, offset: 0, limit: 20, sort: 'title', order: 'asc' } })
      }),
    )
    await domainsApi.list({ search: 'example' })
    const url = spy.mock.calls[0]?.[0].url
    expect(url).toContain('search=example')
  })
})
