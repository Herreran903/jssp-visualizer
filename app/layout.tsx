// src/app/layout.tsx
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const fluxArchitect = localFont({
  src: [
    { path: '../public/fonts/Flux Architect Regular.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/Flux Architect Italic.ttf', weight: '400', style: 'italic' },
    { path: '../public/fonts/Flux Architect Bold.ttf', weight: '700', style: 'normal' },
    { path: '../public/fonts/Flux Architect Bold Italic.ttf', weight: '700', style: 'italic' },
  ],
  variable: '--font-flux-architect',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'JSSP Visualizer',
  description: 'Visualizador de Job Shop Scheduling',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isMock = process.env.USE_MOCKS === 'true'
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''
  return (
    <html lang="es" data-mock={isMock ? 'true' : 'false'} data-backend={backendUrl}>
      <body className={`${fluxArchitect.variable} min-h-screen`}>
        <div className="mx-auto max-w-6xl p-6">
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-bold">JSSP</h1>
            <nav className="flex gap-3 text-sm text-gray-300">
              <a href="/instances" className="hover:text-white">Instancias</a>
              <a href="/configure" className="hover:text-white">Configurar</a>
              <a href="/run" className="hover:text-white">Ejecutar</a>
              <a href="/results" className="hover:text-white">Resultados</a>
              <a href="/export" className="hover:text-white">Exportar</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  )
}