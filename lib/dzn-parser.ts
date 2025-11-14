import type { ProblemType, InstanceMetadata } from '../types/domain'

export interface DZNParseResult {
  metadata: Partial<InstanceMetadata>
  errors: string[]
  warnings: string[]
}

export function parseDZN(content: string, problemType: ProblemType): DZNParseResult {
  const errors: string[] = []
  const warnings: string[] = []
  const metadata: Partial<InstanceMetadata> = {
    problemType,
    validated: false,
  }

  try {
    if (problemType === 'jssp_maint') {
      parseJSSPMaint(content, metadata, errors, warnings)
    } else if (problemType === 'tardanza_ponderada') {
      parseTardanzaPonderada(content, metadata, errors, warnings)
    }

    metadata.validated = errors.length === 0
    metadata.validationErrors = errors.length > 0 ? errors : undefined

  } catch (error) {
    errors.push(`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    metadata.validated = false
    metadata.validationErrors = errors
  }

  return { metadata, errors, warnings }
}

function parseJSSPMaint(
  content: string,
  metadata: Partial<InstanceMetadata>,
  errors: string[],
  warnings: string[]
): void {
  const jobsMatch = content.match(/JOBS\s*=\s*(\d+)/i)
  if (jobsMatch) {
    metadata.jobs = parseInt(jobsMatch[1], 10)
  } else {
    errors.push('Missing required parameter: JOBS')
  }

  const tasksMatch = content.match(/TASKS\s*=\s*(\d+)/i)
  if (tasksMatch) {
    metadata.machines = parseInt(tasksMatch[1], 10)
  } else {
    errors.push('Missing required parameter: TASKS')
  }

  const procTimeMatch = content.match(/PROC_TIME\s*=\s*array2d\([^,]+,[^,]+,\s*\[([^\]]+)\]/i)
  if (!procTimeMatch) {
    errors.push('Missing required parameter: PROC_TIME (must be array2d format)')
  } else {
    const times = procTimeMatch[1].split(',').map(s => s.trim()).filter(s => s && !/^%/.test(s))
    metadata.operations = times.length
    
    const invalidTimes = times.filter(t => !/^\d+$/.test(t) || parseInt(t, 10) <= 0)
    if (invalidTimes.length > 0) {
      errors.push(`Invalid processing times found: ${invalidTimes.slice(0, 3).join(', ')}${invalidTimes.length > 3 ? '...' : ''}`)
    }

    if (metadata.jobs && metadata.machines && metadata.operations) {
      const expectedOps = metadata.jobs * metadata.machines
      if (metadata.operations !== expectedOps) {
        warnings.push(`Expected ${expectedOps} operations (${metadata.jobs} jobs × ${metadata.machines} tasks), but found ${metadata.operations}`)
      }
    }
  }

  const maxMaintMatch = content.match(/MAX_MAINT_WINDOWS\s*=\s*(\d+)/i)
  if (!maxMaintMatch) {
    warnings.push('MAX_MAINT_WINDOWS not defined (optional for jssp_maint)')
  }

  const maintStartMatch = content.match(/MAINT_START\s*=\s*array2d/i)
  if (!maintStartMatch) {
    warnings.push('MAINT_START not defined (optional for jssp_maint)')
  }

  const maintEndMatch = content.match(/MAINT_END\s*=\s*array2d/i)
  if (!maintEndMatch) {
    warnings.push('MAINT_END not defined (optional for jssp_maint)')
  }

  // Check for MAINT_ACTIVE
  const maintActiveMatch = content.match(/MAINT_ACTIVE\s*=\s*array2d/i)
  if (!maintActiveMatch) {
    warnings.push('MAINT_ACTIVE not defined (optional for jssp_maint)')
  }
}

function parseTardanzaPonderada(
  content: string,
  metadata: Partial<InstanceMetadata>,
  errors: string[],
  warnings: string[]
): void {
  const jobsMatch = content.match(/jobs\s*=\s*(\d+)/i)
  if (jobsMatch) {
    metadata.jobs = parseInt(jobsMatch[1], 10)
  } else {
    errors.push('Missing required parameter: jobs')
  }

  const tasksMatch = content.match(/tasks\s*=\s*(\d+)/i)
  if (tasksMatch) {
    metadata.machines = parseInt(tasksMatch[1], 10)
  } else {
    errors.push('Missing required parameter: tasks')
  }

  const dMatch = content.match(/d\s*=\s*array2d\([^,]+,[^,]+,\s*\[([^\]]+)\]/i)
  if (!dMatch) {
    errors.push('Missing required parameter: d (must be array2d format)')
  } else {
    const durations = dMatch[1].split(',').map(s => s.trim()).filter(s => s && !/^%/.test(s))
    metadata.operations = durations.length
    
    const invalidDurations = durations.filter(t => !/^\d+$/.test(t) || parseInt(t, 10) <= 0)
    if (invalidDurations.length > 0) {
      errors.push(`Invalid durations found: ${invalidDurations.slice(0, 3).join(', ')}${invalidDurations.length > 3 ? '...' : ''}`)
    }

    if (metadata.jobs && metadata.machines && metadata.operations) {
      const expectedOps = metadata.jobs * metadata.machines
      if (metadata.operations !== expectedOps) {
        warnings.push(`Expected ${expectedOps} operations (${metadata.jobs} jobs × ${metadata.machines} tasks), but found ${metadata.operations}`)
      }
    }
  }

  const weightsMatch = content.match(/weights\s*=\s*\[([^\]]+)\]/i)
  if (!weightsMatch) {
    errors.push('Missing required parameter: weights')
  } else {
    const weights = weightsMatch[1].split(',').map(s => s.trim()).filter(s => s && !/^%/.test(s))
    if (metadata.jobs && weights.length !== metadata.jobs) {
      errors.push(`weights length (${weights.length}) must match jobs (${metadata.jobs})`)
    }
  }

  const dueDatesMatch = content.match(/due_dates\s*=\s*\[([^\]]+)\]/i)
  if (!dueDatesMatch) {
    errors.push('Missing required parameter: due_dates')
  } else {
    const dueDates = dueDatesMatch[1].split(',').map(s => s.trim()).filter(s => s && !/^%/.test(s))
    if (metadata.jobs && dueDates.length !== metadata.jobs) {
      errors.push(`due_dates length (${dueDates.length}) must match jobs (${metadata.jobs})`)
    }
  }
}

export function validateDZN(content: string, problemType: ProblemType): DZNParseResult {
  return parseDZN(content, problemType)
}

export function extractInstanceName(fileName: string): string {
  return fileName.replace(/\.dzn$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_')
}