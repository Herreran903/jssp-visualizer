// lib/storage/migration.ts
import type { InstanceSummary } from '../../types/domain'
import { saveInstance } from './instances'

const DRAFTS_KEY = 'jssp:drafts'
const MIGRATION_FLAG = 'jssp:migration:v1:done'

/**
 * Migrate old localStorage drafts to new IndexedDB storage
 */
export async function migrateDrafts(): Promise<void> {
  if (typeof window === 'undefined') return
  
  // Check if migration already done
  if (localStorage.getItem(MIGRATION_FLAG)) {
    return
  }

  try {
    const draftsStr = localStorage.getItem(DRAFTS_KEY)
    if (!draftsStr) {
      // No drafts to migrate
      localStorage.setItem(MIGRATION_FLAG, 'true')
      return
    }

    const drafts: InstanceSummary[] = JSON.parse(draftsStr)
    
    if (!Array.isArray(drafts) || drafts.length === 0) {
      localStorage.setItem(MIGRATION_FLAG, 'true')
      return
    }

    console.log(`Migrating ${drafts.length} draft instances...`)

    // Migrate each draft
    for (const draft of drafts) {
      try {
        // Create a minimal DZN content for drafts (they don't have actual content)
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
          problemType: 'jssp_maint', // Default to jssp_maint for old drafts
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

    // Mark migration as complete
    localStorage.setItem(MIGRATION_FLAG, 'true')
    
    // Optionally remove old drafts (commented out for safety)
    // localStorage.removeItem(DRAFTS_KEY)
    
    console.log('Migration completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    // Don't set migration flag on failure, so it can retry
  }
}

/**
 * Check if migration is needed
 */
export function needsMigration(): boolean {
  if (typeof window === 'undefined') return false
  
  const migrated = localStorage.getItem(MIGRATION_FLAG)
  const hasDrafts = localStorage.getItem(DRAFTS_KEY)
  
  return !migrated && !!hasDrafts
}

/**
 * Reset migration flag (for testing)
 */
export function resetMigration(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(MIGRATION_FLAG)
}