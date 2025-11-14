// lib/storage/instances.ts
import { get, set, del, keys } from 'idb-keyval'
import type { InstanceMetadata, LocalInstance } from '../../types/domain'

const INDEX_KEY = 'jssp:instances:index'
const DB_PREFIX = 'instance:'

function getIndex(): InstanceMetadata[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(INDEX_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function updateIndex(instances: InstanceMetadata[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(instances))
  } catch (error) {
    console.error('Failed to update instance index:', error)
  }
}

function generateId(): string {
  return `inst-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export async function saveInstance(
  content: string,
  metadata: Omit<InstanceMetadata, 'id' | 'createdAt'>
): Promise<string> {
  const id = generateId()
  const fullMetadata: InstanceMetadata = {
    ...metadata,
    id,
    createdAt: new Date().toISOString(),
  }

  const instance: LocalInstance = {
    metadata: fullMetadata,
    content,
  }
  
  await set(`${DB_PREFIX}${id}`, instance)

  const index = getIndex()
  index.push(fullMetadata)
  updateIndex(index)

  return id
}

export async function getInstance(id: string): Promise<LocalInstance | null> {
  try {
    const instance = await get<LocalInstance>(`${DB_PREFIX}${id}`)
    return instance || null
  } catch (error) {
    console.error('Failed to get instance:', error)
    return null
  }
}

export async function getInstanceContent(id: string): Promise<string | null> {
  const instance = await getInstance(id)
  return instance?.content || null
}

export function listInstances(): InstanceMetadata[] {
  return getIndex()
}

export async function deleteInstance(id: string): Promise<void> {
  await del(`${DB_PREFIX}${id}`)

  const index = getIndex()
  const filtered = index.filter(inst => inst.id !== id)
  updateIndex(filtered)
}

export async function updateInstanceMetadata(
  id: string,
  updates: Partial<InstanceMetadata>
): Promise<void> {
  const instance = await getInstance(id)
  if (!instance) {
    throw new Error(`Instance ${id} not found`)
  }

  const updatedMetadata: InstanceMetadata = {
    ...instance.metadata,
    ...updates,
    id,
  }

  const updatedInstance: LocalInstance = {
    ...instance,
    metadata: updatedMetadata,
  }
  await set(`${DB_PREFIX}${id}`, updatedInstance)

  const index = getIndex()
  const indexItem = index.find(inst => inst.id === id)
  if (indexItem) {
    Object.assign(indexItem, updates)
    updateIndex(index)
  }
}

export async function clearAllInstances(): Promise<void> {
  const allKeys = await keys()
  const instanceKeys = allKeys.filter(key => 
    typeof key === 'string' && key.startsWith(DB_PREFIX)
  )
  
  await Promise.all(instanceKeys.map(key => del(key)))
  updateIndex([])
}

export async function exportInstance(id: string): Promise<{ dzn: Blob; meta: Blob; name: string }> {
  const instance = await getInstance(id)
  if (!instance) {
    throw new Error(`Instance ${id} not found`)
  }

  const dznBlob = new Blob([instance.content], { type: 'text/plain' })
  const metaBlob = new Blob([JSON.stringify(instance.metadata, null, 2)], { type: 'application/json' })

  return {
    dzn: dznBlob,
    meta: metaBlob,
    name: instance.metadata.name,
  }
}

export async function importInstance(
  dznContent: string,
  metadata?: Partial<InstanceMetadata>
): Promise<string> {
  if (!metadata) {
    throw new Error('Metadata is required for import')
  }

  const requiredFields: (keyof InstanceMetadata)[] = ['name', 'problemType', 'size', 'validated']
  const missingFields = requiredFields.filter(field => !(field in metadata))
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required metadata fields: ${missingFields.join(', ')}`)
  }

  return saveInstance(dznContent, metadata as Omit<InstanceMetadata, 'id' | 'createdAt'>)
}

export function isIndexedDBAvailable(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return 'indexedDB' in window && window.indexedDB !== null
  } catch {
    return false
  }
}