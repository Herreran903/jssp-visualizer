// hooks/useExport.ts
"use client"
import type { ExportRequest, ExportResponse } from "../types/api"
import { postJSON } from "../lib/api"

export default function useExport() {
  async function exportSolution(req: ExportRequest) {
    const res = await postJSON<ExportResponse>("/api/export", req)
    return res.url
  }
  return { exportSolution }
}
