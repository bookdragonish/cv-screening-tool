import React from 'react'
import { it, expect } from 'vitest'
import { render } from '@testing-library/react'

import { Separator } from '../src/components/ui/separator'

it('renders separator with data-slot', () => {
  const { container } = render(<Separator />)
  expect(container.querySelector('[data-slot="separator"]')).toBeTruthy()
})
