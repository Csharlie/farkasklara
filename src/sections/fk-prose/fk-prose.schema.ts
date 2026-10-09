/** Plain text content: paragraphs and/or label–value fields (legal pages, article body). */
export interface FkProseData {
  id: string
  title?: string
  paragraphs?: string[]
  fields?: { label: string; value: string }[]
}
