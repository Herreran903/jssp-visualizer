// app/api/solutions/[id]/route.ts
import { NextResponse, NextRequest } from "next/server"

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  if (process.env.USE_MOCKS === "true") {
    const machines = [
      { id: "M1", name: "M1" },
      { id: "M2", name: "M2" },
      { id: "M3", name: "M3" },
    ]
    const ops = [
      { jobId: "J1", machineId: "M1", opId: "J1-1", start: 0, end: 20, duration: 20 },
      { jobId: "J1", machineId: "M2", opId: "J1-2", start: 25, end: 55, duration: 30 },
      { jobId: "J1", machineId: "M3", opId: "J1-3", start: 60, end: 90, duration: 30 },
      { jobId: "J2", machineId: "M2", opId: "J2-1", start: 0, end: 15, duration: 15 },
      { jobId: "J2", machineId: "M3", opId: "J2-2", start: 18, end: 50, duration: 32 },
      { jobId: "J2", machineId: "M1", opId: "J2-3", start: 60, end: 100, duration: 40 },
      { jobId: "J3", machineId: "M3", opId: "J3-1", start: 0, end: 22, duration: 22 },
      { jobId: "J3", machineId: "M1", opId: "J3-2", start: 24, end: 54, duration: 30 },
      { jobId: "J3", machineId: "M2", opId: "J3-3", start: 58, end: 88, duration: 30 },
    ]
    const makespan = 100
    const stats = { makespan, util: 0.72, tardanza: 12 }
    return NextResponse.json({
      status: "COMPLETED",
      solution: { makespan, machines, operations: ops, stats },
      logs: ["solve: start", "model: basic", "status: done"],
    })
  }
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || ""
  const res = await fetch(`${base}/api/solutions/${id}`, { cache: "no-store" })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
