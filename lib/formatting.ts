export function formatDuration(ms: number) {
  if (ms >= 1000) return (ms / 1000).toFixed(2) + "s"
  return ms.toFixed(0) + "ms"
}

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString)
    return date.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  } catch {
    return isoString
  }
}
