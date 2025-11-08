// app/api/instances/upload/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  if (process.env.USE_MOCKS === 'true') {
    const _form = await req.formData()
    const id = 'inst-' + Math.random().toString(36).slice(2, 8)
    return NextResponse.json({ instanceId: id })
  }
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || ''
  const form = await req.formData()
  const res = await fetch(`${base}/api/instances/upload`, { method: 'POST', body: form })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}