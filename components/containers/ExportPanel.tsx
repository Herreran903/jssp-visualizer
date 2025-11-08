// components/containers/ExportPanel.tsx
"use client"
import Card from "../ui/Card"
import Button from "../ui/Button"
import Select from "../ui/Select"
import useExport from "../../hooks/useExport"
import { useState, useEffect } from "react"

export default function ExportPanel() {
  const { exportSolution } = useExport()
  const [jobId, setJobId] = useState("")
  const [format, setFormat] = useState<"csv" | "pdf" | "png">("csv")
  const [url, setUrl] = useState("")

  useEffect(() => {
    const last = localStorage.getItem("jssp:lastJobId")
    if (last) setJobId(last)
  }, [])

  async function doExport() {
    if (!jobId) return
    const u = await exportSolution({ solutionId: jobId, format })
    setUrl(u)
  }

  return (
    <Card className="space-y-3">
      <div className="text-lg font-semibold">Exportar</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" placeholder="solutionId" value={jobId} onChange={(e) => setJobId(e.target.value)} />
        <Select value={format} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormat(e.target.value as any)}>
          <option value="csv">CSV</option>
          <option value="pdf">PDF</option>
          <option value="png">PNG</option>
        </Select>
        <Button onClick={doExport}>Generar</Button>
      </div>
      {url && (
        <a href={url} target="_blank" className="text-sm text-blue-400 underline">Descargar</a>
      )}
    </Card>
  )
}
