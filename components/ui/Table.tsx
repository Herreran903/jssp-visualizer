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
      <table className="w-full text-sm">
        <thead className="text-left text-slate-600">
          <tr>
            {columns.map((c) => (
              <th key={String(c.key)} className="px-3 py-2 font-semibold">{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-t border-slate-200 hover:bg-slate-50">
              {columns.map((c) => (
                <td key={String(c.key)} className="px-3 py-2">
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
