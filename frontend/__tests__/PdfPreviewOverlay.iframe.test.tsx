import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import type { CandidatePreview } from '../src/types/candidate'

vi.mock('@/hooks/useFetchPDF', () => ({
  useFetchPDF: () => ({ documentURL: 'https://example.com/doc.pdf', isError: false, isLoading: false }),
}))

import PdfPreviewOverlay from '../src/components/PdfPreviewOverlay'

const candidates = [{ id: 1, name: 'Ola' }]
const typedCandidates: CandidatePreview[] = candidates

describe('PdfPreviewOverlay iframe', () => {
  it('renders iframe when documentURL is provided', () => {
    render(<PdfPreviewOverlay candidates={typedCandidates} initialId={1} onClose={() => {}} />)
    expect(screen.getByTitle(/CV for Ola/i)).toBeTruthy()
  })
})
