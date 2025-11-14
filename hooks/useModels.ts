"use client"
import { useCallback, useEffect, useState } from "react"
import type { Model } from "../types/domain"
import type { ModelsListResponse } from "../types/api"
import { getJSON } from "../lib/api"

export default function useModels() {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const listModels = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const data = await getJSON<ModelsListResponse>("/api/models/list")
      setModels(data.models)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { listModels() }, [listModels])

  return { models, loading, error, listModels }
}
