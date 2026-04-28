import { describe, it, expect } from 'vitest'
import { UploadJobDescriptionSchema, MIN_JOB_DESCRIPTION_TEXT_LENGTH, MAX_JOB_DESCRIPTION_PDF_BYTES, toJobDescriptionInput } from '../src/validations/UploadJobDescriptionSchema'

describe('UploadJobDescriptionSchema', () => {
  it('accepts valid pdf input', () => {
    const f = new File(['%PDF-1.4'], 'jd.pdf', { type: 'application/pdf' })
    const res = UploadJobDescriptionSchema.safeParse({ mode: 'pdf', jobDescriptionFile: f })
    expect(res.success).toBe(true)
  })

  it('rejects missing file in pdf mode', () => {
    const res = UploadJobDescriptionSchema.safeParse({ mode: 'pdf', jobDescriptionFile: undefined })
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.error.issues.some(i => /Du må laste opp en PDF/.test(i.message))).toBe(true)
    }
  })

  it('rejects non-pdf file type', () => {
    const f = new File(['not pdf'], 'file.txt', { type: 'text/plain' })
    const res = UploadJobDescriptionSchema.safeParse({ mode: 'pdf', jobDescriptionFile: f })
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.error.issues.some(i => /Kun PDF-filer er tillatt/.test(i.message))).toBe(true)
    }
  })

  it('rejects too large pdf', () => {
    const size = MAX_JOB_DESCRIPTION_PDF_BYTES + 1
    const huge = new File([new Uint8Array(size)], 'big.pdf', { type: 'application/pdf' })
    const res = UploadJobDescriptionSchema.safeParse({ mode: 'pdf', jobDescriptionFile: huge })
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.error.issues.some(i => /PDF-filen er for stor/.test(i.message))).toBe(true)
    }
  })

  it('rejects missing text in text mode', () => {
    const res = UploadJobDescriptionSchema.safeParse({ mode: 'text', jobDescriptionText: '' })
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.error.issues.some(i => /Du må lime inn en stillingsbeskrivelse/.test(i.message))).toBe(true)
    }
  })

  it('rejects too short text', () => {
    const short = 'a'.repeat(MIN_JOB_DESCRIPTION_TEXT_LENGTH - 1)
    const res = UploadJobDescriptionSchema.safeParse({ mode: 'text', jobDescriptionText: short })
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.error.issues.some(i => /minst/.test(i.message))).toBe(true)
    }
  })

  it('toJobDescriptionInput transforms values correctly', () => {
    const f = new File(['%PDF'], 'jd.pdf', { type: 'application/pdf' })
    const pdf = toJobDescriptionInput({ mode: 'pdf', jobDescriptionFile: f })
    expect(pdf.mode).toBe('pdf')
    if (pdf.mode === 'pdf') {
      expect(pdf.file).toBe(f)
    }

    const txt = toJobDescriptionInput({ mode: 'text', jobDescriptionText: '  Hello world  ' })
    expect(txt.mode).toBe('text')
    if (txt.mode === 'text') {
      expect(txt.text).toBe('Hello world')
    }
  })
})
