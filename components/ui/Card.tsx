 // components/ui/Card.tsx
 import React from 'react'

 export default function Card({ children, className = '' }: React.PropsWithChildren<{ className?: string }>) {
   return (
     <div
       className={`rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:bg-slate-50 transition-colors ${className}`}
     >
       {children}
     </div>
   )
 }