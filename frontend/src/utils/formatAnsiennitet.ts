export function formatAnsiennitet(
  ansiennitet: [number | null, number | null, number | null] | null | undefined
): string {
  if (!ansiennitet) return "Ingen"

  const [years, months, days] = ansiennitet
  const parts = []

  if (years) parts.push(`${years} ${years === 1 ? "år" : "år"}`)
  if (months) parts.push(`${months} ${months === 1 ? "måned" : "måneder"}`)
  if (days) parts.push(`${days} ${days === 1 ? "dag" : "dager"}`)

  return parts.length === 0 ? "Ingen" : parts.join(", ")
}