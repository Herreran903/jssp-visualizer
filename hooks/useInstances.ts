// hooks/useInstances.ts
'use client'
import { useCallback, useEffect, useState } from 'react'
import type { InstanceForm, InstanceSummary } from '../types/domain'
import type { InstancesListResponse, UploadInstanceResponse } from '../types/api'
import { getJSON, postForm } from '../lib/api'

export default function useInstances() {
  const [instances, setInstances] = useState<InstanceSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const listInstances = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const data = await getJSON<InstancesListResponse>('/api/instances/list')
      const drafts = JSON.parse(localStorage.getItem('jssp:drafts') || '[]')
      setInstances([...(data || []), ...drafts])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { listInstances() }, [listInstances])

  const uploadInstance = useCallback(async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    const res = await postForm<UploadInstanceResponse>('/api/instances/upload', form)
    await listInstances()
    return res.instanceId
  }, [listInstances])

  const createFromForm = useCallback(async (data: InstanceForm) => {
    const id = 'draft-' + Math.random().toString(36).slice(2, 8)
    const draft: InstanceSummary = { id, name: data.name, size: 0, createdAt: new Date().toISOString() }
    const draftsKey = 'jssp:drafts'
    const drafts = JSON.parse(localStorage.getItem(draftsKey) || '[]')
    drafts.push(draft)
    localStorage.setItem(draftsKey, JSON.stringify(drafts))
    await listInstances()
    return id
  }, [listInstances])

  return { instances, loading, error, listInstances, uploadInstance, createFromForm }
}