import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import Navbar from '../src/components/Navbar/Navbar'
import NavItem from '../src/components/Navbar/NavItem'

describe('Navbar components', () => {
  it('renders Navbar and NavItem', () => {
    render(<Navbar />)
    expect(screen.getByText('HR-bruker')).toBeTruthy()

    render(<NavItem to="/x" label="Test" icon={() => <svg />} />)
    expect(screen.getByText('Test')).toBeTruthy()
  })
})
