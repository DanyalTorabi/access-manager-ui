# Frontend Architecture

Design principles and patterns for access-manager-ui. Read this alongside `AGENTS.md`.

---

## Layer model

```
┌──────────────────────────────────────────────┐
│  pages/           Route-level components      │
│  (thin: render + local UI state only)         │
└────────────────────┬─────────────────────────┘
                     │ uses
┌────────────────────▼─────────────────────────┐
│  hooks/           TanStack Query wrappers     │
│  (useDomainsQuery, useCreateDomain, …)        │
└────────────────────┬─────────────────────────┘
                     │ calls
┌────────────────────▼─────────────────────────┐
│  api/*.ts         Named entity functions      │
│  (domainsApi.list(), usersApi.create(), …)    │
└────────────────────┬─────────────────────────┘
                     │ uses
┌────────────────────▼─────────────────────────┐
│  api/client.ts    Fetch wrapper + ApiError    │
│  (base URL, auth header, error parsing)       │
└──────────────────────────────────────────────┘
```

**Rules enforced in code review:**
- Pages never import `api/client.ts` or call `fetch` directly
- `api/client.ts` never imports React
- `src/lib/` contains pure functions only (no React, no API)

---

## Data fetching pattern (TanStack Query)

```tsx
// hooks/useDomains.ts
export function useDomains(params: ListParams) {
  return useQuery({
    queryKey: ['domains', params],   // include ALL variables
    queryFn: () => domainsApi.list(params),
  })
}

export function useCreateDomain() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (title: string) => domainsApi.create(title),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['domains'] }),
  })
}
```

- Query keys must include every variable the query depends on
- Always invalidate relevant queries after successful mutation
- Use `staleTime: 30_000` (set in QueryClient defaults) to avoid over-fetching

---

## Form pattern (React Hook Form + Zod)

```tsx
const schema = z.object({ title: z.string().min(1, 'Required') })
type FormData = z.infer<typeof schema>

function CreateForm({ onSuccess }: { onSuccess: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })
  const mutation = useCreateDomain()

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d.title))}>
      <input {...register('title')} />
      {errors.title && <p>{errors.title.message}</p>}
    </form>
  )
}
```

- Never use `useState` for form field values — use React Hook Form
- Zod schemas are the single source of truth for validation rules
- Schema types align with `src/api/types.ts` (generated from OpenAPI)

---

## Table pattern (TanStack Table)

```tsx
const colHelper = createColumnHelper<Domain>()

const columns = [
  colHelper.accessor('Title', { header: 'Title' }),
  colHelper.accessor('ID', { header: 'ID' }),
  colHelper.display({ id: 'actions', cell: (info) => <Actions row={info.row.original} /> }),
]

const table = useReactTable({
  data: data?.data ?? [],
  columns,
  getCoreRowModel: getCoreRowModel(),
})
```

- Use `createColumnHelper` for type-safe column definitions
- Always pass `data ?? []` (not `data!`) to handle loading states
- Extract row action components to keep column definitions readable

---

## Styling (Tailwind + shadcn/ui)

- Use `cn()` from `src/lib/utils.ts` for conditional classes (never template literals)
- shadcn/ui components live in `src/components/` — you own the code, edit freely
- No inline styles
- CSS custom properties for theme tokens (defined in `src/index.css`)

---

## API types

`src/api/schema.ts` is **auto-generated** — do not edit. Run `make generate-types` to update.

`src/api/types.ts` re-exports named types:

```ts
export type Domain = components['schemas']['Domain']
```

Always import entity types from `src/api/types.ts`, not `src/api/schema.ts` directly.

---

## Error handling

- `ApiError` (from `api/client.ts`) has `.status` (HTTP code) and `.message` (backend error string)
- Show `isError` state in the UI — never silently swallow errors
- Destructive actions (delete, overwrite) must show a confirmation step before firing the mutation

---

## File naming conventions

| Type | Convention | Example |
|------|-----------|---------|
| Page component | PascalCase | `DomainsPage.tsx` |
| Shared component | PascalCase | `ConfirmDialog.tsx` |
| Hook | camelCase, `use` prefix | `useDomains.ts` |
| API module | camelCase | `domains.ts` |
| Utility | camelCase | `utils.ts` |
