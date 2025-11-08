// components/ui/Tabs.tsx
"use client"
export default function Tabs({ tabs, active, onChange }: { tabs: string[]; active: number; onChange: (i: number) => void }) {
  return (
    <div className="flex gap-2">
      {tabs.map((t, i) => (
        <button
          key={t}
          onClick={() => onChange(i)}
          className={`px-3 py-1 rounded text-sm ${i === active ? "bg-blue-600 text-white" : "bg-white/5 text-gray-300 hover:bg-white/10"}`}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
