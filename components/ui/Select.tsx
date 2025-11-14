// components/ui/Select.tsx
import React from "react"

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  children?: React.ReactNode
}

export default function Select({ className, children, ...rest }: Props) {
  return (
    <select
      {...rest}
      className={`select-dropdown w-full rounded-none border border-(--color-border-subtle) bg-(--color-surface) px-3 py-2 text-xl text-(--color-text-primary) outline-none hover:bg-(--overlay-02) disabled:opacity-50 shadow-none font-hand uppercase tracking-wide transition-colors ${className || ""}`}
    >
      {children}
    </select>
  )
}
