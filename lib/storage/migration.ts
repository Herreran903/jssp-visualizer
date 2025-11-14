// lib/storage/migration.ts
import type { InstanceSummary } from '../../types/domain'
import { saveInstance } from './instances'

const DRAFTS_KEY = 'jssp:drafts'
const MIGRATION_FLAG = 'jssp:migration:v1:done'


export async function migrateDrafts(): Promise<void> {
  if (typeof window === 'undefined') return
  
  if (localStorage.getItem(MIGRATION_FLAG)) {
    return
  }

  try {
    const draftsStr = localStorage.getItem(DRAFTS_KEY)
    if (!draftsStr) {
      localStorage.setItem(MIGRATION_FLAG, 'true')
      return
    }

    const drafts: InstanceSummary[] = JSON.parse(draftsStr)
    
    if (!Array.isArray(drafts) || drafts.length === 0) {
      localStorage.setItem(MIGRATION_FLAG, 'true')
      return
    }

    console.log(`Migrating ${drafts.length} draft instances...`)

    for (const draft of drafts) {
      try {
        const dznContent = `% Draft instance: ${draft.name}
% This was a draft created in the old system
n_jobs = 3;
n_machines = 3;
processing_times = [1, 2, 3, 4, 5, 6, 7, 8, 9];
machine_sequence = [
  | 1, 2, 3
  | 1, 2, 3
  | 1, 2, 3
|];
`

        await saveInstance(dznContent, {
          name: draft.name || 'Unnamed Draft',
          problemType: 'jssp_maint',
          size: draft.size || dznContent.length,
          jobs: 3,
          machines: 3,
          operations: 9,
          validated: false,
          validationErrors: ['Migrated from old draft - please re-upload actual DZN file'],
        })
      } catch (error) {
        console.error(`Failed to migrate draft ${draft.id}:`, error)
      }
    }

    localStorage.setItem(MIGRATION_FLAG, 'true')
    
    console.log('Migration completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export function needsMigration(): boolean {
  if (typeof window === 'undefined') return false
  
  const migrated = localStorage.getItem(MIGRATION_FLAG)
  const hasDrafts = localStorage.getItem(DRAFTS_KEY)
  
  return !migrated && !!hasDrafts
}

export function resetMigration(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(MIGRATION_FLAG)
}