// components/ui/Tabs.tsx
"use client"
export default function Tabs({ tabs, active, onChange }: { tabs: string[]; active: number; onChange: (i: number) => void }) {
  return (
    <div className="flex gap-2 border-b border-(--color-border-subtle)">
      {tabs.map((t, i) => (
        <button
          key={t}
          onClick={() => onChange(i)}
          className={`px-3 py-2 text-base font-hand uppercase rounded-none shadow-none outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) transition-colors ${
            i === active
              ? "border-b-2 border-(--color-accent) text-(--color-text-primary) font-semibold"
              : "border-b-2 border-transparent text-(--color-text-secondary) hover:border-(--color-accent)/40 hover:bg-(--overlay-04)"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
