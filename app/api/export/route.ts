// app/api/export/route.ts
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  if (process.env.USE_MOCKS === "true") {
    const body = await req.json()
    const content = `solutionId,${body.solutionId}\nformat,${body.format}\nstatus,ok\n`
    const url = `data:text/csv;base64,${Buffer.from(content).toString("base64")}`
    return NextResponse.json({ url })
  }
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || ""
  const payload = await req.json()
  const res = await fetch(`${base}/api/export`, { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json" } })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
