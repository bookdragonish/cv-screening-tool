import { describe, it, expect } from 'vitest'
import { formatBytes } from '../src/utils/formatBytes'
import { formatAnalyzedDate } from '../src/utils/formatDate'

describe('newScreeningUtils', () => {
  it('formatBytes returns bytes when small', () => {
    expect(formatBytes(100)).toBe('100 B')
  })

  it('formatBytes returns KB/MB with one decimal', () => {
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(2 * 1024 * 1024)).toBe('2.0 MB')
  })

  it('formatAnalyzedDate returns a formatted string containing the year', () => {
    const formatted = formatAnalyzedDate('2024-04-24T10:00:00Z')
    expect(typeof formatted).toBe('string')
    expect(/2024/.test(formatted)).toBe(true)
  })
})
