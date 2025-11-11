// components/ui/Button.tsx
'use client'
import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' }

export default function Button({ variant = 'primary', className = '', ...props }: Props) {
  // Paper-integrated, hand-written style: no fills, no strong rounding, neutral ink
  const base =
    'inline-flex items-center justify-center font-hand tracking-wide text-sm normal-case rounded-none shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none'

  const styles =
    variant === 'primary'
      ? 'px-4 py-2 border border-black/30 text-slate-800 bg-transparent hover:bg-black/5'
      : 'px-3 py-2 text-slate-800 bg-transparent hover:bg-black/5 border border-transparent'

  return <button className={`${base} ${styles} ${className}`} {...props} />
}