export interface FkArticlesData {
  id: string
  title: string
  items: { slug: string; title: string; summary: string; href: string }[]
  /** Shown instead of the list when there are no articles; omit to render nothing. */
  emptyText?: string
  tone?: 'plain' | 'warm'
}
