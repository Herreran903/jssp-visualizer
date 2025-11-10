// components/containers/RunLauncher.tsx
"use client"
import Card from "../ui/Card"
import Button from "../ui/Button"
import Select from "../ui/Select"
import useInstances from "../../hooks/useInstances"
import useModels from "../../hooks/useModels"
import useSolve from "../../hooks/useSolve"
import { useEffect, useState } from "react"
import type { SearchConfig } from "../../types/domain"

export default function RunLauncher() {
  const { instances } = useInstances()
  const { models } = useModels()
  const { runSolve, pollSolution, jobId, status } = useSolve()
  const [instanceId, setInstanceId] = useState("")
  const [modelId, setModelId] = useState("")
  const [search, setSearch] = useState<SearchConfig>({ heuristic: "greedy", timeLimitSec: 5, maxSolutions: 1 })

  // Load persisted config on client to avoid SSR localStorage access
  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = localStorage.getItem("jssp:searchConfig")
    if (saved) {
      try { setSearch(JSON.parse(saved)) } catch {}
    }
  }, [])

  useEffect(() => {
    if (instances.length && !instanceId) setInstanceId(instances[0].id)
    if (models.length && !modelId) setModelId(models[0].id)
  }, [instances, models, instanceId, modelId])

  async function onRun() {
    if (!instanceId || !modelId) return
    await runSolve({ instanceId, modelId, search })
  }

  async function onPoll() {
    await pollSolution()
  }

  return (
    <Card className="space-y-3">
      <div className="text-lg font-semibold">Ejecutar</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <div className="mb-1 text-xs text-slate-600">Instancia</div>
          <Select value={instanceId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setInstanceId(e.target.value)}>
            {instances.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </Select>
        </div>
        <div>
          <div className="mb-1 text-xs text-slate-600">Modelo</div>
          <Select value={modelId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setModelId(e.target.value)}>
            {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={onRun}>Ejecutar</Button>
          <Button variant="ghost" onClick={onPoll}>Polling</Button>
        </div>
      </div>
      {jobId && (
        <div className="text-sm text-slate-600">
          jobId: <span className="font-mono">{jobId}</span> — estado: <span className="font-semibold">{status}</span>
        </div>
      )}
    </Card>
  )
}
