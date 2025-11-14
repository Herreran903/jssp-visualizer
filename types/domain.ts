// types/domain.ts
export type ProblemType = 'jssp_maint' | 'tardanza_ponderada'

export type MiniZincSolver = 'chuffed' | 'gecode' | 'or-tools'

export type SearchHeuristic = 
  | 'input_order'
  | 'first_fail'
  | 'smallest'
  | 'largest'
  | 'dom_w_deg'
  | 'impact'
  | 'activity'

export type ValueChoice =
  | 'indomain_min'
  | 'indomain_max'
  | 'indomain_middle'
  | 'indomain_median'
  | 'indomain_random'
  | 'indomain_split'

export interface InstanceSummary {
  id: string
  name: string
  size: number
  createdAt: string
}

export interface InstanceMetadata {
  id: string
  name: string
  problemType: ProblemType
  size: number
  createdAt: string
  jobs?: number
  machines?: number
  operations?: number
  validated: boolean
  validationErrors?: string[]
}

export interface LocalInstance {
  metadata: InstanceMetadata
  content: string  // DZN file content
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

export interface SolverConfig {
  problemType: ProblemType
  solver: MiniZincSolver
  searchHeuristic: SearchHeuristic
  valueChoice: ValueChoice
  timeLimitSec: number
  maxSolutions: number
}

// Legacy - mantener para compatibilidad
export interface SearchConfig {
  heuristic: 'greedy' | 'tabu' | 'sa'
  timeLimitSec: number
  maxSolutions: number
}