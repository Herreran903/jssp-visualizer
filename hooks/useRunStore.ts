// hooks/useRunStore.ts
'use client'

import { useSyncExternalStore } from 'react'
import type { SolutionEnvelope } from '../types/api'

// Keep last two executions only in-memory for the current session
type RunData = SolutionEnvelope & { meta?: any }

type Snapshot = {
  lastRun: RunData | null
  prevRun: RunData | null
}

const EMPTY_SNAPSHOT: Snapshot = Object.freeze({ lastRun: null, prevRun: null })

const store = (() => {
  let lastRun: RunData | null = null
  let prevRun: RunData | null = null
  let snapshot: Snapshot = EMPTY_SNAPSHOT
  const listeners = new Set<() => void>()

  function emit() {
    listeners.forEach((l) => l())
  }

  return {
    getSnapshot(): Snapshot {
      return snapshot
    },
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    setRun(run: RunData) {
      prevRun = lastRun
      lastRun = run
      snapshot = { lastRun, prevRun }
      emit()
    },
    clear() {
      lastRun = null
      prevRun = null
      snapshot = EMPTY_SNAPSHOT
      emit()
    },
  }
})()

export default function useRunStore() {
  const subscribe = (cb: () => void) => store.subscribe(cb)
  const getSnapshot = () => store.getSnapshot()
  // For SSR, return a stable cached snapshot to avoid infinite loops
  const getServerSnapshot = () => EMPTY_SNAPSHOT
  const { lastRun, prevRun } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return {
    lastRun,
    prevRun,
    setRun: store.setRun,
    clear: store.clear,
  }
}