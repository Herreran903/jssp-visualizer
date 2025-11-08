// app/api/solve/route.ts
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  if (process.env.USE_MOCKS === "true") {
    const _payload = await req.json().catch(() => null)
    const jobId = "job-" + Math.random().toString(36).slice(2, 8)
    return NextResponse.json({ jobId })
  }
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || ""
  const payload = await req.json()
  const res = await fetch(`${base}/api/solve`, { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json" } })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
