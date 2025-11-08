// components/ui/Input.tsx
import React from 'react'
type Props = React.InputHTMLAttributes<HTMLInputElement>
export default function Input(props: Props) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 ${props.className || ''}`}
    />
  )
}