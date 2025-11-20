// components/ui/Chart.tsx
"use client"
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line, ResponsiveContainer } from "recharts"

const CustomTooltip = ({ active, payload, label, helpMap }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0]?.value
    const help = label && helpMap ? helpMap[label] : undefined
    return (
      <div className="chart-tooltip">
        <div className="chart-tooltip-label">{label}</div>
        <div className="chart-tooltip-value">{value}</div>
        {help ? <div className="chart-tooltip-help">{help}</div> : null}
      </div>
    )
  }
  return null
}

export default function Chart({ data, kind = "bar", helpMap }: { data: any[]; kind?: "bar" | "line"; helpMap?: Record<string, string> }) {
  if (kind === "line") {
    return (
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border-subtle)"
              strokeWidth={1}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="var(--color-text-secondary)"
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-hand)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border-subtle)', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <YAxis
              stroke="var(--color-text-secondary)"
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-hand)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border-subtle)', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Tooltip content={<CustomTooltip helpMap={helpMap} />} cursor={{ stroke: 'var(--color-accent)', strokeWidth: 1, strokeDasharray: '3 3' }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-accent)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-accent)', strokeWidth: 1, r: 4, stroke: 'var(--color-surface)' }}
              activeDot={{ r: 6, strokeWidth: 1 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border-subtle)"
            strokeWidth={1}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            stroke="var(--color-text-secondary)"
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-hand)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-border-subtle)', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <YAxis
            stroke="var(--color-text-secondary)"
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-hand)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-border-subtle)', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <Tooltip content={<CustomTooltip helpMap={helpMap} />} cursor={{ fill: 'var(--overlay-04)' }} />
          <Bar
            dataKey="value"
            fill="var(--color-accent)"
            radius={0}
            maxBarSize={60}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
