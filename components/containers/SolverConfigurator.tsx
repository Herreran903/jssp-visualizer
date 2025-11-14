// components/containers/SolverConfigurator.tsx
"use client"
import { useEffect, useState } from "react"
import { Settings } from "lucide-react"
import Card from "../ui/Card"
import Select from "../ui/Select"
import Input from "../ui/Input"
import type { SolverConfig, ProblemType, MiniZincSolver, SearchHeuristic, ValueChoice } from "../../types/domain"

const PROBLEM_TYPES: { value: ProblemType; label: string }[] = [
  { value: 'jssp_maint', label: 'JSSP con Mantenimiento' },
  { value: 'tardanza_ponderada', label: 'Tardanza Ponderada' },
]

const SOLVERS: { value: MiniZincSolver; label: string }[] = [
  { value: 'chuffed', label: 'Chuffed' },
  { value: 'gecode', label: 'Gecode' },
  { value: 'or-tools', label: 'OR-Tools' },
]

const SEARCH_HEURISTICS: { value: SearchHeuristic; label: string; description: string }[] = [
  { value: 'input_order', label: 'Input Order', description: 'Orden de entrada' },
  { value: 'first_fail', label: 'First Fail', description: 'Primero el dominio más pequeño' },
  { value: 'smallest', label: 'Smallest', description: 'Menor valor del dominio' },
  { value: 'largest', label: 'Largest', description: 'Mayor valor del dominio' },
  { value: 'dom_w_deg', label: 'Dom/Wdeg', description: 'Dominio ponderado por grado' },
  { value: 'impact', label: 'Impact', description: 'Basado en impacto' },
  { value: 'activity', label: 'Activity', description: 'Basado en actividad' },
]

const VALUE_CHOICES: { value: ValueChoice; label: string; description: string }[] = [
  { value: 'indomain_min', label: 'Min', description: 'Valor mínimo del dominio' },
  { value: 'indomain_max', label: 'Max', description: 'Valor máximo del dominio' },
  { value: 'indomain_middle', label: 'Middle', description: 'Valor medio del dominio' },
  { value: 'indomain_median', label: 'Median', description: 'Mediana del dominio' },
  { value: 'indomain_random', label: 'Random', description: 'Valor aleatorio' },
  { value: 'indomain_split', label: 'Split', description: 'División del dominio' },
]

export default function SolverConfigurator() {
  const [config, setConfig] = useState<SolverConfig>({
    problemType: 'jssp_maint',
    solver: 'chuffed',
    searchHeuristic: 'first_fail',
    valueChoice: 'indomain_min',
    timeLimitSec: 30,
    maxSolutions: 1,
  })

  // Load persisted config on client
  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('jssp:solverConfig')
    if (saved) {
      try {
        setConfig(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading solver config:', e)
      }
    }
  }, [])

  // Persist config changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('jssp:solverConfig', JSON.stringify(config))
  }, [config])

  return (
    <Card className="space-y-4 font-hand">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5" />
        <div className="text-xl font-bold uppercase">Configuración del Solver</div>
      </div>

      {/* Problem Type */}
      <div>
        <div className="mb-1 text-xs text-slate-700 uppercase">Tipo de Problema</div>
        <Select
          value={config.problemType}
          onChange={(e) => setConfig({ ...config, problemType: e.target.value as ProblemType })}
        >
          {PROBLEM_TYPES.map(pt => (
            <option key={pt.value} value={pt.value}>{pt.label}</option>
          ))}
        </Select>
      </div>

      {/* Solver Selection */}
      <div>
        <div className="mb-1 text-xs text-slate-700 uppercase">Solver de MiniZinc</div>
        <Select
          value={config.solver}
          onChange={(e) => setConfig({ ...config, solver: e.target.value as MiniZincSolver })}
        >
          {SOLVERS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </Select>
      </div>

      {/* Search Strategy */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1 text-xs text-slate-700 uppercase">Heurística de Búsqueda</div>
          <Select
            value={config.searchHeuristic}
            onChange={(e) => setConfig({ ...config, searchHeuristic: e.target.value as SearchHeuristic })}
          >
            {SEARCH_HEURISTICS.map(h => (
              <option key={h.value} value={h.value} title={h.description}>
                {h.label}
              </option>
            ))}
          </Select>
          <div className="mt-1 text-xs text-slate-500">
            {SEARCH_HEURISTICS.find(h => h.value === config.searchHeuristic)?.description}
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs text-slate-700 uppercase">Elección de Valor</div>
          <Select
            value={config.valueChoice}
            onChange={(e) => setConfig({ ...config, valueChoice: e.target.value as ValueChoice })}
          >
            {VALUE_CHOICES.map(v => (
              <option key={v.value} value={v.value} title={v.description}>
                {v.label}
              </option>
            ))}
          </Select>
          <div className="mt-1 text-xs text-slate-500">
            {VALUE_CHOICES.find(v => v.value === config.valueChoice)?.description}
          </div>
        </div>
      </div>

      {/* Time and Solutions Limits */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1 text-xs text-slate-700 uppercase">Tiempo Máximo (segundos)</div>
          <Input
            type="number"
            min="1"
            max="3600"
            value={config.timeLimitSec}
            onChange={(e) => setConfig({ ...config, timeLimitSec: Number(e.target.value) })}
          />
        </div>

        <div>
          <div className="mb-1 text-xs text-slate-700 uppercase">Máximo de Soluciones</div>
          <Input
            type="number"
            min="1"
            max="100"
            value={config.maxSolutions}
            onChange={(e) => setConfig({ ...config, maxSolutions: Number(e.target.value) })}
          />
        </div>
      </div>

      {/* Info Box */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-slate-700">
        <div className="font-bold uppercase mb-1">Configuración Actual:</div>
        <div className="space-y-1">
          <div>• Problema: <span className="font-mono">{config.problemType}</span></div>
          <div>• Solver: <span className="font-mono">{config.solver}</span></div>
          <div>• Estrategia: <span className="font-mono">{config.searchHeuristic}</span> + <span className="font-mono">{config.valueChoice}</span></div>
          <div>• Límites: {config.timeLimitSec}s, {config.maxSolutions} sol{config.maxSolutions > 1 ? 's' : ''}</div>
        </div>
      </div>
    </Card>
  )
}