// components/ui/Select.tsx
'use client'

import React from "react"

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  children?: React.ReactNode
}

export default function Select({ className = "", children, ...rest }: Props) {
  return (
    <select
      {...rest}
      className={[
        "w-full",
        // tamaño igual que antes
        "px-3 py-2 text-xl font-hand uppercase tracking-wide",
        // que se note más el cerrado
        "rounded-none",
        "border-2 border-slate-700",
        "bg-[var(--color-surface)]",
        "text-[var(--color-text-primary)]",
        "shadow-[0_1px_2px_rgba(0,0,0,0.12)]",
        // interacción
        "hover:bg-[var(--overlay-02)]",
        "outline-none",
        "focus:border-sky-500 focus:ring-2 focus:ring-sky-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "transition-colors",
        className,
      ].join(" ")}
    >
      {children}
    </select>
  )
}