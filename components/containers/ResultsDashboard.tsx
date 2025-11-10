// components/containers/ResultsDashboard.tsx
"use client"
import Card from "../ui/Card"
import Button from "../ui/Button"
import Stat from "../ui/Stat"
import GanttMini from "../ui/GanttMini"
import Chart from "../ui/Chart"
import useSolve from "../../hooks/useSolve"
import { useEffect, useState } from "react"

export default function ResultsDashboard() {
  const { pollSolution, result } = useSolve()
  const [jobId, setJobId] = useState("")

  useEffect(() => {
    const last = localStorage.getItem("jssp:lastJobId")
    if (last) setJobId(last)
  }, [])

  async function load() {
    if (!jobId) return
    await pollSolution(jobId)
  }

  const stats = result?.solution?.stats || {}
  const chartData = Object.keys(stats).map(k => ({ name: k, value: stats[k] }))

  return (
    <div className="space-y-6">
      <Card className="space-y-3">
        <div className="text-lg font-semibold">Resultados</div>
        <div className="flex items-end gap-2">
          <input className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm" placeholder="jobId" value={jobId} onChange={(e) => setJobId(e.target.value)} />
          <Button onClick={load}>Cargar</Button>
        </div>
      </Card>

      {result?.solution && (
        <>
          <Card>
            <div className="mb-3 text-sm text-slate-600">Gantt</div>
            <GanttMini makespan={result.solution.makespan} machines={result.solution.machines} operations={result.solution.operations} />
          </Card>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Stat label="Makespan" value={result.solution.makespan} />
            <Stat label="Ops" value={result.solution.operations.length} />
            <Stat label="Máquinas" value={result.solution.machines.length} />
          </div>
          <Card>
            <div className="mb-3 text-sm text-slate-600">Métricas</div>
            <Chart data={chartData} kind="bar" />
          </Card>
        </>
      )}
    </div>
  )
}
