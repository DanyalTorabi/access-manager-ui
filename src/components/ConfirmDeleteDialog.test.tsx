import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'

describe('ConfirmDeleteDialog', () => {
  it('renders entity name in dialog', () => {
    render(
      <ConfirmDeleteDialog
        open={true}
        entityName="example.com"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByText(/example\.com/)).toBeInTheDocument()
  })

  it('calls onConfirm when Delete button is clicked', () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDeleteDialog
        open={true}
        entityName="test.com"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when Cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(
      <ConfirmDeleteDialog
        open={true}
        entityName="test.com"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('disables buttons when isPending', () => {
    render(
      <ConfirmDeleteDialog
        open={true}
        entityName="test.com"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isPending={true}
      />,
    )
    expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
  })

  it('does not render when closed', () => {
    render(
      <ConfirmDeleteDialog
        open={false}
        entityName="test.com"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.queryByText(/test\.com/)).not.toBeInTheDocument()
  })
})
