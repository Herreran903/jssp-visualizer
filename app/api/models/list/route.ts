// app/api/models/list/route.ts
import { NextResponse } from "next/server"

export async function GET() {
  if (process.env.USE_MOCKS === "true") {
    return NextResponse.json({
      models: [
        { id: "jobshop", name: "Job Shop", variations: ["tardanza", "mantenimiento"] },
      ],
    })
  }
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || ""
  const res = await fetch(`${base}/api/models/list`, { cache: "no-store" })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
