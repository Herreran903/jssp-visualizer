'use client'

import Image from 'next/image'
import React, { useRef } from 'react'
import { useViewportScale } from '../../hooks/useViewportScale'

type WorkbenchFrameProps = {
  children: React.ReactNode
  title?: string
  nav?: React.ReactNode
}

export default function WorkbenchFrame({ children, title = 'JSSP', nav }: WorkbenchFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const { transformStyle } = useViewportScale({
    containerRef,
    contentRef,
    padding: 24,
    maxScale: 1,
    minScale: 0.5,
  })

  return (
    <div className="relative h-dvh w-full overflow-hidden blueprint-bg" aria-label="Workbench background">
      <div
        ref={containerRef}
        className="absolute inset-0 z-0 flex items-center justify-center p-16 sm:p-20 md:p-24"
      >
        <img
          src="/decor/rule.png"
          alt=""
          aria-hidden="true"
          width={800}
          height={200}
      
          className="
            pointer-events-none
            absolute -right-10 rotate-190
            w-[min(35vw,720px)] max-w-none
            drop-shadow-xl
            z-0
          "
        />
        <div
          ref={contentRef}
          style={transformStyle}
          role="region"
          aria-label="Plano de trabajo"
          tabIndex={-1}
          className="
            paper-surface relative z-10 overflow-hidden isolate
            w-[1200px]
            elevation-2 ring-1 ring-(--color-border-subtle)
            outline-none
          "
        >
          <img
            src="/decor/pencil.png"
            alt=""
            aria-hidden="true"
            width={1200}
            height={600}
            className="
              pointer-events-none
              absolute -left-95 rotate-62 top-15
              w-[min(45vw,700px)] max-w-none
              drop-shadow-xl
              z-0
            "
          />
          <div className="flex items-center justify-between gap-4 bg-(--color-surface-alt) border-b border-(--color-border-subtle) px-6 py-4">
            <h1 className="text-5xl font-extrabold font-hand tracking-tight text-(--color-text-primary)">{title}</h1>
            {nav ? (
              <nav className="text-base md:text-lg font-bold font-hand" aria-label="Secciones">
          {nav}
                </nav>
            ) : null}
          </div>

          <div className="relative z-10 px-6 py-6 sm:px-8 sm:py-8 overflow-y-auto overflow-x-hidden max-h-[calc(100dvh-200px)] custom-scrollbar">{children}</div>
        </div>
      </div>
    </div>
  )
}
