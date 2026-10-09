import { cn } from '@spektra/components'
import { contentWidth, sectionSpacing, toneClassName } from '../../theme/layout'
import { SectionIntro } from '../shared/SectionIntro'
import type { FkArticlesData } from './fk-articles.schema'

export function FkArticles({ id, title, items, emptyText, tone }: FkArticlesData) {
  if (items.length === 0 && !emptyText) return null

  return (
    <section
      id={id}
      data-ui-id={`section-${id}`}
      data-ui-component="fk-articles"
      data-ui-role="region"
      aria-labelledby={`${id}-title`}
      className={cn(sectionSpacing, toneClassName(tone))}
    >
      <div className={contentWidth}>
        <SectionIntro id={id} title={title} />
        {items.length === 0 ? (
          <p className="mt-6 text-lg text-muted-foreground">{emptyText}</p>
        ) : (
          <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((article) => (
              <li
                key={article.slug}
                data-ui-id={`article-card-${article.slug}`}
                data-ui-type="card"
                className="relative rounded-xl border border-border bg-surface p-7 has-[a:focus-visible]:outline has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2"
              >
                <h3 data-ui-role="item-title" className="text-2xl">
                  <a
                    href={article.href}
                    data-ui-id={`article-link-${article.slug}`}
                    data-ui-type="link"
                    data-ui-action="navigate"
                    data-ui-trigger="click"
                    className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none"
                  >
                    {article.title}
                  </a>
                </h3>
                <p data-ui-role="item-description" className="mt-3 text-muted-foreground">
                  {article.summary}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
