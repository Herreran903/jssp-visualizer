// types/api.ts
import type { InstanceSummary, SearchConfig } from './domain'
import type { Solution } from './solution'

export type InstancesListResponse = InstanceSummary[]

export interface UploadInstanceResponse {
  instanceId: string
}

export interface ModelsListResponse {
  models: Array<{ id: string; name: string; variations: string[] }>
}

export interface SolveRequest {
  instanceId: string
  modelId: string
  search: SearchConfig
}

export interface SolveResponse {
  jobId: string
}

export type SolutionStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'ERROR'

// Extra metadata returned by the one-shot execution endpoint
export interface ExecutionMeta {
  instanceId?: string
  instanceName?: string
  jobs?: number
  machines?: number
  operations?: number
  elapsedMs?: number
  timeLimit?: number
  seed?: number
  strategy?: string
  modelId?: string
  variation?: string
  timestamp?: string
}

export interface SolutionEnvelope {
  status: SolutionStatus
  solution?: Solution
  logs?: string[]
  meta?: ExecutionMeta
}

export interface ExportRequest {
  solutionId: string
  format: 'csv' | 'pdf' | 'png'
}

export interface ExportResponse {
  url: string
}