// components/containers/SearchConfigurator.tsx
"use client"
import Card from "../ui/Card"
import Select from "../ui/Select"
import Input from "../ui/Input"
import { useEffect, useState } from "react"
import type { SearchConfig } from "../../types/domain"

export default function SearchConfigurator() {
  const [cfg, setCfg] = useState<SearchConfig>({ heuristic: "greedy", timeLimitSec: 5, maxSolutions: 1 })

  // Load persisted config on client to avoid SSR localStorage access
  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = localStorage.getItem("jssp:searchConfig")
    if (saved) {
      try { setCfg(JSON.parse(saved)) } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("jssp:searchConfig", JSON.stringify(cfg))
  }, [cfg])

  return (
    <Card className="space-y-3 font-hand">
      <div className="text-xl font-bold uppercase">Búsqueda</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <div className="mb-1 text-xs text-slate-700 uppercase">Heurística</div>
          <Select value={cfg.heuristic} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCfg({ ...cfg, heuristic: e.target.value as any })}>
            <option value="greedy">Greedy</option>
            <option value="tabu">Tabu</option>
            <option value="sa">SA</option>
          </Select>
        </div>
        <div>
          <div className="mb-1 text-xs text-slate-700 uppercase">Tiempo (s)</div>
          <Input type="number" value={cfg.timeLimitSec} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCfg({ ...cfg, timeLimitSec: Number(e.target.value) })} />
        </div>
        <div>
          <div className="mb-1 text-xs text-slate-700 uppercase">Máx. soluciones</div>
          <Input type="number" value={cfg.maxSolutions} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCfg({ ...cfg, maxSolutions: Number(e.target.value) })} />
        </div>
      </div>
    </Card>
  )
}
