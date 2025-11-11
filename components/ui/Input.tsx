// components/ui/Input.tsx
import React from 'react'
type Props = React.InputHTMLAttributes<HTMLInputElement>
export default function Input(props: Props) {
  return (
    <input
      {...props}
      className={`w-full rounded-none border border-black/30 bg-transparent px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus:border-blue-500 shadow-none font-hand normal-case ${props.className || ''}`}
    />
  )
}