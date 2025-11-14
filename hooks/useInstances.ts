// hooks/useInstances.ts
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

  // Initial load and migration
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        // Run migration if needed
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

  /**
   * Upload and validate a DZN file
   */
  const uploadInstance = useCallback(async (
    file: File,
    problemType: ProblemType
  ): Promise<string> => {
    setLoading(true)
    setError(null)
    try {
      const content = await file.text()
      const name = extractInstanceName(file.name)
      
      // Parse and validate
      const parseResult = parseDZN(content, problemType)
      
      // Save to storage
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

  /**
   * Get full instance data (for preview)
   */
  const getInstanceData = useCallback(async (id: string): Promise<LocalInstance | null> => {
    try {
      return await getInstance(id)
    } catch (e: any) {
      setError(e.message)
      return null
    }
  }, [])

  /**
   * Get instance content only (for solver)
   */
  const getContent = useCallback(async (id: string): Promise<string | null> => {
    try {
      return await getInstanceContent(id)
    } catch (e: any) {
      setError(e.message)
      return null
    }
  }, [])

  /**
   * Delete an instance
   */
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

  /**
   * Export instance as downloadable files
   */
  const exportInstance = useCallback(async (id: string): Promise<void> => {
    try {
      const { dzn, meta, name } = await exportInstanceStorage(id)
      
      // Download DZN file
      const dznUrl = URL.createObjectURL(dzn)
      const dznLink = document.createElement('a')
      dznLink.href = dznUrl
      dznLink.download = `${name}.dzn`
      dznLink.click()
      URL.revokeObjectURL(dznUrl)
      
      // Download metadata file
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

  /**
   * Import instance from files
   */
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
        // Use provided metadata
        const metaContent = await metaFile.text()
        metadata = JSON.parse(metaContent)
      } else {
        // Parse DZN to extract metadata
        const name = extractInstanceName(dznFile.name)
        // Default to jssp_maint if no metadata provided
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