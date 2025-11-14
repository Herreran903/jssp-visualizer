// components/ui/Button.tsx
'use client'
import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'outline' }

export default function Button({ variant = 'primary', className = '', ...props }: Props) {
  // Paper-integrated, hand-written style: no fills, no strong rounding, neutral ink
  const base =
    'inline-flex items-center justify-center font-hand tracking-wide text-base uppercase rounded-none select-none disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-colors cursor-pointer shadow-none'

  const styles =
    variant === 'primary'
      ? 'px-4 py-2 bg-[var(--color-accent)] text-[var(--color-accent-contrast)] border border-transparent hover:brightness-105 active:brightness-95'
      : variant === 'outline'
      ? 'px-3 py-2 text-[var(--color-accent)] bg-transparent border border-[var(--color-accent)] hover:bg-[var(--overlay-08)]'
      : 'px-3 py-2 text-[var(--color-accent)] bg-transparent hover:bg-[var(--overlay-08)] border border-transparent'

  return <button className={`${base} ${styles} ${className}`} {...props} />
}