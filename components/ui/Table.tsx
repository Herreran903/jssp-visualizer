// components/ui/Table.tsx
import React from "react"

export interface Column<T> {
  key: keyof T
  header: string
  render?: (row: T) => React.ReactNode
}

export default function Table<T extends object>({ data, columns }: { data: T[]; columns: Column<T>[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-(--color-text-primary) font-sans">
        <thead className="text-left text-(--color-text-secondary) border-b border-(--color-border-subtle) bg-(--color-surface-alt)">
          <tr>
            {columns.map((c) => (
              <th key={String(c.key)} className="px-3 py-2 font-semibold tracking-normal">{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-b border-dashed border-(--color-border-subtle) hover:bg-(--overlay-02)">
              {columns.map((c) => (
                <td key={String(c.key)} className="px-3 py-2 align-top">
                  {c.render ? c.render(row) : String((row as any)[c.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
