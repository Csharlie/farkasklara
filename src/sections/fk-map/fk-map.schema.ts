/** Full-width map section — same contract as bc-map / lc-map. */
export interface FkMapData {
  title?: string
  query: string
  height?: number
  zoom?: number
  /** Google Maps directions link — shown in the consent placeholder (a plain link sets no cookie). */
  directionsHref?: string
}
