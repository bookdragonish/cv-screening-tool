import '@testing-library/jest-dom'

const originalConsoleError = console.error
const originalConsoleWarn = console.warn

console.error = function(...args: unknown[]) {
  const joined = args.map(a => String(a ?? '')).join(' ')
  if (joined.includes('Missing `Description` or `aria-describedby`')) return
  originalConsoleError.apply(console, args as any)
}

console.warn = function(...args: unknown[]) {
  const joined = args.map(a => String(a ?? '')).join(' ')
  if (joined.includes('Missing `Description` or `aria-describedby`')) return
  originalConsoleWarn.apply(console, args as any)
}