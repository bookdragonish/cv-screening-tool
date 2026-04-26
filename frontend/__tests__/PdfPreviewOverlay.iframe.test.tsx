import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('@/hooks/useFetchPDF', () => ({
  useFetchPDF: () => ({ documentURL: 'https://example.com/doc.pdf', isError: false, isLoading: false }),
}))

import PdfPreviewOverlay from '../src/components/PdfPreviewOverlay'

const candidates = [{ id: 1, name: 'Ola' }]

describe('PdfPreviewOverlay iframe', () => {
  it('renders iframe when documentURL is provided', () => {
    render(<PdfPreviewOverlay candidates={candidates as any} initialId={1} onClose={() => {}} />)
    expect(screen.getByTitle(/CV for Ola/i)).toBeTruthy()
  })
})
