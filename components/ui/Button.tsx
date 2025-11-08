// components/ui/Button.tsx
'use client'
import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' }

export default function Button({ variant = 'primary', className = '', ...props }: Props) {
  const base =
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none'
  const styles =
    variant === 'primary'
      ? 'bg-blue-600 hover:bg-blue-500 text-white px-4 py-2'
      : 'bg-transparent hover:bg-white/10 text-white px-3 py-2'
  return (
    <button className={`${base} ${styles} ${className}`} {...props} />
  )
}