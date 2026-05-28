import { describe, it, expect } from 'vitest'
import { usersApi } from '@/api/users'
import { server } from '@/test/server'
import { http, HttpResponse } from 'msw'

const BASE = 'http://127.0.0.1:8080'
const DOMAIN_ID = 'dom-1'

describe('usersApi', () => {
  it('list returns users for a domain', async () => {
    const result = await usersApi.list(DOMAIN_ID)
    expect(result.data).toHaveLength(1)
    expect(result.data[0].Title).toBe('Alice')
    expect(result.data[0].DomainID).toBe(DOMAIN_ID)
  })

  it('create returns the new user', async () => {
    const result = await usersApi.create(DOMAIN_ID, 'Bob')
    expect(result.Title).toBe('Bob')
    expect(result.DomainID).toBe(DOMAIN_ID)
  })

  it('update returns updated user', async () => {
    const result = await usersApi.update(DOMAIN_ID, 'u1', 'Updated')
    expect(result.Title).toBe('Updated')
  })

  it('delete resolves without error', async () => {
    await expect(usersApi.delete(DOMAIN_ID, 'u1')).resolves.toBeUndefined()
  })

  it('propagates ApiError on 401', async () => {
    server.use(
      http.get(`${BASE}/api/v1/domains/:domainId/users`, () =>
        HttpResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      ),
    )
    await expect(usersApi.list(DOMAIN_ID)).rejects.toMatchObject({ status: 401 })
  })
})
