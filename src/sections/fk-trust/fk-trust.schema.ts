/** Credibility strip: 3–4 verifiable facts. Values come from content data. */
export interface FkTrustData {
  id: string
  /** Accessible name of the strip (visually hidden). */
  label: string
  facts: { value: string; label: string }[]
}
