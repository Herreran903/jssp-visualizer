// components/ui/Select.tsx
import React from "react"
type Props = React.SelectHTMLAttributes<HTMLSelectElement>
export default function Select(props: Props) {
  return (
    <select
      {...props}
      className={`w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm ${props.className || ""}`}
    />
  )
}
