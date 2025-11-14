import { NextResponse } from "next/server"
import type { SolverConfig } from "../../../types/domain"
import { createMockSolution } from "../../../lib/mock-solution"

function buildMeta(input: {
  instanceId?: string
  instanceName?: string
  solverConfig?: SolverConfig
  solution?: { machines?: any[]; operations?: any[] }
}) {
  const machines = input.solution?.machines || []
  const operations = input.solution?.operations || []
  const jobsSet = new Set<string>()
  for (const op of operations) {
    if (op?.jobId) jobsSet.add(op.jobId)
  }
  const timeLimitMs = (input.solverConfig?.timeLimitSec ?? 0) * 1000
  return {
    instanceId: input.instanceId,
    instanceName: input.instanceName || input.instanceId || "inline",
    jobs: jobsSet.size || undefined,
    machines: machines.length || undefined,
    operations: operations.length || undefined,
    elapsedMs: 1234,
    timeLimit: timeLimitMs || undefined,
    seed: 0,
    strategy: input.solverConfig?.searchHeuristic,
    modelId: input.solverConfig?.problemType,
    variation: input.solverConfig?.solver,
    timestamp: new Date().toISOString(),
  }
}

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || ""
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ""
  const useMocks = process.env.USE_MOCKS === "true"

  if (useMocks) {
    let instanceId = ""
    let instanceName = ""
    let solverConfig: SolverConfig = {
      problemType: 'jssp_maint',
      solver: 'chuffed',
      searchHeuristic: 'first_fail',
      valueChoice: 'indomain_min',
      timeLimitSec: 30,
      maxSolutions: 1,
    }

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData()
      instanceId = (form.get("instanceId") as string) || ""
      instanceName = (form.get("instanceName") as string) || ""
      const sc = form.get("solverConfig") as string | null
      if (sc) {
        try { solverConfig = JSON.parse(sc) } catch {}
      }
    } else {
      const body = await req.json().catch(() => ({}))
      instanceId = body.instanceId ?? ""
      instanceName = body.instanceName ?? ""
      solverConfig = body.solverConfig ?? solverConfig
    }

    const mockResponse = createMockSolution({
      instanceId,
      instanceName,
      problemType: solverConfig.problemType,
      solver: solverConfig.solver,
      searchHeuristic: solverConfig.searchHeuristic,
      valueChoice: solverConfig.valueChoice,
      timeLimitSec: solverConfig.timeLimitSec,
      maxSolutions: solverConfig.maxSolutions,
    })

    return NextResponse.json(mockResponse)
  }

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData()
    const instanceId = (form.get("instanceId") as string) || undefined
    const instanceName = (form.get("instanceName") as string) || undefined
    let solverConfig: SolverConfig | undefined = undefined
    const sc = form.get("solverConfig") as string | null
    if (sc) {
      try { solverConfig = JSON.parse(sc) } catch {}
    }

    const res = await fetch(`${backendUrl}/api/solve-once`, { method: "POST", body: form })
    const data = await res.json()
    const meta = buildMeta({ instanceId, instanceName, solverConfig, solution: data?.solution })
    return NextResponse.json({ ...data, meta }, { status: res.status })
  } else {
    const body = await req.json().catch(() => ({}))
    const res = await fetch(`${backendUrl}/api/solve-once`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    })
    const data = await res.json()
    const meta = buildMeta({
      instanceId: body.instanceId,
      instanceName: body.instanceName,
      solverConfig: body.solverConfig,
      solution: data?.solution,
    })
    return NextResponse.json({ ...data, meta }, { status: res.status })
  }
}