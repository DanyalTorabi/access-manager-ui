import { http, HttpResponse } from 'msw'
import { TEST_API_BASE as BASE } from './constants'

const listMeta = (total: number) => ({
  total,
  offset: 0,
  limit: 20,
  sort: 'title',
  order: 'asc',
})

export const handlers = [
  // Domains
  http.get(`${BASE}/api/v1/domains`, () =>
    HttpResponse.json({
      data: [{ ID: 'd1', Title: 'example.com' }],
      meta: listMeta(1),
    }),
  ),
  http.get(`${BASE}/api/v1/domains/:id`, ({ params }) =>
    HttpResponse.json({ ID: params['id'], Title: 'example.com' }),
  ),
  http.post(`${BASE}/api/v1/domains`, async ({ request }) => {
    const body = (await request.json()) as { title: string }
    return HttpResponse.json({ ID: 'new-id', Title: body.title }, { status: 201 })
  }),
  http.patch(`${BASE}/api/v1/domains/:id`, async ({ request }) => {
    const body = (await request.json()) as { title: string }
    return HttpResponse.json({ ID: 'new-id', Title: body.title })
  }),
  http.delete(`${BASE}/api/v1/domains/:id`, () => new HttpResponse(null, { status: 204 })),

  // Users
  http.get(`${BASE}/api/v1/domains/:domainId/users`, ({ params }) =>
    HttpResponse.json({
      data: [{ ID: 'u1', DomainID: params['domainId'], Title: 'Alice' }],
      meta: listMeta(1),
    }),
  ),
  http.post(`${BASE}/api/v1/domains/:domainId/users`, async ({ params, request }) => {
    const body = (await request.json()) as { title: string }
    return HttpResponse.json(
      { ID: 'u-new', DomainID: params['domainId'], Title: body.title },
      { status: 201 },
    )
  }),
  http.patch(`${BASE}/api/v1/domains/:domainId/users/:id`, async ({ params, request }) => {
    const body = (await request.json()) as { title: string }
    return HttpResponse.json({ ID: params['id'], DomainID: params['domainId'], Title: body.title })
  }),
  http.delete(
    `${BASE}/api/v1/domains/:domainId/users/:id`,
    () => new HttpResponse(null, { status: 204 }),
  ),

  // Groups
  http.get(`${BASE}/api/v1/domains/:domainId/groups`, ({ params }) =>
    HttpResponse.json({
      data: [{ ID: 'g1', DomainID: params['domainId'], Title: 'Admins', ParentGroupID: null }],
      meta: listMeta(1),
    }),
  ),
  http.get(`${BASE}/api/v1/domains/:domainId/groups/:id`, ({ params }) =>
    HttpResponse.json({ ID: params['id'], DomainID: params['domainId'], Title: 'Admins', ParentGroupID: null }),
  ),
  http.post(`${BASE}/api/v1/domains/:domainId/groups`, async ({ params, request }) => {
    const body = (await request.json()) as { title: string; parent_group_id?: string | null }
    return HttpResponse.json(
      { ID: 'g-new', DomainID: params['domainId'], Title: body.title, ParentGroupID: body.parent_group_id ?? null },
      { status: 201 },
    )
  }),
  http.patch(`${BASE}/api/v1/domains/:domainId/groups/:id`, async ({ params, request }) => {
    const body = (await request.json()) as { title?: string; parent_group_id?: string | null }
    return HttpResponse.json({
      ID: params['id'],
      DomainID: params['domainId'],
      Title: body.title ?? 'Admins',
      ParentGroupID: body.parent_group_id ?? null,
    })
  }),
  http.delete(
    `${BASE}/api/v1/domains/:domainId/groups/:id`,
    () => new HttpResponse(null, { status: 204 }),
  ),

  // Resources
  http.get(`${BASE}/api/v1/domains/:domainId/resources`, ({ params }) =>
    HttpResponse.json({
      data: [{ ID: 'r1', DomainID: params['domainId'], Title: 'Document' }],
      meta: listMeta(1),
    }),
  ),
  http.get(`${BASE}/api/v1/domains/:domainId/resources/:id`, ({ params }) =>
    HttpResponse.json({ ID: params['id'], DomainID: params['domainId'], Title: 'Document' }),
  ),
  http.post(`${BASE}/api/v1/domains/:domainId/resources`, async ({ params, request }) => {
    const body = (await request.json()) as { title: string }
    return HttpResponse.json(
      { ID: 'r-new', DomainID: params['domainId'], Title: body.title },
      { status: 201 },
    )
  }),
  http.patch(`${BASE}/api/v1/domains/:domainId/resources/:id`, async ({ params, request }) => {
    const body = (await request.json()) as { title: string }
    return HttpResponse.json({ ID: params['id'], DomainID: params['domainId'], Title: body.title })
  }),
  http.delete(
    `${BASE}/api/v1/domains/:domainId/resources/:id`,
    () => new HttpResponse(null, { status: 204 }),
  ),

  // Access Types
  http.get(`${BASE}/api/v1/domains/:domainId/access-types`, ({ params }) =>
    HttpResponse.json({
      data: [{ ID: 'at1', DomainID: params['domainId'], Title: 'Read', Bit: 1 }],
      meta: listMeta(1),
    }),
  ),
  http.get(`${BASE}/api/v1/domains/:domainId/access-types/:id`, ({ params }) =>
    HttpResponse.json({ ID: params['id'], DomainID: params['domainId'], Title: 'Read', Bit: 1 }),
  ),
  http.post(`${BASE}/api/v1/domains/:domainId/access-types`, async ({ params, request }) => {
    const body = (await request.json()) as { title: string; bit: string }
    return HttpResponse.json(
      { ID: 'at-new', DomainID: params['domainId'], Title: body.title, Bit: parseInt(body.bit, 10) },
      { status: 201 },
    )
  }),
  http.patch(`${BASE}/api/v1/domains/:domainId/access-types/:id`, async ({ params, request }) => {
    const body = (await request.json()) as { title?: string; bit?: string }
    return HttpResponse.json({
      ID: params['id'],
      DomainID: params['domainId'],
      Title: body.title ?? 'Read',
      Bit: body.bit ? parseInt(body.bit, 10) : 1,
    })
  }),
  http.delete(
    `${BASE}/api/v1/domains/:domainId/access-types/:id`,
    () => new HttpResponse(null, { status: 204 }),
  ),

  // Permissions
  http.get(`${BASE}/api/v1/domains/:domainId/permissions`, ({ params }) =>
    HttpResponse.json({
      data: [
        {
          ID: 'p1',
          DomainID: params['domainId'],
          Title: 'Read Document',
          ResourceID: 'r1',
          AccessMask: 1,
        },
      ],
      meta: listMeta(1),
    }),
  ),
  http.post(`${BASE}/api/v1/domains/:domainId/permissions`, async ({ params, request }) => {
    const body = (await request.json()) as { title: string; resource_id: string; access_mask: string }
    return HttpResponse.json(
      {
        ID: 'p-new',
        DomainID: params['domainId'],
        Title: body.title,
        ResourceID: body.resource_id,
        AccessMask: parseInt(body.access_mask, 10),
      },
      { status: 201 },
    )
  }),
  http.patch(`${BASE}/api/v1/domains/:domainId/permissions/:id`, async ({ params, request }) => {
    const body = (await request.json()) as {
      title?: string
      resource_id?: string
      access_mask?: string
    }
    return HttpResponse.json({
      ID: params['id'],
      DomainID: params['domainId'],
      Title: body.title ?? 'Read Document',
      ResourceID: body.resource_id ?? 'r1',
      AccessMask: body.access_mask ? parseInt(body.access_mask, 10) : 1,
    })
  }),
  http.delete(
    `${BASE}/api/v1/domains/:domainId/permissions/:id`,
    () => new HttpResponse(null, { status: 204 }),
  ),
]
