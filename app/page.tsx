// src/app/page.tsx
'use client'
import Link from 'next/link'
import Card from '../components/ui/Card'

export default function Home() {
  const links = [
    { href: '/instances', title: 'Instancias' },
    { href: '/configure', title: 'Configurar' },
    { href: '/run', title: 'Ejecutar' },
    { href: '/results', title: 'Resultados' },
    { href: '/export', title: 'Exportar' },
  ]
  return (
    <main className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 paper-surface">
      {links.map((l) => (
        <Link key={l.href} href={l.href}>
          <Card className="cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="text-lg font-semibold font-hand uppercase">{l.title}</div>
          </Card>
        </Link>
      ))}
    </main>
  )
}
