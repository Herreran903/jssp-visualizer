// components/containers/InstanceList.tsx
"use client"
import Card from "../ui/Card"
import Table, { Column } from "../ui/Table"
import useInstances from "../../hooks/useInstances"
import type { InstanceSummary } from "../../types/domain"

export default function InstanceList() {
  const { instances, loading } = useInstances()
  const cols: Column<InstanceSummary>[] = [
    { key: "name", header: "Nombre" },
    { key: "size", header: "Tamaño" },
    { key: "createdAt", header: "Fecha" },
    { key: "id", header: "ID" },
  ]
  return (
    <Card className="space-y-3 font-hand">
      <div className="text-xl font-bold uppercase">Lista</div>
      {loading ? <div className="text-sm text-slate-700 uppercase">Cargando…</div> : <Table data={instances} columns={cols} />}
    </Card>
  )
}
