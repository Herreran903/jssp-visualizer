// components/ui/Chart.tsx
"use client"
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts"

export default function Chart({ data, kind = "bar" }: { data: any[]; kind?: "bar" | "line" }) {
  if (kind === "line") {
    return (
      <div className="font-hand uppercase text-slate-800">
        <LineChart width={600} height={240} data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
          <XAxis dataKey="name" stroke="#334155" />
          <YAxis stroke="#334155" />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#334155" strokeWidth={2} dot={false} />
        </LineChart>
      </div>
    )
  }
  return (
    <div className="font-hand uppercase text-slate-800">
      <BarChart width={600} height={240} data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
        <XAxis dataKey="name" stroke="#334155" />
        <YAxis stroke="#334155" />
        <Tooltip />
        <Bar dataKey="value" fill="#334155" />
      </BarChart>
    </div>
  )
}
