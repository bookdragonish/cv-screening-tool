import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('@/hooks/useFetchPDF', () => ({
  useFetchPDF: () => ({ documentURL: null, isError: false, isLoading: true }),
}))

import PdfPreviewOverlay from '../src/components/PdfPreviewOverlay'

const candidates = [{ id: 1, name: 'Ola' }]

describe('PdfPreviewOverlay loading', () => {
  it('shows loading state', () => {
    render(<PdfPreviewOverlay candidates={candidates as any} initialId={1} onClose={() => {}} />)
    expect(screen.getByText(/Laster dokument/i)).toBeTruthy()
  })
})
