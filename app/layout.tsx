// src/app/layout.tsx
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const fluxArchitect = localFont({
  src: [
    {
      path: '../public/fonts/Flux Architect Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Flux Architect Italic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../public/fonts/Flux Architect Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/Flux Architect Bold Italic.ttf',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-flux-architect',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'JSSP Planner',
  description: 'Visualizador de Job Shop Scheduling',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${fluxArchitect.variable}`}>
        {children}
      </body>
    </html>
  )
}