// hooks/useSolve.ts
"use client"
import { useCallback, useState } from "react"
import type { SolveRequest, SolveResponse, SolutionEnvelope } from "../types/api"
import { getJSON, postJSON } from "../lib/api"

export default function useSolve() {
  const [jobId, setJobId] = useState<string | null>(null)
  const [status, setStatus] = useState<SolutionEnvelope["status"]>("PENDING")
  const [result, setResult] = useState<SolutionEnvelope | null>(null)

  const runSolve = useCallback(async (payload: SolveRequest) => {
    const res = await postJSON<SolveResponse>("/api/solve", payload)
    setJobId(res.jobId)
    localStorage.setItem("jssp:lastJobId", res.jobId)
    setStatus("PENDING")
    setResult(null)
    return res.jobId
  }, [])

  const pollSolution = useCallback(async (id?: string) => {
    const target = id ?? jobId
    if (!target) return
    const env = await getJSON<SolutionEnvelope>(`/api/solutions/${target}`)
    setStatus(env.status)
    setResult(env)
    return env
  }, [jobId])

  return { jobId, status, result, runSolve, pollSolution }
}
