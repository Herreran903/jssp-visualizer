// types/domain.ts
export interface InstanceSummary {
  id: string
  name: string
  size: number
  createdAt: string
}

export interface InstanceForm {
  name: string
  machines: number
  jobs: number
  operationsPerJob: number
}

export interface Model {
  id: string
  name: string
  variations: string[]
}

export interface SearchConfig {
  heuristic: 'greedy' | 'tabu' | 'sa'
  timeLimitSec: number
  maxSolutions: number
}