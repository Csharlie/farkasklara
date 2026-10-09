import type { Article } from './types'

/**
 * Tudástár articles. Route: /tudastar/<slug>. Only visible articles get a
 * page, a list entry and can appear under "Kapcsolódó cikkek" (via
 * service.relatedArticles). The entry below is a hidden template.
 */
export const articles: Article[] = [
  {
    slug: 'minta-cikk',
    title: '[CIKK CÍME]',
    summary: '[CIKK ÖSSZEFOGLALÓ]',
    body: ['[CIKK SZÖVEGE]'],
    seo: { description: '[CIKK META LEÍRÁS]' },
    visible: false,
  },
]
