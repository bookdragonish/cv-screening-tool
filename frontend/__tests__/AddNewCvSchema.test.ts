import { describe, it, expect } from 'vitest'
import { AddNewCvSchema, isPdfFile, MAX_PDF_BYTES } from '../src/validations/AddNewCvSchema'

describe('AddNewCvSchema', () => {
  it('isPdfFile detects pdf by type and extension', () => {
    const f1 = new File(['%PDF-1.4'], 'resume.pdf', { type: 'application/pdf' })
    expect(isPdfFile(f1)).toBe(true)

    const f2 = new File(['test'], 'resume.PDF', { type: 'application/octet-stream' })
    expect(isPdfFile(f2)).toBe(true)

    const f3 = new File(['test'], 'resume.txt', { type: 'text/plain' })
    expect(isPdfFile(f3)).toBe(false)
  })

  it('validates correct values', () => {
    const f = new File(['%PDF-1.4'], 'a.pdf', { type: 'application/pdf' })
    const res = AddNewCvSchema.safeParse({
      name: 'Ola Nordmann',
      cv: f,
      aml46: false,
      aml47: false,
      ansiennitet: 5,
    })
    expect(res.success).toBe(true)
  })

  it('rejects too large pdf', () => {
    const size = MAX_PDF_BYTES + 1
    // allocate a Uint8Array slightly larger than the max to trigger size validation
    const hugeArray = new Uint8Array(size)
    const big = new File([hugeArray], 'big.pdf', { type: 'application/pdf' })
    const res = AddNewCvSchema.safeParse({
      name: 'Ola Nordmann',
      cv: big,
      aml46: false,
      aml47: false,
      ansiennitet: 5,
    })
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.error.issues.some(e => /stor/i.test(e.message))).toBe(true)
    }
  })

  it('rejects short name', () => {
    const res = AddNewCvSchema.safeParse({
      name: 'A',
      cv: undefined,
      aml46: false,
      aml47: false,
      ansiennitet: null,
    })
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.error.issues.some(e => /minst 2/i.test(e.message))).toBe(true)
    }
  })
})
