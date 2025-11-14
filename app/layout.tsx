import type { Metadata } from 'next'
import './globals.css'
import WorkbenchFrame from '../components/containers/WorkbenchFrame'
import { Patrick_Hand_SC, Rock_Salt } from 'next/font/google'
import Link from 'next/link'
import { MainNav } from '@/components/MainView'

const hand = Patrick_Hand_SC({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-hand',
  display: 'swap',
})

const rockSalt = Rock_Salt({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-title',
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
    <html
      lang="es"
      data-theme="light"
      data-mock={isMock ? 'true' : 'false'}
      data-backend={backendUrl}
    >
      <body className={`${hand.variable} ${rockSalt.variable} font-sans`}>
        <WorkbenchFrame title="JSSP" nav={<MainNav />}>
          {children}
        </WorkbenchFrame>
      </body>
    </html>
  )
}