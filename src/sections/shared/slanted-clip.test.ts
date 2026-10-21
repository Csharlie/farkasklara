import { describe, expect, it } from 'vitest'
import { slantedLeftPath } from './slanted-clip'

describe('slantedLeftPath', () => {
  it('starts after the rounded top-left corner, keeps the right edge straight and closes', () => {
    const d = slantedLeftPath(800, 600, 0.08, 28)
    expect(d.startsWith('M 92 0')).toBe(true) // 800 × 0.08 + 28
    expect(d).toContain('L 800 0')
    expect(d).toContain('L 800 600')
    expect(d).toContain('L 28 600') // bottom edge stops before the rounded bottom-left corner
    expect(d.match(/Q /g)).toHaveLength(2) // two rounded left corners
    expect(d.endsWith('Z')).toBe(true)
  })

  it('never uses a radius larger than a third of the height', () => {
    expect(slantedLeftPath(800, 30, 0.08, 28).startsWith('M 74 0')).toBe(true) // 64 + 10
  })
})
