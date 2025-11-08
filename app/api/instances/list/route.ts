// app/api/instances/list/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  if (process.env.USE_MOCKS === 'true') {
    const now = new Date().toISOString()
    return NextResponse.json([
      { id: 'demo-01', name: 'Demo 01', size: 12345, createdAt: now },
      { id: 'demo-02', name: 'Demo 02', size: 67890, createdAt: now },
    ])
  }
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
  const res = await fetch(`${base}/api/instances/list`, { cache: 'no-store' })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
