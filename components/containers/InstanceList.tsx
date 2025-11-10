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
    <Card>
      <div className="mb-2 text-lg font-semibold">Lista</div>
      {loading ? <div className="text-sm text-slate-600">Cargando…</div> : <Table data={instances} columns={cols} />}
    </Card>
  )
}
