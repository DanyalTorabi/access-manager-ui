import { describe, it, expect, vi } from 'vitest'
import { accessTypesApi } from '@/api/accessTypes'
import { server } from '@/test/server'
import { http, HttpResponse } from 'msw'
import { TEST_API_BASE as BASE, TEST_DOMAIN_ID as DOMAIN_ID } from '@/test/constants'

describe('accessTypesApi', () => {
  it('list returns access types for a domain', async () => {
    const result = await accessTypesApi.list(DOMAIN_ID)
    expect(result.data).toHaveLength(1)
    expect(result.data[0].Title).toBe('Read')
    expect(result.data[0].DomainID).toBe(DOMAIN_ID)
    expect(result.data[0].Bit).toBe(1)
  })

  it('list includes meta pagination fields', async () => {
    const result = await accessTypesApi.list(DOMAIN_ID)
    expect(result.meta.total).toBe(1)
    expect(result.meta.offset).toBe(0)
  })

  it('get returns an access type by id', async () => {
    const result = await accessTypesApi.get(DOMAIN_ID, 'at1')
    expect(result.ID).toBe('at1')
    expect(result.DomainID).toBe(DOMAIN_ID)
    expect(result.Title).toBe('Read')
    expect(result.Bit).toBe(1)
  })

  it('create returns the new access type with parsed Bit value', async () => {
    const result = await accessTypesApi.create(DOMAIN_ID, 'Write', '2')
    expect(result.Title).toBe('Write')
    expect(result.ID).toBe('at-new')
    expect(result.DomainID).toBe(DOMAIN_ID)
    expect(result.Bit).toBe(2)
  })

  it('update returns updated access type when only title is changed', async () => {
    const result = await accessTypesApi.update(DOMAIN_ID, 'at1', { title: 'Execute' })
    expect(result.Title).toBe('Execute')
    expect(result.ID).toBe('at1')
    expect(result.Bit).toBe(1)
  })

  it('update returns updated access type when only bit is changed', async () => {
    const result = await accessTypesApi.update(DOMAIN_ID, 'at1', { bit: '4' })
    expect(result.Bit).toBe(4)
    expect(result.ID).toBe('at1')
  })

  it('update returns updated access type when both title and bit are changed', async () => {
    const result = await accessTypesApi.update(DOMAIN_ID, 'at1', { title: 'Delete', bit: '8' })
    expect(result.Title).toBe('Delete')
    expect(result.Bit).toBe(8)
  })

  it('delete resolves without error', async () => {
    await expect(accessTypesApi.delete(DOMAIN_ID, 'at1')).resolves.toBeUndefined()
  })

  it('list propagates ApiError on server error', async () => {
    server.use(
      http.get(`${BASE}/api/v1/domains/:domainId/access-types`, () =>
        HttpResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      ),
    )
    await expect(accessTypesApi.list(DOMAIN_ID)).rejects.toMatchObject({ status: 401 })
  })
})

describe('accessTypesApi.list query params', () => {
  it('forwards search param in URL', async () => {
    const spy = vi.fn<(req: Request) => void>()
    server.use(
      http.get(`${BASE}/api/v1/domains/:domainId/access-types`, ({ request }) => {
        spy(request)
        return HttpResponse.json({
          data: [],
          meta: { total: 0, offset: 0, limit: 20, sort: 'title', order: 'asc' },
        })
      }),
    )
    await accessTypesApi.list(DOMAIN_ID, { search: 'write' })
    expect(spy.mock.calls[0]?.[0].url).toContain('search=write')
  })
})
