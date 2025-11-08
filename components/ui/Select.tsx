// components/ui/Select.tsx
import React from "react"
type Props = React.SelectHTMLAttributes<HTMLSelectElement>
export default function Select(props: Props) {
  return (
    <select
      {...props}
      className={`w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 ${props.className || ""}`}
    />
  )
}
