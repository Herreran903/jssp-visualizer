// lib/jssp-result-to-csv.ts

type Operation = {
  jobId: string
  machineId: string
  opId: string
  start: number
  end: number
  duration: number
}

type Stats = {
  w?: number
  tardanza?: number
  tardiness?: number
  [key: string]: number | undefined
}

type Solution = {
  makespan?: number
  machines?: { id: string; name: string }[]
  operations?: Operation[]
  stats?: Stats
}

type Meta = {
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

type JsspResult = {
  status?: string
  solution?: Solution
  meta?: Meta
}

/**
 * Convierte el resultado JSON del JSSP en un CSV de operaciones.
 * Usa `;` como separador para que se abra cómodo en Excel/LibreOffice en ES.
 */
export function jsspResultToCSV(result: JsspResult, sep = ";"): string {
  const { solution, meta } = result
  const ops = solution?.operations ?? []
  const stats = solution?.stats ?? {}
  const makespan = solution?.makespan

  const lines: string[] = []

  // ---- Metadatos como comentarios (#...) ----
  lines.push(`# instance_id${sep}${meta?.instanceId ?? ""}`)
  lines.push(`# instance_name${sep}${meta?.instanceName ?? ""}`)
  lines.push(`# model${sep}${meta?.modelId ?? ""}`)
  lines.push(`# variation${sep}${meta?.variation ?? ""}`)
  lines.push(`# strategy${sep}${meta?.strategy ?? ""}`)
  lines.push(`# makespan${sep}${makespan ?? ""}`)
  lines.push(`# w${sep}${stats.w ?? ""}`)
  lines.push(`# tardanza${sep}${stats.tardanza ?? stats.tardiness ?? ""}`)
  lines.push(`# elapsed_ms${sep}${meta?.elapsedMs ?? ""}`)
  lines.push(`# time_limit_ms${sep}${meta?.timeLimit ?? ""}`)
  lines.push(`# timestamp${sep}${meta?.timestamp ?? ""}`)
  lines.push("") // línea en blanco

  // ---- Cabecera de la tabla de operaciones ----
  const header = ["job_id", "machine_id", "op_id", "start", "end", "duration"]
  lines.push(header.join(sep))

  // ---- Filas ----
  for (const op of ops) {
    const row = [
      op.jobId,
      op.machineId,
      op.opId,
      op.start,
      op.end,
      op.duration,
    ].map((v) => String(v ?? ""))

    lines.push(row.join(sep))
  }

  return lines.join("\n")
}
