import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { KeyRound, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useParams } from '@tanstack/react-router'
import type { User } from '@/api/types'
import { EntityTable } from '@/components/EntityTable'
import { EntityDrawer } from '@/components/EntityDrawer'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import { UserAccessPanel } from '@/components/UserAccessPanel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useUsersQuery,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from '@/hooks/useUsers'

const PAGE_SIZE = 20

const userSchema = z.object({ title: z.string().min(1, 'Title is required') })
type UserForm = z.infer<typeof userSchema>

export default function UsersPage() {
  const { domainId } = useParams({ from: '/domains/$domainId/users' })
  const [offset, setOffset] = useState(0)
  const [sort, setSort] = useState('title')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')
  const [search, setSearch] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [accessPanelUser, setAccessPanelUser] = useState<User | null>(null)

  const { data, isLoading, isError } = useUsersQuery(domainId, {
    offset,
    limit: PAGE_SIZE,
    sort,
    order,
    search,
  })

  const createMutation = useCreateUser(domainId)
  const updateMutation = useUpdateUser(domainId)
  const deleteMutation = useDeleteUser(domainId)

  const columns: ColumnDef<User>[] = [
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
              setAccessPanelUser(row.original)
            }}
            aria-label="Manage access"
          >
            <KeyRound className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              setDeleteTarget(row.original)
            }}
            aria-label="Delete user"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Button
          onClick={() => {
            setEditingUser(null)
            createMutation.reset()
            setDrawerOpen(true)
          }}
        >
          + New User
        </Button>
      </div>

      <EntityTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        isError={isError}
        errorMessage="Failed to load users."
        total={data?.meta.total ?? 0}
        offset={offset}
        onOffsetChange={setOffset}
        pageSize={PAGE_SIZE}
        onRowDoubleClick={(user) => {
          updateMutation.reset()
          setEditingUser(user)
          setDrawerOpen(true)
        }}
        onSortChange={(s, o) => {
          setSort(s)
          setOrder(o)
        }}
        search={search}
        onSearchChange={(v) => { setSearch(v); setOffset(0) }}
      />

      <EntityDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingUser ? 'Edit User' : 'New User'}
      >
        <TitleForm
          key={editingUser?.ID ?? 'new'}
          defaultTitle={editingUser?.Title ?? ''}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          error={createMutation.error?.message ?? updateMutation.error?.message}
          onSubmit={(title) => {
            if (editingUser) {
              updateMutation.mutate(
                { id: editingUser.ID, title },
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
        entityName={deleteTarget?.Title ?? ''}
        isPending={deleteMutation.isPending}
        error={deleteMutation.error?.message}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.ID, { onSuccess: () => setDeleteTarget(null) })
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      <UserAccessPanel
        domainId={domainId}
        user={accessPanelUser}
        onClose={() => setAccessPanelUser(null)}
      />
    </div>
  )
}

function TitleForm({
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
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: { title: defaultTitle },
  })

  return (
    <form onSubmit={handleSubmit((d) => onSubmit(d.title))} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="user-title">Title</Label>
        <Input id="user-title" autoFocus {...register('title')} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
