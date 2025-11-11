// components/ui/Card.tsx
import React from 'react'

export default function Card({ children, className = '' }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <section
      className={`px-6 py-4 border-b border-black/10 border-dashed bg-transparent rounded-none shadow-none ${className}`}
    >
      {children}
    </section>
  )
}