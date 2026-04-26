import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { FieldError } from '../src/components/ui/field'

describe('FieldError', () => {
  it('renders children when provided', () => {
    render(<FieldError>Custom error</FieldError>)
    expect(screen.getByText('Custom error')).toBeTruthy()
  })

  it('renders a single error message when provided one unique error', () => {
    render(<FieldError errors={[{ message: 'Only one' }]} />)
    expect(screen.getByText('Only one')).toBeTruthy()
  })

  it('renders a list for multiple unique errors and deduplicates duplicates', () => {
    render(<FieldError errors={[{ message: 'A' }, { message: 'B' }, { message: 'A' }]} />)
    const items = screen.getAllByRole('listitem')
    const texts = items.map((el) => el.textContent)
    expect(texts).toEqual(expect.arrayContaining(['A', 'B']))
    expect(items.length).toBe(2)
  })

  it('renders nothing when no children and no errors', () => {
    const { container } = render(<FieldError />)
    expect(container.querySelector('[data-slot="field-error"]')).toBeNull()
  })
})
