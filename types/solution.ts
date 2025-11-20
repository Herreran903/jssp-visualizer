// types/solution.ts
export interface Machine {
  id: string
  name: string
}

export interface Operation {
  jobId: string
  machineId: string
  opId: string
  start: number
  end: number
  duration: number
  dueDate?: number  // Due date for the job (optional, for tardiness visualization)
}

export interface MaintenanceWindow {
  machineId: string
  start: number
  end: number
  duration: number
}

export interface Solution {
  makespan: number
  machines: Machine[]
  operations: Operation[]
  maintenanceWindows?: MaintenanceWindow[]
  stats: Record<string, number>
}
