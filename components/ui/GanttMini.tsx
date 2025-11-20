// components/ui/GanttMini.tsx
import React from "react"
import type { Operation, Machine, MaintenanceWindow } from "../../types/solution"
import { toPercent } from "../../lib/gantt"

export default function GanttMini({
  makespan,
  machines,
  operations,
  maintenanceWindows = []
}: {
  makespan: number
  machines: Machine[]
  operations: Operation[]
  maintenanceWindows?: MaintenanceWindow[]
}) {
  const opsByMachine = new Map<string, Operation[]>()
  operations.forEach((op) => {
    if (!opsByMachine.has(op.machineId)) opsByMachine.set(op.machineId, [])
    opsByMachine.get(op.machineId)!.push(op)
  })

  machines.forEach((m) => {
    opsByMachine.set(m.id, (opsByMachine.get(m.id) || []).sort((a, b) => a.start - b.start))
  })

  // Group maintenance windows by machine
  const maintByMachine = new Map<string, MaintenanceWindow[]>()
  maintenanceWindows.forEach((mw) => {
    if (!maintByMachine.has(mw.machineId)) maintByMachine.set(mw.machineId, [])
    maintByMachine.get(mw.machineId)!.push(mw)
  })

  // Generate unique colors for each job
  const uniqueJobs = Array.from(new Set(operations.map(op => op.jobId))).sort()
  const jobColors = new Map<string, string>()
  
  const colorPalette = [
    '#1E40AF', // blue-800
    '#B91C1C', // red-700
    '#15803D', // green-700
    '#A16207', // yellow-700
    '#7C3AED', // violet-600
    '#DB2777', // pink-600
    '#0891B2', // cyan-600
    '#EA580C', // orange-600
    '#4338CA', // indigo-700
    '#059669', // emerald-600
  ]
  
  uniqueJobs.forEach((jobId, idx) => {
    jobColors.set(jobId, colorPalette[idx % colorPalette.length])
  })

  return (
    <div className="gantt-enhanced">
      {/* Time axis header */}
      <div className="gantt-header">
        <div className="gantt-machine-label-header">Machine</div>
        <div className="gantt-timeline-header">
          <div className="gantt-grid-overlay" />
          {[0, 25, 50, 75, 100].map((tick) => (
            <div
              key={tick}
              className="gantt-tick"
              style={{ left: `${tick}%` }}
            >
              <span className="gantt-tick-label">{Math.round((tick / 100) * makespan)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Machine rows */}
      <div className="gantt-body">
        {machines.map((m, idx) => (
          <div key={m.id} className="gantt-machine-row">
            <div className="gantt-machine-label">
              <div className="gantt-machine-name">{m.name}</div>
              <div className="gantt-machine-id">{m.id}</div>
            </div>
            <div className="gantt-timeline">
              <div className="gantt-grid-overlay" />
              
              {/* Maintenance windows */}
              {(maintByMachine.get(m.id) || []).map((mw, mwIdx) => {
                const left = toPercent(mw.start, makespan)
                const width = toPercent(mw.duration, makespan)
                
                return (
                  <div
                    key={`maint-${m.id}-${mwIdx}`}
                    className="gantt-maintenance"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                    }}
                    title={`Mantenimiento\nMáquina: ${m.name}\nInicio: ${mw.start}\nFin: ${mw.end}\nDuración: ${mw.duration}`}
                  >
                    <span className="gantt-maintenance-label">MANT</span>
                  </div>
                )
              })}
              
              {/* Operations */}
              {(opsByMachine.get(m.id) || []).map((op) => {
                const left = toPercent(op.start, makespan)
                const width = toPercent(op.duration, makespan)
                const color = jobColors.get(op.jobId) || '#334155'
                
                return (
                  <div
                    key={op.opId}
                    className="gantt-operation"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      backgroundColor: color,
                      borderColor: color,
                    }}
                    title={`Job: ${op.jobId}\nMachine: ${m.name}\nStart: ${op.start}\nEnd: ${op.end}\nDuration: ${op.duration}`}
                  >
                    <span className="gantt-operation-label">{op.jobId}</span>
                    <span className="gantt-operation-time">{op.duration}u</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="gantt-legend">
        <div className="gantt-legend-title">Jobs:</div>
        <div className="gantt-legend-items">
          {uniqueJobs.map((jobId) => (
            <div key={jobId} className="gantt-legend-item">
              <div
                className="gantt-legend-color"
                style={{ backgroundColor: jobColors.get(jobId) }}
              />
              <span className="gantt-legend-label">{jobId}</span>
            </div>
          ))}
          {maintenanceWindows.length > 0 && (
            <div className="gantt-legend-item">
              <div
                className="gantt-legend-color gantt-legend-maintenance"
              />
              <span className="gantt-legend-label">Mantenimiento</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
