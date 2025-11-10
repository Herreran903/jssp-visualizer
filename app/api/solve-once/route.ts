// app/api/solve-once/route.ts
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || ""

  if (process.env.USE_MOCKS === "true") {
    let modelId = "basic"
    let _fileName = ""
    let _search: any = { heuristic: "greedy", timeLimitSec: 5, maxSolutions: 1 }

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData()
      const file = form.get("file") as File | null
      if (file) _fileName = file.name
      modelId = (form.get("modelId") as string) || modelId
      const s = form.get("search") as string | null
      if (s) {
        try { _search = JSON.parse(s) } catch {}
      }
    } else {
      // JSON body fallback
      const body = await req.json().catch(() => ({}))
      modelId = body.modelId ?? modelId
      _search = body.search ?? _search
      _fileName = body.fileName ?? _fileName
    }

    // Coherent mock solution payload (same shape as /api/solutions/[id])
    const machines = [
      { id: "M1", name: "M1" },
      { id: "M2", name: "M2" },
      { id: "M3", name: "M3" },
    ]
    const ops = [
      { jobId: "J1", machineId: "M1", opId: "J1-1", start: 0, end: 20, duration: 20 },
      { jobId: "J1", machineId: "M2", opId: "J1-2", start: 25, end: 55, duration: 30 },
      { jobId: "J1", machineId: "M3", opId: "J1-3", start: 60, end: 90, duration: 30 },
      { jobId: "J2", machineId: "M2", opId: "J2-1", start: 0, end: 15, duration: 15 },
      { jobId: "J2", machineId: "M3", opId: "J2-2", start: 18, end: 50, duration: 32 },
      { jobId: "J2", machineId: "M1", opId: "J2-3", start: 60, end: 100, duration: 40 },
      { jobId: "J3", machineId: "M3", opId: "J3-1", start: 0, end: 22, duration: 22 },
      { jobId: "J3", machineId: "M1", opId: "J3-2", start: 24, end: 54, duration: 30 },
      { jobId: "J3", machineId: "M2", opId: "J3-3", start: 58, end: 88, duration: 30 },
    ]
    const makespan = 100
    const stats = { makespan, util: 0.72, tardanza: 12 }
    return NextResponse.json({
      status: "COMPLETED",
      solution: { makespan, machines, operations: ops, stats },
      logs: [
        `file:${_fileName || "inline"}`,
        `model:${modelId}`,
        `heuristic:${_search?.heuristic ?? "greedy"}`,
      ],
    })
  }

  // Proxy to backend real endpoint
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || ""
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData()
    const res = await fetch(`${base}/api/solve-once`, { method: "POST", body: form })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } else {
    const body = await req.json()
    const res = await fetch(`${base}/api/solve-once`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  }
}