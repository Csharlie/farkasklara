/** One chapter of a legal page (privacy notice, imprint). */
export interface FkLegalChapter {
  /** Anchor id — also the table-of-contents target. */
  id: string
  title: string
  paragraphs?: string[]
  items?: string[]
  /** Label–value rows, e.g. controller details or a processing record. */
  fields?: { label: string; value: string }[]
  /** Sub-blocks, e.g. one per processing activity. */
  groups?: { title: string; fields: { label: string; value: string }[] }[]
}

/** Structured legal text: dated, chaptered, with an optional table of contents. */
export interface FkLegalData {
  id: string
  /** "Hatályos: …" line. */
  updated?: string
  tocTitle?: string
  chapters: FkLegalChapter[]
}
