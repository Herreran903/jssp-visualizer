/**
 * app/api/solve-once/route.ts
 * Single-shot execution endpoint:
 * - Accepts multipart (FormData) or JSON body
 * - Returns a complete SolutionEnvelope with meta for immediate visualization/export
 * - No persistence server-side; request -> response only
 */
import { NextResponse } from "next/server"

type SearchLike = { heuristic?: string; timeLimitSec?: number; maxSolutions?: number } | undefined

function buildMeta(input: {
  instanceId?: string
  instanceName?: string
  modelId?: string
  variation?: string
  search?: SearchLike
  solution?: { machines?: any[]; operations?: any[] }
}) {
  const machines = input.solution?.machines || []
  const operations = input.solution?.operations || []
  const jobsSet = new Set<string>()
  for (const op of operations) {
    if (op?.jobId) jobsSet.add(op.jobId)
  }
  const timeLimitMs = (input.search?.timeLimitSec ?? 0) * 1000
  return {
    instanceId: input.instanceId,
    instanceName: input.instanceName || input.instanceId || "inline",
    jobs: jobsSet.size || undefined,
    machines: machines.length || undefined,
    operations: operations.length || undefined,
    elapsedMs: 1234, // mock/default; real backend may override in future
    timeLimit: timeLimitMs || undefined,
    seed: 0,
    strategy: input.search?.heuristic,
    modelId: input.modelId,
    variation: input.variation,
    timestamp: new Date().toISOString(),
  }
}

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || ""
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || ""
  const isMock = process.env.USE_MOCKS === "true"

  if (isMock) {
    // Gather inputs (multipart or JSON)
    let instanceId = ""
    let instanceName = ""
    let modelId = "jobshop"
    let variation = "tardanza"
    let search: any = { heuristic: "greedy", timeLimitSec: 5, maxSolutions: 1 }
    let _fileName = ""

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData()
      const file = form.get("file") as File | null
      if (file) _fileName = file.name
      modelId = (form.get("modelId") as string) || modelId
      variation = (form.get("variation") as string) || ""
      instanceId = (form.get("instanceId") as string) || ""
      instanceName = (form.get("instanceName") as string) || ""
      const s = form.get("search") as string | null
      if (s) {
        try { search = JSON.parse(s) } catch {}
      }
    } else {
      const body = await req.json().catch(() => ({}))
      modelId = body.modelId ?? modelId
      variation = body.variation ?? ""
      instanceId = body.instanceId ?? ""
      instanceName = body.instanceName ?? ""
      search = body.search ?? search
      _fileName = body.fileName ?? _fileName
    }

    // Mock solution payload
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
    const stats = { util: 0.72, w: 12 }

    const solution = { makespan, machines, operations: ops, stats }
    const meta = buildMeta({ instanceId, instanceName, modelId, variation, search, solution })

    return NextResponse.json({
      status: "COMPLETED",
      solution,
      logs: [
        `file:${_fileName || "inline"}`,
        `model:${modelId}`,
        `variation:${variation || ""}`,
        `heuristic:${search?.heuristic ?? "greedy"}`,
      ],
      meta,
    })
  }

  // Real backend proxy; forward request and enrich with meta for the frontend
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData()
    const modelId = (form.get("modelId") as string) || undefined
    const variation = (form.get("variation") as string) || undefined
    const instanceId = (form.get("instanceId") as string) || undefined
    const instanceName = (form.get("instanceName") as string) || undefined
    let search: SearchLike = undefined
    const s = form.get("search") as string | null
    if (s) {
      try { search = JSON.parse(s) } catch {}
    }

    const res = await fetch(`${base}/api/solve-once`, { method: "POST", body: form })
    const data = await res.json()
    const meta = buildMeta({ instanceId, instanceName, modelId, variation, search, solution: data?.solution })
    return NextResponse.json({ ...data, meta }, { status: res.status })
  } else {
    const body = await req.json().catch(() => ({}))
    const res = await fetch(`${base}/api/solve-once`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    })
    const data = await res.json()
    const meta = buildMeta({
      instanceId: body.instanceId,
      instanceName: body.instanceName,
      modelId: body.modelId,
      variation: body.variation,
      search: body.search,
      solution: data?.solution,
    })
    return NextResponse.json({ ...data, meta }, { status: res.status })
  }
}