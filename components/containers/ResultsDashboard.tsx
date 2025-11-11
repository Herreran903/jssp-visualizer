/* components/containers/ResultsDashboard.tsx */
"use client"
import Card from "../ui/Card"
import Button from "../ui/Button"
import Stat from "../ui/Stat"
import GanttMini from "../ui/GanttMini"
import Chart from "../ui/Chart"
import useRunStore from "../../hooks/useRunStore"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

export default function ResultsDashboard() {
  const router = useRouter()
  const { lastRun, prevRun } = useRunStore()
  const [compare, setCompare] = useState(false)
  const [view, setView] = useState<"A" | "B">("A") // A = lastRun, B = prevRun

  // Guard: if no data in memory, redirect to /run
  useEffect(() => {
    if (!lastRun) router.replace("/run")
  }, [lastRun, router])

  const current = view === "A" ? lastRun : prevRun

  // Summaries and derived metrics
  const summarize = (env: any | null) => {
    if (!env?.solution) return null
    const s = env.solution
    const makespan = s.makespan || 0
    const ops = s.operations || []
    const machines = s.machines || []
    const stats = s.stats || {}
    // per-machine utilization = sum(duration)/makespan
    const durationsByMachine = new Map<string, number>()
    for (const op of ops) {
      durationsByMachine.set(op.machineId, (durationsByMachine.get(op.machineId) || 0) + (op.duration || 0))
    }
    const utilPerMachine: Record<string, number> = {}
    for (const m of machines) {
      const dur = durationsByMachine.get(m.id) || 0
      utilPerMachine[m.id] = makespan > 0 ? +(dur / makespan).toFixed(3) : 0
    }
    return {
      makespan,
      tardinessTotal: Number((stats.tardanza ?? stats.tardiness ?? 0) as number),
      operations: ops.length,
      machines: machines.length,
      violations: Number((stats.violations ?? 0) as number),
      utilPerMachine,
      stats,
    }
  }

  const sumA = useMemo(() => summarize(lastRun), [lastRun])
  const sumB = useMemo(() => summarize(prevRun), [prevRun])
  const canCompare = Boolean(prevRun?.solution)

  // Chart data from current
  const chartData = useMemo(() => {
    const stats = current?.solution?.stats || {}
    return Object.keys(stats).map((k) => ({ name: k, value: stats[k] }))
  }, [current])

  // Actions
  async function copyJSON() {
    if (!lastRun) return
    await navigator.clipboard.writeText(JSON.stringify(lastRun, null, 2))
  }

  function exportJSON() {
    if (!lastRun) return
    const blob = new Blob([JSON.stringify(lastRun, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `jssp-results-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  // Metadata panel data (from lastRun.meta)
  const meta = lastRun?.meta || {}
  const instanceLabel =
    meta.instanceName || meta.instanceId || "—"
  const jmLabel =
    meta.jobs && meta.machines ? `${meta.jobs} × ${meta.machines}` : "—"
  const timeLimitMs =
    typeof meta.timeLimit === "number" ? meta.timeLimit : meta.timeLimit && typeof meta.timeLimit === "string" ? Number(meta.timeLimit) : undefined

  return (
    <div className="space-y-6">
      {/* Panel de metadatos */}
      {lastRun?.solution && (
        <Card className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-lg font-semibold">Ejecución</div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={copyJSON}>Copiar JSON</Button>
              <Button onClick={exportJSON}>Exportar</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <div className="mb-1 text-xs text-slate-600">Instancia</div>
              <div className="text-sm">{instanceLabel}</div>
            </div>
            <div>
              <div className="mb-1 text-xs text-slate-600">Jobs × Máquinas</div>
              <div className="text-sm">{jmLabel}</div>
            </div>
            <div>
              <div className="mb-1 text-xs text-slate-600">Fecha/Hora</div>
              <div className="text-sm">{meta.timestamp || "—"}</div>
            </div>
            <div>
              <div className="mb-1 text-xs text-slate-600">Estrategia</div>
              <div className="text-sm">{meta.strategy || "—"}</div>
            </div>
            <div>
              <div className="mb-1 text-xs text-slate-600">Modelo</div>
              <div className="text-sm">
                {meta.modelId || "—"}{meta.variation ? ` · ${meta.variation}` : ""}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs text-slate-600">Tiempo/Seed</div>
              <div className="text-sm">
                {typeof meta.elapsedMs === "number" ? `${meta.elapsedMs} ms` : "—"}
                {typeof timeLimitMs === "number" ? ` / límite ${timeLimitMs} ms` : ""}
                {typeof meta.seed === "number" ? ` · seed ${meta.seed}` : ""}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Comparador simple */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Resultados</div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-700">
              <input
                type="checkbox"
                className="mr-2 align-middle"
                checked={compare}
                onChange={(e) => setCompare(e.target.checked)}
                disabled={!canCompare}
                title={canCompare ? "" : "Aún no hay ejecución anterior"}
              />
              Comparar con ejecución anterior
            </label>
            <div className="flex items-center gap-1">
              <Button variant="ghost" onClick={() => setView("A")} disabled={view === "A"}>A</Button>
              <Button variant="ghost" onClick={() => setView("B")} disabled={!canCompare || view === "B"} title={canCompare ? "" : "Aún no hay ejecución anterior"}>B</Button>
            </div>
          </div>
        </div>

        {compare && lastRun?.solution && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-semibold">Métrica</th>
                  <th className="px-3 py-2 font-semibold">Última</th>
                  <th className="px-3 py-2 font-semibold">Anterior</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-200">
                  <td className="px-3 py-2">Makespan</td>
                  <td className="px-3 py-2">{sumA?.makespan ?? "—"}</td>
                  <td className="px-3 py-2">{sumB?.makespan ?? "—"}</td>
                </tr>
                <tr className="border-t border-slate-200">
                  <td className="px-3 py-2">Tardiness total</td>
                  <td className="px-3 py-2">{sumA?.tardinessTotal ?? "—"}</td>
                  <td className="px-3 py-2">{sumB?.tardinessTotal ?? "—"}</td>
                </tr>
                <tr className="border-t border-slate-200">
                  <td className="px-3 py-2">#Operaciones</td>
                  <td className="px-3 py-2">{sumA?.operations ?? "—"}</td>
                  <td className="px-3 py-2">{sumB?.operations ?? "—"}</td>
                </tr>
                <tr className="border-t border-slate-200">
                  <td className="px-3 py-2">#Violaciones</td>
                  <td className="px-3 py-2">{sumA?.violations ?? "—"}</td>
                  <td className="px-3 py-2">{sumB?.violations ?? "—"}</td>
                </tr>
                <tr className="border-t border-slate-200 align-top">
                  <td className="px-3 py-2">Utilización por máquina</td>
                  <td className="px-3 py-2">
                    {sumA?.utilPerMachine
                      ? Object.entries(sumA.utilPerMachine).map(([m, v]) => (
                          <span key={m} className="mr-3">{m}: {v}</span>
                        ))
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {sumB?.utilPerMachine
                      ? Object.entries(sumB.utilPerMachine).map(([m, v]) => (
                          <span key={m} className="mr-3">{m}: {v}</span>
                        ))
                      : "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Gantt con switch A/B (una sola vista) */}
      {current?.solution && (
        <>
          <Card>
            <div className="mb-3 text-sm text-slate-600">Gantt</div>
            <GanttMini
              makespan={current.solution.makespan}
              machines={current.solution.machines}
              operations={current.solution.operations}
            />
          </Card>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Stat label="Makespan" value={current.solution.makespan} />
            <Stat label="Ops" value={current.solution.operations.length} />
            <Stat label="Máquinas" value={current.solution.machines.length} />
          </div>

          {/* Métricas detalladas */}
          <Card>
            <div className="mb-3 text-sm text-slate-600">Métricas</div>
            <Chart data={chartData} kind="bar" />
          </Card>
        </>
      )}
    </div>
  )
}
