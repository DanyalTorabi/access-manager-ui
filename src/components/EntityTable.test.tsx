import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { ColumnDef } from '@tanstack/react-table'
import { EntityTable } from '@/components/EntityTable'

interface Row {
  id: string
  name: string
}

const columns: ColumnDef<Row>[] = [
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'id', header: 'ID', enableSorting: false },
]

const data: Row[] = [
  { id: '1', name: 'Alpha' },
  { id: '2', name: 'Beta' },
]

describe('EntityTable', () => {
  it('renders column headers', () => {
    render(
      <EntityTable
        columns={columns}
        data={data}
        isLoading={false}
        isError={false}
        total={2}
        offset={0}
        onOffsetChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('ID')).toBeInTheDocument()
  })

  it('renders row data', () => {
    render(
      <EntityTable
        columns={columns}
        data={data}
        isLoading={false}
        isError={false}
        total={2}
        offset={0}
        onOffsetChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(
      <EntityTable
        columns={columns}
        data={[]}
        isLoading={true}
        isError={false}
        total={0}
        offset={0}
        onOffsetChange={vi.fn()}
      />,
    )
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows error message when isError', () => {
    render(
      <EntityTable
        columns={columns}
        data={[]}
        isLoading={false}
        isError={true}
        errorMessage="Could not load data."
        total={0}
        offset={0}
        onOffsetChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Could not load data.')).toBeInTheDocument()
  })

  it('shows empty state when no data', () => {
    render(
      <EntityTable
        columns={columns}
        data={[]}
        isLoading={false}
        isError={false}
        total={0}
        offset={0}
        onOffsetChange={vi.fn()}
      />,
    )
    expect(screen.getByText(/no records/i)).toBeInTheDocument()
  })

  it('calls onRowDoubleClick with the row data', () => {
    const onDoubleClick = vi.fn()
    render(
      <EntityTable
        columns={columns}
        data={data}
        isLoading={false}
        isError={false}
        total={2}
        offset={0}
        onOffsetChange={vi.fn()}
        onRowDoubleClick={onDoubleClick}
      />,
    )
    const rows = screen.getAllByRole('row')
    // rows[0] is header, rows[1] is first data row
    fireEvent.dblClick(rows[1])
    expect(onDoubleClick).toHaveBeenCalledWith(data[0])
  })

  it('filters rows by search input', () => {
    render(
      <EntityTable
        columns={columns}
        data={data}
        isLoading={false}
        isError={false}
        total={2}
        offset={0}
        onOffsetChange={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Alpha' } })
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.queryByText('Beta')).not.toBeInTheDocument()
  })
})
