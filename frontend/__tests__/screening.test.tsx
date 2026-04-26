import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import CandidateCard from '../src/components/ScreeningPage/CandidateCard'
import CandidateOverview from '../src/components/ScreeningPage/CandidateOverview'
import CandidateSidbar from '../src/components/ScreeningPage/CandidateSidebar'
import ScanningHistoryTable from '../src/components/HomePage/ScanningHistoryTable'
import CandidateTable from '../src/components/CVDatabase/CandidateTable'

describe('Screening components', () => {
  it('CandidateCard displays info', () => {
    const candidate = {
      candidateId: 1,
      candidateName: 'Test candidate',
      qualified: true,
      rank: 1,
      score: 90,
      summary: 'Summary',
      qualifications_met: ['A'],
      qualifications_missing: [],
      course_recommendations: [],
      unknowns: [],
      aml46: false,
      aml47: false,
      createdAt: new Date().toISOString(),
      hasPdf: false,
    }
    render(<CandidateCard candidate={candidate as any} id={1} setPreviewId={vi.fn()} />)
    expect(screen.getByText('Test candidate')).toBeTruthy()
    expect(screen.getByText(/Matchscore/i)).toBeTruthy()
  })

  it('CandidateOverview renders sections', () => {
    const candidates = [
      { candidateId: 1, candidateName: 'A', qualified: true, rank: 1, score: 90, summary: null, qualifications_met: [], qualifications_missing: [], course_recommendations: [], unknowns: [], aml46: false, aml47: false, createdAt: new Date().toISOString(), hasPdf: false },
      { candidateId: 2, candidateName: 'B', qualified: false, rank: 2, score: 50, summary: null, qualifications_met: [], qualifications_missing: [], course_recommendations: [], unknowns: [], aml46: false, aml47: false, createdAt: new Date().toISOString(), hasPdf: false },
    ]
    render(<CandidateOverview candidates={candidates as any} />)
    expect(screen.getByRole('heading', { name: /^Kvalifiserte kandidater$/i })).toBeTruthy()
    expect(screen.getByRole('heading', { name: /^Ikke kvalifiserte kandidater$/i })).toBeTruthy()
  })

  it('CandidateSidebar renders links', () => {
    const candidates = [
      { candidateId: 1, candidateName: 'A', qualified: true, aml46: false, aml47: false },
      { candidateId: 2, candidateName: 'B', qualified: false, aml46: true, aml47: false },
    ]
    render(<CandidateSidbar candidates={candidates as any} />)
    expect(screen.getByText('A')).toBeTruthy()
    expect(screen.getByText('B')).toBeTruthy()
  })

  it('ScanningHistoryTable uses hook and displays item', () => {
    render(<ScanningHistoryTable />)
    expect(screen.getByText(/Tidligere skanninghistorikk/i)).toBeTruthy()
    expect(screen.getByText('Job A')).toBeTruthy()
  })

  it('CandidateTable renders structure', () => {
    const filteredData: any[] = []
    const setPreviewId = vi.fn()
    const setReloadKey = vi.fn()
    const setPopup = vi.fn()
    render(
      <CandidateTable
        filteredData={filteredData}
        setPreviewId={setPreviewId}
        setReloadKey={setReloadKey}
        dataLength={0}
        setPopup={setPopup}
      />,
    )
    expect(screen.getByLabelText('Kandidattabell')).toBeTruthy()
  })
})
