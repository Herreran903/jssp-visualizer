// components/ui/Card.tsx
import React from 'react'

export default function Card({ children, className = '' }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`rounded-lg border border-white/10 bg-white/5 p-4 ${className}`}>{children}</div>
}