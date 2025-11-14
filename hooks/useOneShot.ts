'use client'
import { useState } from 'react'
import type { SolverConfig } from '../types/domain'
import type { SolutionEnvelope } from '../types/api'

type RunOnceParams = {
  file?: File
  instanceId?: string
  instanceName?: string
  solverConfig: SolverConfig
}

export default function useOneShot() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SolutionEnvelope | null>(null)

  async function runOnce(params: RunOnceParams) {
    setLoading(true); setError(null)
    try {
      const form = new FormData()
      if (params.file) form.append('file', params.file)
      if (params.instanceId) form.append('instanceId', params.instanceId)
      if (params.instanceName) form.append('instanceName', params.instanceName)
      
      form.append('solverConfig', JSON.stringify(params.solverConfig))
      
      const res = await fetch('/api/solve-once', { method: 'POST', body: form })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setResult(data as SolutionEnvelope)
      return data as SolutionEnvelope
    } catch (e: any) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, result, runOnce }
}