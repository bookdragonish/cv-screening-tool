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

export function getScoreStyles(score: number) {
  if (score > 80) {
    return {
      barClassName: "bg-emerald-500",
      badgeClassName: "bg-emerald-100 text-emerald-700",
    };
  }

  if (score >= 40) {
    return {
      barClassName: "bg-amber-500",
      badgeClassName: "bg-amber-100 text-amber-700",
    };
  }

  return {
    barClassName: "bg-red-500",
    badgeClassName: "bg-red-100 text-red-700",
  };
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
