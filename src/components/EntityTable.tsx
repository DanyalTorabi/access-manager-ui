import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const DEFAULT_PAGE_SIZE = 20

interface EntityTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  isLoading: boolean
  isError: boolean
  errorMessage?: string
  onRowDoubleClick?: (row: TData) => void
  /** Called when user clicks a sortable column header */
  onSortChange?: (sort: string, order: 'asc' | 'desc') => void
  /** Server-side pagination */
  total: number
  offset: number
  onOffsetChange: (offset: number) => void
  /** Must match the limit passed to the query. Defaults to 20. */
  pageSize?: number
  searchPlaceholder?: string
  /** Optional controlled search value (for server-side search in T11).
   *  When omitted, the component manages its own internal filter state. */
  searchValue?: string
  onSearchChange?: (value: string) => void
}

export function EntityTable<TData>({
  columns,
  data,
  isLoading,
  isError,
  errorMessage = 'Failed to load data.',
  onRowDoubleClick,
  onSortChange,
  total,
  offset,
  onOffsetChange,
  pageSize = DEFAULT_PAGE_SIZE,
  searchPlaceholder = 'Filter this page…',
  searchValue: controlledSearch,
  onSearchChange: onControlledSearchChange,
}: EntityTableProps<TData>) {
  const [internalFilter, setInternalFilter] = useState('')
  const globalFilter = controlledSearch ?? internalFilter
  const setGlobalFilter = onControlledSearchChange ?? setInternalFilter
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    // manualSorting: true tells TanStack Table the server owns sort order;
    // getSortedRowModel still wires up the header toggle UI but does not
    // re-sort the already-sorted rows returned from the server.
    manualSorting: true,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      setSorting(next)
      const first = next[0]
      if (first && onSortChange) {
        onSortChange(first.id, first.desc ? 'desc' : 'asc')
      }
      // When all sorting is cleared, emit nothing — the caller's own default
      // sort state remains in effect and the server applies its default order.
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const totalPages = Math.ceil(total / pageSize)
  const currentPage = Math.floor(offset / pageSize) + 1

  return (
    <div className="space-y-3">
      <Input
        type="search"
        placeholder={searchPlaceholder}
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />

      {isError && <p className="text-sm text-destructive">{errorMessage}</p>}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="rounded border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => {
                    const canSort = h.column.getCanSort()
                    const sorted = h.column.getIsSorted()
                    return (
                      <th
                        key={h.id}
                        className={cn(
                          'text-left px-4 py-2.5 font-medium text-muted-foreground',
                          canSort && 'cursor-pointer select-none hover:text-foreground',
                        )}
                        onClick={canSort ? h.column.getToggleSortingHandler() : undefined}
                      >
                        <span className="inline-flex items-center gap-1">
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {canSort &&
                            (sorted === 'asc' ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : sorted === 'desc' ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronsUpDown className="h-3 w-3 opacity-40" />
                            ))}
                        </span>
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                    No records found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-border hover:bg-muted/30 transition-colors cursor-pointer"
                    onDoubleClick={() => onRowDoubleClick?.(row.original)}
                  >
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
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => onOffsetChange(offset - pageSize)}
          >
            Previous
          </Button>
          <span className="text-muted-foreground">
            Page {currentPage} of {totalPages} &middot; {total} total
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => onOffsetChange(offset + pageSize)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
