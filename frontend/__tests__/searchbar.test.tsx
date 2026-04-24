import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Searchbar from '../src/components/Searchbar'
import CheckMarkPopUp from '../src/components/CheckMarkPopUp'
import PdfPreviewOverlay from '../src/components/PdfPreviewOverlay'

describe('Search and small components', () => {
  it('Searchbar renders and calls setSearchQuery', async () => {
    const setSearchQuery = vi.fn()
    render(<Searchbar searchAttribute="navn" searchQuery="" setSearchQuery={setSearchQuery} />)
    const input = screen.getByPlaceholderText(/Søk etter navn/i)
    const user = userEvent.setup()
    await user.type(input, 'abc')
    expect(setSearchQuery).toHaveBeenCalled()
  })

  it('CheckMarkPopUp shows message and closes', async () => {
    const setPopup = vi.fn()
    render(<CheckMarkPopUp popup={{ message: 'Done', type: 'success' }} setPopup={setPopup} />)
    expect(screen.getByText('Done')).toBeTruthy()
    const user = userEvent.setup()
    await user.click(screen.getByLabelText('Lukk melding'))
    expect(setPopup).toHaveBeenCalledWith(null)
  })

  it('PdfPreviewOverlay shows candidate name and counters', () => {
    const onClose = vi.fn()
    const candidates = [{ id: 1, name: 'Ola' }]
    render(<PdfPreviewOverlay candidates={candidates as any} initialId={1} onClose={onClose} />)
    expect(screen.getByText('Ola')).toBeTruthy()
    expect(screen.getByText(/1 av 1/)).toBeTruthy()
  })
})
