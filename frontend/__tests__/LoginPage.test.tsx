import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

const mockNavigate = vi.fn()

// Provide a simple in-memory localStorage implementation for tests
const __storage: Record<string, string> = {}
vi.stubGlobal('localStorage', {
  getItem: (k: string) => (__storage[k] ?? null),
  setItem: (k: string, v: string) => { __storage[k] = String(v) },
  clear: () => { Object.keys(__storage).forEach(k => delete __storage[k]) },
})

vi.mock('react-router', () => {
  const React = require('react')
  return {
    Link: (props: any) => React.createElement('a', { ...props, href: props.to }, props.children),
    NavLink: (props: any) => {
      const cls = typeof props.className === 'function' ? props.className({ isActive: false }) : props.className
      return React.createElement('a', { ...props, href: props.to, className: cls }, props.children)
    },
    useNavigate: () => mockNavigate,
    MemoryRouter: ({ children }: any) => React.createElement('div', null, children),
  }
})

import LoginPage, { AUTH_KEY } from '../src/pages/LoginPage'

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear()
    mockNavigate.mockClear()
  })

  it('sets auth key and navigates on submit', () => {
    render(<LoginPage />)

    const username = screen.getByLabelText(/Brukernavn/i)
    const password = screen.getByLabelText(/Passord/i)
    const button = screen.getByRole('button', { name: /Logg inn/i })

    fireEvent.change(username, { target: { value: 'user' } })
    fireEvent.change(password, { target: { value: 'pass' } })
    fireEvent.click(button)

    expect(localStorage.getItem(AUTH_KEY)).toBe('true')
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('renders title and logo', () => {
    render(<LoginPage />)
    expect(screen.getByText(/Jobb-skanner/i)).toBeTruthy()
    // image has empty alt, so assert it exists
    expect(screen.getByAltText('')).toBeTruthy()
  })
})
