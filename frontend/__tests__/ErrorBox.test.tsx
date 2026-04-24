import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import ErrorBox from '../src/components/ErrorBox'

describe('ErrorBox', () => {
  it('renders title and message inside an alert', () => {
    render(<ErrorBox title="Feil" message="Noe gikk galt" />)
    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.getByText('Feil')).toBeTruthy()
    expect(screen.getByText('Noe gikk galt')).toBeTruthy()
  })
})
