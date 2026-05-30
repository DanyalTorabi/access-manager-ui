import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useState, useEffect, useRef } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const DEFAULT_PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 300

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
  /** Controlled search value driven by the parent. */
  search: string
  onSearchChange: (value: string) => void
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
  searchPlaceholder = 'Search…',
  search,
  onSearchChange,
}: EntityTableProps<TData>) {
  const [inputValue, setInputValue] = useState(search)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Always call the latest onSearchChange prop from inside the debounce timer
  const onSearchChangeRef = useRef(onSearchChange)
  useEffect(() => { onSearchChangeRef.current = onSearchChange })

  // Cancel any pending debounce and sync inputValue when parent resets search externally
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setInputValue(search)
  }, [search])

  // Cancel pending debounce on unmount to avoid calling stale callbacks
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  function handleInputChange(value: string) {
    setInputValue(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onSearchChangeRef.current(value)
    }, SEARCH_DEBOUNCE_MS)
  }

  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    // manualSorting: true tells TanStack Table the server owns sort order;
    // getSortedRowModel still wires up the header toggle UI but does not
    // re-sort the already-sorted rows returned from the server.
    manualSorting: true,
    state: { sorting },
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
  })

  const totalPages = Math.ceil(total / pageSize)
  const currentPage = Math.floor(offset / pageSize) + 1

  return (
    <div className="space-y-3">
      <Input
        type="search"
        placeholder={searchPlaceholder}
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
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
