// components/containers/OneShotRunner.tsx
'use client'
import { useEffect, useState } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Select from '../ui/Select'
import Input from '../ui/Input'
import FileDrop from '../ui/FileDrop'
import GanttMini from '../ui/GanttMini'
import Stat from '../ui/Stat'
import Chart from '../ui/Chart'
import useModels from '../../hooks/useModels'
import useOneShot from '../../hooks/useOneShot'
import type { SearchConfig } from '../../types/domain'

export default function OneShotRunner() {
  const { models } = useModels()
  const { loading, error, result, runOnce } = useOneShot()
  const [file, setFile] = useState<File | undefined>(undefined)
  const [modelId, setModelId] = useState('')
  const [cfg, setCfg] = useState<SearchConfig>({ heuristic: 'greedy', timeLimitSec: 5, maxSolutions: 1 })

  useEffect(() => {
    if (models.length && !modelId) setModelId(models[0].id)
  }, [models, modelId])

  async function onRun() {
    if (!modelId) return
    await runOnce({ file, modelId, search: cfg })
  }

  const stats = result?.solution?.stats || {}
  const chartData = Object.keys(stats).map(k => ({ name: k, value: stats[k] }))

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="text-lg font-semibold">Ejecutar (One-shot)</div>

        <div className="space-y-2">
          <FileDrop onFiles={(files) => setFile(files[0])} />
          {file && <div className="text-xs text-slate-500">{file.name} ({file.size} bytes)</div>}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <div className="mb-1 text-xs text-slate-600">Modelo</div>
            <Select value={modelId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setModelId(e.target.value)}>
              {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </Select>
          </div>
          <div>
            <div className="mb-1 text-xs text-slate-600">Heurística</div>
            <Select value={cfg.heuristic} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCfg({ ...cfg, heuristic: e.target.value as any })}>
              <option value="greedy">Greedy</option>
              <option value="tabu">Tabu</option>
              <option value="sa">SA</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1 text-xs text-slate-600">Tiempo (s)</div>
              <Input type="number" value={cfg.timeLimitSec} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCfg({ ...cfg, timeLimitSec: Number(e.target.value) })} />
            </div>
            <div>
              <div className="mb-1 text-xs text-slate-600">Máx. soluciones</div>
              <Input type="number" value={cfg.maxSolutions} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCfg({ ...cfg, maxSolutions: Number(e.target.value) })} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={onRun} disabled={loading}>{loading ? 'Ejecutando…' : 'Ejecutar'}</Button>
          {error && <div className="text-sm text-red-400">{error}</div>}
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