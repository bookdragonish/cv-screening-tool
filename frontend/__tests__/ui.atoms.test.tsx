import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { Button } from '../src/components/ui/button'
import { Input } from '../src/components/ui/input'
import { Textarea } from '../src/components/ui/textarea'
import { Spinner } from '../src/components/ui/spinner'
import { Badge } from '../src/components/ui/badge'
import { Card, CardTitle } from '../src/components/ui/card'

describe('UI atoms', () => {
  it('renders basic UI atoms', () => {
    render(<Button>Click</Button>)
    expect(screen.getByText('Click')).toBeTruthy()

    render(<Input placeholder="Type" />)
    expect(screen.getByPlaceholderText(/Type/)).toBeTruthy()

    const { container: textareaContainer } = render(<Textarea />)
    expect(textareaContainer.querySelector('textarea')).toBeTruthy()

    render(<Spinner />)
    expect(screen.getByRole('status')).toBeTruthy()

    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeTruthy()

    render(
      <Card>
        <CardTitle>Title</CardTitle>
      </Card>,
    )
    expect(screen.getByText('Title')).toBeTruthy()
  })
})
