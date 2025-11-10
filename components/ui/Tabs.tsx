// components/ui/Tabs.tsx
"use client"
export default function Tabs({ tabs, active, onChange }: { tabs: string[]; active: number; onChange: (i: number) => void }) {
  return (
    <div className="flex gap-2">
      {tabs.map((t, i) => (
        <button
          key={t}
          onClick={() => onChange(i)}
          className={`px-3 py-1 rounded text-sm focus-visible:ring-2 focus-visible:ring-blue-500 outline-none ${
            i === active
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
