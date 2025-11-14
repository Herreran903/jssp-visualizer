// components/ui/Input.tsx
import React from 'react'
type Props = React.InputHTMLAttributes<HTMLInputElement>
export default function Input(props: Props) {
  return (
    <input
      {...props}
      className={`w-full rounded-none border border-(--color-border-subtle) bg-(--color-surface) px-3 py-2 text-xl text-(--color-text-primary) placeholder-(--color-text-secondary) outline-none hover:bg-(--overlay-02) disabled:opacity-50 shadow-none font-sans normal-case font-hand ${props.className || ''}`}
    />
  )
}