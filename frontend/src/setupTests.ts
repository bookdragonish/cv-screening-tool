import '@testing-library/jest-dom'

const originalConsoleError = console.error
const originalConsoleWarn = console.warn

console.error = function(...args: unknown[]) {
  const joined = args.map(a => String(a ?? '')).join(' ')
  if (joined.includes('Missing `Description` or `aria-describedby`')) return
  Reflect.apply(originalConsoleError, console, args)
}

console.warn = function(...args: unknown[]) {
  const joined = args.map(a => String(a ?? '')).join(' ')
  if (joined.includes('Missing `Description` or `aria-describedby`')) return
  Reflect.apply(originalConsoleWarn, console, args)
}