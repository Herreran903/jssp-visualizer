// components/ui/Tabs.tsx
"use client"
export default function Tabs({ tabs, active, onChange }: { tabs: string[]; active: number; onChange: (i: number) => void }) {
  return (
    <div className="flex gap-2 border-b border-black/10">
      {tabs.map((t, i) => (
        <button
          key={t}
          onClick={() => onChange(i)}
          className={`px-3 py-1 text-sm font-hand tracking-wide normal-case rounded-none shadow-none outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            i === active
              ? "border-b-2 border-black/60 text-slate-900"
              : "border-b-2 border-transparent text-slate-700 hover:border-black/30 hover:bg-black/5"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
