// components/containers/ModelConfigurator.tsx
"use client"
import Card from "../ui/Card"
import Select from "../ui/Select"
import useModels from "../../hooks/useModels"
import { useEffect, useState } from "react"

export default function ModelConfigurator() {
  const { models } = useModels()
  const [modelId, setModelId] = useState("")
  const [variation, setVariation] = useState("")

  useEffect(() => {
    if (models.length && !modelId) {
      setModelId(models[0].id)
      setVariation(models[0].variations[0] || "")
    }
  }, [models, modelId])

  useEffect(() => {
    localStorage.setItem("jssp:modelId", modelId)
    localStorage.setItem("jssp:variation", variation)
  }, [modelId, variation])

  const selected = models.find(m => m.id === modelId)

  return (
    <Card className="space-y-3">
      <div className="text-lg font-semibold">Modelo</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1 text-xs text-slate-600">Modelo</div>
          <Select value={modelId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setModelId(e.target.value)}>
            {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </Select>
        </div>
        <div>
          <div className="mb-1 text-xs text-slate-600">Variación</div>
          <Select value={variation} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setVariation(e.target.value)}>
            {(selected?.variations || []).map(v => <option key={v} value={v}>{v}</option>)}
          </Select>
        </div>
      </div>
    </Card>
  )
}
