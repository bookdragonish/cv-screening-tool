import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import UploadJobDescriptionCard from '../src/components/newScreening/UploadJobDescriptionCard'
import ScreeningProgressSteps from '../src/components/newScreening/ScreeningProgressSteps'
import ProcessingStatusCard from '../src/components/newScreening/ProcessingStatusCard'
import NewScreening from '../src/components/newScreening/NewScreening'

describe('New screening components', () => {
  it('UploadJobDescriptionCard toggles modes', async () => {
    const onStartProcessing = vi.fn()
    const user = userEvent.setup()
    render(<UploadJobDescriptionCard initialInput={null} showRetryLabel={false} onCancel={() => {}} onStartProcessing={onStartProcessing} />)
    expect(screen.getByText('PDF')).toBeTruthy()
    const textBtn = screen.getByText('Tekst')
    await user.click(textBtn)
    expect(screen.getByPlaceholderText(/Lim inn stillingsbeskrivelsen her/i)).toBeTruthy()
  })

  it('ProcessingStatusCard shows loading and complete states and action', async () => {
    const onStartNew = vi.fn()
    const { rerender } = render(<ProcessingStatusCard isProcessingComplete={false} resultsHref="/x" onStartNew={onStartNew} />)
    expect(screen.getByText(/Analyserer stillingskrav/i)).toBeTruthy()

    rerender(<ProcessingStatusCard isProcessingComplete={true} resultsHref="/x" onStartNew={onStartNew} />)
    expect(screen.getByText(/Behandling fullført/i)).toBeTruthy()

    const user = userEvent.setup()
    await user.click(screen.getByText(/Start ny skanning/i))
    expect(onStartNew).toHaveBeenCalled()
  })

  it('ScreeningProgressSteps renders nodes', () => {
    render(<ScreeningProgressSteps uploadStatus="completed" processingStatus="active" resultsStatus="upcoming" />)
    expect(screen.getByText(/Last opp stillingsbeskrivelse/i)).toBeTruthy()
  })

  it('NewScreening renders upload and processing views', () => {
    const onStartProcessing = vi.fn()
    const onStartNew = vi.fn()
    render(
      <NewScreening
        view="upload"
        isProcessingComplete={false}
        jobDescriptionInput={null}
        uploadStatus="active"
        processingStatus="upcoming"
        resultsStatus="upcoming"
        resultsHref="/r"
        errorBox={null}
        showRetryLabel={false}
        onCancel={() => {}}
        onStartProcessing={onStartProcessing}
        onStartNew={onStartNew}
      />,
    )
    expect(screen.getAllByText(/Last opp stillingsbeskrivelse/i).length).toBeGreaterThan(0)

    render(
      <NewScreening
        view="processing"
        isProcessingComplete={true}
        jobDescriptionInput={null}
        uploadStatus="completed"
        processingStatus="completed"
        resultsStatus="completed"
        resultsHref="/r"
        errorBox={null}
        showRetryLabel={false}
        onCancel={() => {}}
        onStartProcessing={onStartProcessing}
        onStartNew={onStartNew}
      />,
    )
    expect(screen.getByText(/Behandling fullført/i)).toBeTruthy()
  })
})
