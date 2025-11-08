// components/ui/Chart.tsx
"use client"
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts"

export default function Chart({ data, kind = "bar" }: { data: any[]; kind?: "bar" | "line" }) {
  if (kind === "line") {
    return (
      <LineChart width={600} height={240} data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="name" stroke="#9ca3af" />
        <YAxis stroke="#9ca3af" />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={2} dot={false} />
      </LineChart>
    )
  }
  return (
    <BarChart width={600} height={240} data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
      <XAxis dataKey="name" stroke="#9ca3af" />
      <YAxis stroke="#9ca3af" />
      <Tooltip />
      <Bar dataKey="value" fill="#60a5fa" />
    </BarChart>
  )
}
