export function formatBytes(sizeInBytes: number): string {
  if (sizeInBytes < 1024) return `${sizeInBytes} B`;

  const units = ["KB", "MB", "GB"];
  let size = sizeInBytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size = size / 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function formatAnalyzedDate(dateValue: string) {
  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateValue));
}
