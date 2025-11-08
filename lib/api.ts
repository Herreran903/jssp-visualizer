// lib/api.ts
export async function getJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { Accept: 'application/json', ...(init?.headers || {}) },
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`GET ${url} - ${res.status} ${text}`)
  }
  return res.json() as Promise<T>
}

export async function postJSON<T>(url: string, body: unknown, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(init?.headers || {}) },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`POST ${url} - ${res.status} ${text}`)
  }
  return res.json() as Promise<T>
}

export async function postForm<T>(url: string, form: FormData, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    body: form,
    headers: { ...(init?.headers || {}) },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`POST ${url} - ${res.status} ${text}`)
  }
  return res.json() as Promise<T>
}