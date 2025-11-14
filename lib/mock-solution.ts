import type { SolutionEnvelope } from '../types/api'

export function createMockSolution(config?: {
  instanceId?: string
  instanceName?: string
  problemType?: string
  solver?: string
  searchHeuristic?: string
  valueChoice?: string
  timeLimitSec?: number
  maxSolutions?: number
}): SolutionEnvelope {
  const machines = [
    { id: "M1", name: "Máquina 1" },
    { id: "M2", name: "Máquina 2" },
    { id: "M3", name: "Máquina 3" },
  ]

  const operations = [
    { jobId: "J1", machineId: "M1", opId: "J1-T1", start: 0, end: 3, duration: 3 },
    { jobId: "J1", machineId: "M2", opId: "J1-T2", start: 3, end: 5, duration: 2 },
    { jobId: "J1", machineId: "M3", opId: "J1-T3", start: 5, end: 7, duration: 2 },
    
    { jobId: "J2", machineId: "M2", opId: "J2-T1", start: 0, end: 2, duration: 2 },
    { jobId: "J2", machineId: "M1", opId: "J2-T2", start: 3, end: 4, duration: 1 },
    { jobId: "J2", machineId: "M3", opId: "J2-T3", start: 7, end: 11, duration: 4 },
    
    { jobId: "J3", machineId: "M3", opId: "J3-T1", start: 0, end: 4, duration: 4 },
    { jobId: "J3", machineId: "M1", opId: "J3-T2", start: 4, end: 7, duration: 3 },
    { jobId: "J3", machineId: "M2", opId: "J3-T3", start: 7, end: 8, duration: 1 },
  ]

  const makespan = Math.max(...operations.map(op => op.end))

  const utilizationByMachine: Record<string, number> = {}
  machines.forEach(m => {
    const machineOps = operations.filter(op => op.machineId === m.id)
    const totalDuration = machineOps.reduce((sum, op) => sum + op.duration, 0)
    utilizationByMachine[m.id] = makespan > 0 ? +(totalDuration / makespan).toFixed(3) : 0
  })

  const stats = {
    makespan,
    utilization: +(Object.values(utilizationByMachine).reduce((a, b) => a + b, 0) / machines.length).toFixed(3),
    tardiness: 0,
    w: 0,
    violations: 0,
    ...utilizationByMachine,
  }

  const solution = {
    makespan,
    machines,
    operations,
    stats,
  }

  const meta = {
    instanceId: config?.instanceId || 'mock-instance',
    instanceName: config?.instanceName || 'Mock Instance',
    jobs: 3,
    machines: 3,
    operations: 9,
    elapsedMs: 1234,
    timeLimit: (config?.timeLimitSec || 30) * 1000,
    seed: 42,
    strategy: config?.searchHeuristic || 'first_fail',
    modelId: config?.problemType || 'jssp_maint',
    variation: config?.solver || 'chuffed',
    timestamp: new Date().toISOString(),
  }

  return {
    status: 'COMPLETED',
    solution,
    logs: [
      `Mock execution completed`,
      `problemType: ${config?.problemType || 'jssp_maint'}`,
      `solver: ${config?.solver || 'chuffed'}`,
      `searchHeuristic: ${config?.searchHeuristic || 'first_fail'}`,
      `valueChoice: ${config?.valueChoice || 'indomain_min'}`,
      `timeLimit: ${config?.timeLimitSec || 30}s`,
      `maxSolutions: ${config?.maxSolutions || 1}`,
      `makespan: ${makespan}`,
      `operations: ${operations.length}`,
    ],
    meta,
  }
}