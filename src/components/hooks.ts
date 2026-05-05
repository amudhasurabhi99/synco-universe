'use client'
import { useState, useEffect } from 'react'
export function useCount(target: number, duration=800, run=true) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!run) return
    let raf: number, start: number
    const ease = (t: number) => 1 - Math.pow(1 - t, 3)
    const tick = (now: number) => {
      if (!start) start = now
      const p = Math.min(1, (now - start) / duration)
      setV(target * ease(p))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, run])
  return v
}
