'use client'

import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

type RefLike = { readonly current: HTMLElement | null }

export type UseViewportScaleOptions = {
  containerRef: RefLike
  contentRef: RefLike
  padding?: number
  maxScale?: number
  minScale?: number
}

export type UseViewportScaleResult = {
  scale: number
  contentWidth: number
  contentHeight: number
  transformStyle: React.CSSProperties
  recompute: () => void
}

export function useViewportScale(options: UseViewportScaleOptions): UseViewportScaleResult {
  const { containerRef, contentRef, padding = 24, maxScale = 1, minScale = 0.5 } = options

  const [scale, setScale] = useState(1)
  const [contentSize, setContentSize] = useState({ w: 0, h: 0 })
  const rafRef = useRef<number | null>(null)
  const measuringRef = useRef(false)

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

  const measure = useCallback(() => {
    const containerEl = containerRef.current
    const contentEl = contentRef.current
    if (!containerEl || !contentEl) return

    if (measuringRef.current) return
    measuringRef.current = true

    const prevTransform = contentEl.style.transform
    const prevWillChange = contentEl.style.willChange
    contentEl.style.willChange = 'transform'
    contentEl.style.transform = 'none'

    const w = Math.max(contentEl.scrollWidth, contentEl.offsetWidth, contentEl.clientWidth)
    const h = Math.max(contentEl.scrollHeight, contentEl.offsetHeight, contentEl.clientHeight)

    const availW = Math.max(0, containerEl.clientWidth - padding * 2)
    const availH = Math.max(0, containerEl.clientHeight - padding * 2)

    const nextScaleRaw = Math.min(availW / (w || 1), availH / (h || 1), maxScale)
    const nextScale = clamp(isFinite(nextScaleRaw) ? nextScaleRaw : 1, minScale, maxScale)

    contentEl.style.transform = prevTransform
    contentEl.style.willChange = prevWillChange

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      setScale(nextScale)
      setContentSize({ w, h })
      measuringRef.current = false
    })
  }, [containerRef, contentRef, padding, maxScale, minScale])

  const recompute = useCallback(() => {
    measure()
  }, [measure])

  useEffect(() => {
    measure()
    const containerEl = containerRef.current
    const contentEl = contentRef.current
    if (!containerEl || !contentEl) return

    const ro = new ResizeObserver(() => measure())
    ro.observe(containerEl)
    ro.observe(contentEl)

    const onResize = () => measure()
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [containerRef, contentRef, measure])

  return {
    scale,
    contentWidth: contentSize.w,
    contentHeight: contentSize.h,
    transformStyle: {
      transform: `scale(${scale})`,
      transformOrigin: 'center',
    },
    recompute,
  }
}

export default useViewportScale