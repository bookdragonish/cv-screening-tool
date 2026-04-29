import { vi } from 'vitest'
import React from 'react'

type LinkLikeProps = {
  to: string
  children?: React.ReactNode
  className?: string | ((args: { isActive: boolean }) => string | undefined)
}

type MemoryRouterProps = {
  children?: React.ReactNode
}

// Mock react-router to avoid needing a full router
vi.mock('react-router', () => {
  return {
    Link: (props: LinkLikeProps) => React.createElement('a', { ...props, href: props.to }, props.children),
    NavLink: (props: LinkLikeProps) => {
      const cls = typeof props.className === 'function' ? props.className({ isActive: false }) : props.className
      return React.createElement('a', { ...props, href: props.to, className: cls }, props.children)
    },
    useNavigate: () => () => {},
    MemoryRouter: ({ children }: MemoryRouterProps) => React.createElement('div', null, children),
  }
})

// Mock hooks and APIs used by components
vi.mock('@/hooks/useFetchPDF', () => ({
  useFetchPDF: () => ({ documentURL: null, isError: false, isLoading: false }),
}))

vi.mock('@/hooks/useFetchScreening', () => ({
  useFetchScreenings: () => ({ screeningData: [{ jobPostId: 1, title: 'Job A', screenedAt: new Date().toISOString() }], isLoading: false, isError: false }),
}))

vi.mock('@/api/fetchCandidates', () => ({ deleteCandidate: vi.fn().mockResolvedValue(undefined) }))

// Mock AddNewCVModal to a simple stub so CandidateTable tests don't render the full dialog
vi.mock('@/components/addNewCv/AddNewCVModal', () => {
  return {
    AddNewCVModal: (props: { customTrigger?: React.ReactNode }) => React.createElement('div', null, props.customTrigger ?? React.createElement('button', null, 'Edit')),
  }
})

// Avoid confirm dialogs blocking tests
vi.stubGlobal('confirm', () => true)
