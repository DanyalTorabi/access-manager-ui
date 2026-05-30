import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Trash2, ArrowRight } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "@tanstack/react-router"
import type { Domain } from "@/api/types"
import { EntityTable } from "@/components/EntityTable"
import { EntityDrawer } from "@/components/EntityDrawer"
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  useDomainsQuery,
  useCreateDomain,
  useUpdateDomain,
  useDeleteDomain,
} from "@/hooks/useDomains"

const PAGE_SIZE = 20

const domainSchema = z.object({ title: z.string().min(1, "Title is required") })
type DomainForm = z.infer<typeof domainSchema>

export default function DomainsPage() {
  const navigate = useNavigate()
  const [offset, setOffset] = useState(0)
  const [sort, setSort] = useState("title")
  const [order, setOrder] = useState<"asc" | "desc">("asc")
  const [search, setSearch] = useState("")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Domain | null>(null)

  const { data, isLoading, isError } = useDomainsQuery({
    offset,
    limit: PAGE_SIZE,
    sort,
    order,
    search,
  })

  const createMutation = useCreateDomain()
  const updateMutation = useUpdateDomain()
  const deleteMutation = useDeleteDomain()

  const columns: ColumnDef<Domain>[] = [
    { id: 'title', accessorKey: 'Title', header: 'Title', enableSorting: true },
    {
      accessorKey: 'ID',
      header: 'ID',
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground font-mono">{getValue() as string}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              void navigate({ to: "/domains/$domainId/users", params: { domainId: row.original.ID } })
            }}
            aria-label="Open domain"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              setDeleteTarget(row.original)
            }}
            aria-label="Delete domain"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  const openCreate = () => {
    createMutation.reset()
    setEditingDomain(null)
    setDrawerOpen(true)
  }
  const openEdit = (domain: Domain) => {
    updateMutation.reset()
    setEditingDomain(domain)
    setDrawerOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Domains</h1>
        <Button onClick={openCreate}>+ New Domain</Button>
      </div>

      <EntityTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        isError={isError}
        errorMessage="Failed to load domains."
        total={data?.meta.total ?? 0}
        offset={offset}
        onOffsetChange={setOffset}
        pageSize={PAGE_SIZE}
        onRowDoubleClick={openEdit}
        onSortChange={(s, o) => { setSort(s); setOrder(o) }}
        search={search}
        onSearchChange={(v) => { setSearch(v); setOffset(0) }}
      />

      <p className="text-xs text-muted-foreground">
        Double-click a row to edit · click a domain to enter it.
      </p>

      <EntityDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingDomain ? "Edit Domain" : "New Domain"}
      >
        <DomainForm
          key={editingDomain?.ID ?? "new"}
          defaultTitle={editingDomain?.Title ?? ""}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          error={createMutation.error?.message ?? updateMutation.error?.message}
          onSubmit={(title) => {
            if (editingDomain) {
              updateMutation.mutate(
                { id: editingDomain.ID, title },
                { onSuccess: () => setDrawerOpen(false) },
              )
            } else {
              createMutation.mutate(title, { onSuccess: () => setDrawerOpen(false) })
            }
          }}
          onCancel={() => setDrawerOpen(false)}
        />
      </EntityDrawer>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        entityName={deleteTarget?.Title ?? ""}
        isPending={deleteMutation.isPending}        error={deleteMutation.error?.message}        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.ID, { onSuccess: () => setDeleteTarget(null) })
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

function DomainForm({
  defaultTitle,
  isSubmitting,
  error,
  onSubmit,
  onCancel,
}: {
  defaultTitle: string
  isSubmitting: boolean
  error?: string
  onSubmit: (title: string) => void
  onCancel: () => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DomainForm>({
    resolver: zodResolver(domainSchema),
    defaultValues: { title: defaultTitle },
  })

  return (
    <form onSubmit={handleSubmit((d) => onSubmit(d.title))} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="domain-title">Title</Label>
        <Input id="domain-title" autoFocus {...register("title")} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  )
}
