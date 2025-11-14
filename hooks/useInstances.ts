'use client'
import { useCallback, useEffect, useState } from 'react'
import type { InstanceMetadata, ProblemType, LocalInstance } from '../types/domain'
import { parseDZN, extractInstanceName } from '../lib/dzn-parser'
import {
  saveInstance,
  getInstance,
  listInstances,
  deleteInstance as deleteInstanceStorage,
  exportInstance as exportInstanceStorage,
  importInstance as importInstanceStorage,
  getInstanceContent,
} from '../lib/storage/instances'
import { migrateDrafts, needsMigration } from '../lib/storage/migration'

export default function useInstances() {
  const [instances, setInstances] = useState<InstanceMetadata[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshInstances = useCallback(() => {
    try {
      const allInstances = listInstances()
      setInstances(allInstances)
    } catch (e: any) {
      setError(e.message)
      setInstances([])
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        if (needsMigration()) {
          await migrateDrafts()
        }
        refreshInstances()
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [refreshInstances])

  const uploadInstance = useCallback(async (
    file: File,
    problemType: ProblemType
  ): Promise<string> => {
    setLoading(true)
    setError(null)
    try {
      const content = await file.text()
      const name = extractInstanceName(file.name)
      
      const parseResult = parseDZN(content, problemType)
      
      const id = await saveInstance(content, {
        name,
        problemType,
        size: file.size,
        jobs: parseResult.metadata.jobs,
        machines: parseResult.metadata.machines,
        operations: parseResult.metadata.operations,
        validated: parseResult.metadata.validated || false,
        validationErrors: parseResult.errors.length > 0 ? parseResult.errors : undefined,
      })

      refreshInstances()
      return id
    } catch (e: any) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [refreshInstances])

  const getInstanceData = useCallback(async (id: string): Promise<LocalInstance | null> => {
    try {
      return await getInstance(id)
    } catch (e: any) {
      setError(e.message)
      return null
    }
  }, [])

  const getContent = useCallback(async (id: string): Promise<string | null> => {
    try {
      return await getInstanceContent(id)
    } catch (e: any) {
      setError(e.message)
      return null
    }
  }, [])

  const deleteInstance = useCallback(async (id: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await deleteInstanceStorage(id)
      refreshInstances()
    } catch (e: any) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [refreshInstances])

  const exportInstance = useCallback(async (id: string): Promise<void> => {
    try {
      const { dzn, meta, name } = await exportInstanceStorage(id)

      const dznUrl = URL.createObjectURL(dzn)
      const dznLink = document.createElement('a')
      dznLink.href = dznUrl
      dznLink.download = `${name}.dzn`
      dznLink.click()
      URL.revokeObjectURL(dznUrl)

      const metaUrl = URL.createObjectURL(meta)
      const metaLink = document.createElement('a')
      metaLink.href = metaUrl
      metaLink.download = `${name}.meta.json`
      metaLink.click()
      URL.revokeObjectURL(metaUrl)
    } catch (e: any) {
      setError(e.message)
      throw e
    }
  }, [])

  const importInstance = useCallback(async (
    dznFile: File,
    metaFile?: File
  ): Promise<string> => {
    setLoading(true)
    setError(null)
    try {
      const dznContent = await dznFile.text()
      
      let metadata: Partial<InstanceMetadata> | undefined
      
      if (metaFile) {
        const metaContent = await metaFile.text()
        metadata = JSON.parse(metaContent)
      } else {
        const name = extractInstanceName(dznFile.name)
        const problemType: ProblemType = 'jssp_maint'
        const parseResult = parseDZN(dznContent, problemType)
        
        metadata = {
          name,
          problemType,
          size: dznFile.size,
          jobs: parseResult.metadata.jobs,
          machines: parseResult.metadata.machines,
          operations: parseResult.metadata.operations,
          validated: parseResult.metadata.validated || false,
          validationErrors: parseResult.errors.length > 0 ? parseResult.errors : undefined,
        }
      }

      const id = await importInstanceStorage(dznContent, metadata)
      refreshInstances()
      return id
    } catch (e: any) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [refreshInstances])

  return {
    instances,
    loading,
    error,
    uploadInstance,
    getInstanceData,
    getContent,
    deleteInstance,
    exportInstance,
    importInstance,
    refreshInstances,
  }
}