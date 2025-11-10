// components/ui/Input.tsx
import React from 'react'
type Props = React.InputHTMLAttributes<HTMLInputElement>
export default function Input(props: Props) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm ${props.className || ''}`}
    />
  )
}