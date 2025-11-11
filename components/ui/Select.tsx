// components/ui/Select.tsx
import React from "react"
type Props = React.SelectHTMLAttributes<HTMLSelectElement>
export default function Select(props: Props) {
  return (
    <select
      {...props}
      className={`w-full rounded-none border border-black/30 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus:border-blue-500 shadow-none font-hand normal-case ${props.className || ""}`}
    />
  )
}
