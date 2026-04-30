import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { domainsApi } from '@/api/domains'
import type { Domain } from '@/api/types'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 20

const titleSchema = z.object({ title: z.string().min(1, 'Title is required') })
type TitleForm = z.infer<typeof titleSchema>

const colHelper = createColumnHelper<Domain>()

export default function DomainsPage() {
  const qc = useQueryClient()
  const [offset, setOffset] = useState(0)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['domains', offset, search],
    queryFn: () => domainsApi.list({ offset, limit: PAGE_SIZE, search: search || undefined }),
  })

  const createMutation = useMutation({
    mutationFn: (title: string) => domainsApi.create(title),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['domains'] })
      setCreating(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      domainsApi.update(id, title),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['domains'] })
      setEditingId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => domainsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['domains'] }),
  })

  const columns = [
    colHelper.accessor('Title', {
      header: 'Title',
      cell: (info) =>
        editingId === info.row.original.ID ? (
          <InlineEditForm
            defaultValue={info.getValue()}
            onSave={(title) =>
              updateMutation.mutate({ id: info.row.original.ID, title })
            }
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <span>{info.getValue()}</span>
        ),
    }),
    colHelper.accessor('ID', {
      header: 'ID',
      cell: (info) => (
        <span className="text-xs text-muted-foreground font-mono">{info.getValue()}</span>
      ),
    }),
    colHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => (
        <div className="flex gap-2 justify-end">
          <button
            className={cn(
              'text-xs px-2 py-1 rounded border border-input hover:bg-muted transition-colors',
            )}
            onClick={() => setEditingId(info.row.original.ID)}
          >
            Edit
          </button>
          <button
            className="text-xs px-2 py-1 rounded border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
            onClick={() => {
              if (confirm(`Delete domain "${info.row.original.Title}"?`))
                deleteMutation.mutate(info.row.original.ID)
            }}
          >
            Delete
          </button>
        </div>
      ),
    }),
  ]

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const total = data?.meta.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Domains</h1>
        <button
          className="text-sm px-3 py-1.5 rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          onClick={() => setCreating(true)}
        >
          + New Domain
        </button>
      </div>

      <input
        type="search"
        placeholder="Search domains..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setOffset(0) }}
        className="w-full max-w-sm px-3 py-1.5 text-sm border border-input rounded bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      />

      {creating && (
        <div className="border border-input rounded p-4 bg-muted/30">
          <p className="text-sm font-medium mb-2">New Domain</p>
          <InlineEditForm
            defaultValue=""
            onSave={(title) => createMutation.mutate(title)}
            onCancel={() => setCreating(false)}
          />
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">Failed to load domains.</p>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className="text-left px-4 py-2.5 font-medium text-muted-foreground"
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                    No domains found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center gap-3 text-sm">
          <button
            disabled={currentPage === 1}
            onClick={() => setOffset(offset - PAGE_SIZE)}
            className="px-2 py-1 rounded border border-input disabled:opacity-40 hover:bg-muted transition-colors"
          >
            Previous
          </button>
          <span className="text-muted-foreground">
            Page {currentPage} of {totalPages} &middot; {total} total
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setOffset(offset + PAGE_SIZE)}
            className="px-2 py-1 rounded border border-input disabled:opacity-40 hover:bg-muted transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

function InlineEditForm({
  defaultValue,
  onSave,
  onCancel,
}: {
  defaultValue: string
  onSave: (title: string) => void
  onCancel: () => void
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<TitleForm>({
    resolver: zodResolver(titleSchema),
    defaultValues: { title: defaultValue },
  })

  return (
    <form onSubmit={handleSubmit((d) => onSave(d.title))} className="flex items-center gap-2">
      <div>
        <input
          {...register('title')}
          autoFocus
          className="px-2 py-1 text-sm border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {errors.title && (
          <p className="text-xs text-destructive mt-0.5">{errors.title.message}</p>
        )}
      </div>
      <button
        type="submit"
        className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:opacity-90"
      >
        Save
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="text-xs px-2 py-1 rounded border border-input hover:bg-muted"
      >
        Cancel
      </button>
    </form>
  )
}
