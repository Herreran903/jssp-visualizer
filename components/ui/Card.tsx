// components/ui/Card.tsx
import React from 'react'

export default function Card({ children, className = '' }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <section
      className={`px-6 py-4 rounded-none ${className}`}
    >
      {children}
    </section>
  )
}