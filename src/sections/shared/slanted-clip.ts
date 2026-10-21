import { useEffect, useState, type RefObject } from 'react'

const round = (n: number) => Math.round(n * 10) / 10

/**
 * SVG path for a box whose left edge slants inwards towards the top
 * (top-left corner at `slant` × width) with both left corners rounded.
 * Used as `clip-path: path(...)` — polygon() cannot round corners.
 */
export function slantedLeftPath(width: number, height: number, slant: number, radius: number): string {
  const s = width * slant
  const r = Math.min(radius, height / 3, s || radius)
  const len = Math.hypot(s, height)
  // Unit vector along the left edge, from bottom-left up to top-left.
  const ux = s / len
  const uy = -height / len
  return [
    `M ${round(s + r)} 0`,
    `L ${round(width)} 0`,
    `L ${round(width)} ${round(height)}`,
    `L ${round(r)} ${round(height)}`,
    `Q 0 ${round(height)} ${round(ux * r)} ${round(height + uy * r)}`,
    `L ${round(s - ux * r)} ${round(-uy * r)}`,
    `Q ${round(s)} 0 ${round(s + r)} 0`,
    'Z',
  ].join(' ')
}

/**
 * Measured `clip-path` value for the slanted, rounded left edge — only at
 * `minWidth` and up (otherwise undefined → no clipping). Re-measures on
 * resize. Undefined until mounted, so the static class-based clip stays as
 * the fallback (SSR, first paint).
 */
export function useSlantedLeftClip(
  ref: RefObject<HTMLElement | null>,
  { slant = 0.08, radius = 28, minWidth = 1024 }: { slant?: number; radius?: number; minWidth?: number } = {},
): string | undefined {
  const [clip, setClip] = useState<string>()

  useEffect(() => {
    const el = ref.current
    if (!el || typeof window === 'undefined' || typeof ResizeObserver === 'undefined') return
    const mq = window.matchMedia(`(min-width: ${minWidth}px)`)
    const update = () => {
      if (!mq.matches) return setClip(undefined)
      const { width, height } = el.getBoundingClientRect()
      setClip(width > 0 && height > 0 ? `path('${slantedLeftPath(width, height, slant, radius)}')` : undefined)
    }
    const observer = new ResizeObserver(update)
    observer.observe(el)
    mq.addEventListener('change', update)
    update()
    return () => {
      observer.disconnect()
      mq.removeEventListener('change', update)
    }
  }, [ref, slant, radius, minWidth])

  return clip
}
