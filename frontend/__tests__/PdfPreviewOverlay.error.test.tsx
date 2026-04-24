import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('@/hooks/useFetchPDF', () => ({
  useFetchPDF: () => ({ documentURL: null, isError: true, isLoading: false }),
}))

import PdfPreviewOverlay from '../src/components/PdfPreviewOverlay'

const candidates = [{ id: 1, name: 'Ola' }]

describe('PdfPreviewOverlay error', () => {
  it('shows error state', () => {
    render(<PdfPreviewOverlay candidates={candidates as any} initialId={1} onClose={() => {}} />)
    expect(screen.getByText(/Kunne ikke laste PDF-filen/i)).toBeTruthy()
  })
})
