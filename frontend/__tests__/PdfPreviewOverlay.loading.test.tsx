import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import type { CandidatePreview } from '../src/types/candidate'

vi.mock('@/hooks/useFetchPDF', () => ({
  useFetchPDF: () => ({ documentURL: null, isError: false, isLoading: true }),
}))

import PdfPreviewOverlay from '../src/components/PdfPreviewOverlay'

const candidates = [{ id: 1, name: 'Ola' }]
const typedCandidates: CandidatePreview[] = candidates

describe('PdfPreviewOverlay loading', () => {
  it('shows loading state', () => {
    render(<PdfPreviewOverlay candidates={typedCandidates} initialId={1} onClose={() => {}} />)
    expect(screen.getByText(/Laster dokument/i)).toBeTruthy()
  })
})
