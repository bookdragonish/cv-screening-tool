import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import CandidateTable from '../src/components/CVDatabase/CandidateTable'
import type { Candidate } from '../src/types/candidate'

describe('CandidateTable interactions', () => {
  const candidate = {
    id: 42,
    name: 'Alice',
    created_at: new Date().toISOString(),
    has_pdf: true,
    aml46: false,
    aml47: false,
    email: 'a@example.com',
    ansiennitet: null,
  }

  it('clicking preview calls setPreviewId', async () => {
    const setPreviewId = vi.fn()
    const setReloadKey = vi.fn()
    const setPopup = vi.fn()
    const candidates: Candidate[] = [candidate]

    render(
      <CandidateTable
        filteredData={candidates}
        setPreviewId={setPreviewId}
        setReloadKey={setReloadKey as unknown as React.Dispatch<React.SetStateAction<number>>}
        dataLength={1}
        setPopup={setPopup}
      />,
    )

    const previewBtn = screen.getByLabelText(/Forhandsvis PDF for Alice/i)
    await userEvent.click(previewBtn)
    expect(setPreviewId).toHaveBeenCalledWith(candidate.id)
  })

  it('clicking delete calls handler and triggers popup', async () => {
    const setPreviewId = vi.fn()
    const setReloadKey = vi.fn()
    const setPopup = vi.fn()
    const candidates: Candidate[] = [candidate]

    render(
      <CandidateTable
        filteredData={candidates}
        setPreviewId={setPreviewId}
        setReloadKey={setReloadKey as unknown as React.Dispatch<React.SetStateAction<number>>}
        dataLength={1}
        setPopup={setPopup}
      />,
    )

    const deleteBtn = screen.getByLabelText(/Slett kandidat Alice/i)
    await userEvent.click(deleteBtn)

    const confirmDeleteBtn = await screen.findByRole('button', { name: /^Slett$/i })
    await userEvent.click(confirmDeleteBtn)

    await waitFor(() => {
      expect(setPopup).toHaveBeenCalled()
      expect(setReloadKey).toHaveBeenCalled()
    })
  })
})
