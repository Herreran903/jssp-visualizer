// lib/gantt.ts
export function toPercent(v: number, total: number) {
  if (total <= 0) return 0
  return (v / total) * 100
}
