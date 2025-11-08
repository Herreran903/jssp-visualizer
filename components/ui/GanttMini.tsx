// components/ui/GanttMini.tsx
import React from "react"
import type { Operation, Machine } from "../../types/solution"
import { toPercent } from "../../lib/gantt"

export default function GanttMini({ makespan, machines, operations }: { makespan: number; machines: Machine[]; operations: Operation[] }) {
  const opsByMachine = new Map<string, Operation[]>()
  operations.forEach((op) => {
    if (!opsByMachine.has(op.machineId)) opsByMachine.set(op.machineId, [])
    opsByMachine.get(op.machineId)!.push(op)
  })

  machines.forEach((m) => {
    opsByMachine.set(m.id, (opsByMachine.get(m.id) || []).sort((a, b) => a.start - b.start))
  })

  return (
    <div className="gantt relative">
      <div className="gantt-grid" />
      <div className="min-w-[800px]">
        {machines.map((m) => (
          <div key={m.id} className="gantt-row">
            {(opsByMachine.get(m.id) || []).map((op) => {
              const left = toPercent(op.start, makespan)
              const width = toPercent(op.duration, makespan)
              return (
                <div
                  key={op.opId}
                  className="gantt-bar"
                  style={{ left: `${left}%`, width: `${width}%` }}
                  data-job={op.jobId}
                  title={`${op.jobId} [${op.start}-${op.end}] ${op.duration}`}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
