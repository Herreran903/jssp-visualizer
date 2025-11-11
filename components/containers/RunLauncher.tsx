/* components/containers/RunLauncher.tsx */
"use client"
import Card from "../ui/Card"
import Button from "../ui/Button"
import Select from "../ui/Select"
import useInstances from "../../hooks/useInstances"
import useModels from "../../hooks/useModels"
import useOneShot from "../../hooks/useOneShot"
import useRunStore from "../../hooks/useRunStore"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { SearchConfig } from "../../types/domain"

export default function RunLauncher() {
  const router = useRouter()
  const { setRun } = useRunStore()
  const { instances } = useInstances()
  const { models } = useModels()
  const { runOnce, loading } = useOneShot()
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
    const inst = instances.find(i => i.id === instanceId)
    const variation = (typeof window !== "undefined" && localStorage.getItem("jssp:variation")) || ""
    const result = await runOnce({
      modelId,
      variation: variation || undefined,
      instanceId,
      instanceName: inst?.name || instanceId,
      search,
    })
    // Keep only in memory for this session and navigate to results
    setRun(result)
    router.replace("/results")
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
          <Button onClick={onRun} disabled={loading}>Ejecutar</Button>
        </div>
      </div>
    </Card>
  )
}
