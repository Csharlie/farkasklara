import { cn } from '@spektra/components'
import { contentWidth, sectionSpacing, toneClassName } from '../../theme/layout'
import { SectionIntro } from '../shared/SectionIntro'
import type { FkServicesData } from './fk-services.schema'

/**
 * Service cards. Data-driven: one card per item, the whole card links to the
 * canonical service route (no modal / client-only content).
 */
export function FkServices({ id, title, intro, items, numbered, highlightFirst, linkLabel, tone }: FkServicesData) {
  if (items.length === 0) return null

  const List = numbered ? 'ol' : 'ul'

  return (
    <section
      id={id}
      data-ui-id={`section-${id}`}
      data-ui-component="fk-services"
      data-ui-role="service-list"
      aria-labelledby={`${id}-title`}
      className={cn(sectionSpacing, toneClassName(tone))}
    >
      <div className={contentWidth}>
        <SectionIntro id={id} title={title} intro={intro} />

        <List className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => {
            const highlighted = highlightFirst && index === 0
            return (
              <li
                key={item.slug}
                data-ui-id={`service-card-${item.slug}`}
                data-ui-type="card"
                data-color-scheme={highlighted ? 'dark' : undefined}
                className={cn(
                  'relative flex flex-col rounded-xl border p-7 transition-colors md:p-8',
                  'has-[a:focus-visible]:outline has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2',
                  highlighted
                    ? 'border-transparent bg-background text-foreground'
                    : 'border-border bg-surface hover:border-foreground/30',
                )}
              >
                {numbered && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      'font-display text-lg font-bold tabular-nums',
                      highlighted ? 'text-accent' : 'text-accent-text',
                    )}
                  >
                    {item.number}
                  </span>
                )}
                <h3 data-ui-role="item-title" className={cn('text-2xl md:text-3xl', numbered && 'mt-6')}>
                  <a
                    href={item.href}
                    data-ui-id={`service-link-${item.slug}`}
                    data-ui-type="link"
                    data-ui-action="navigate"
                    data-ui-trigger="click"
                    className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none"
                  >
                    {item.title}
                  </a>
                </h3>
                <p data-ui-role="item-description" className="mt-3 text-muted-foreground">
                  {item.summary}
                </p>
                {item.price && (
                  <p data-ui-role="meta" className="mt-6 font-semibold tabular-nums">
                    {item.price.amount}
                    {item.price.unit && <span className="font-normal text-muted-foreground"> {item.price.unit}</span>}
                  </p>
                )}
                <span aria-hidden="true" className="mt-auto pt-8 font-semibold">
                  {linkLabel} →
                </span>
              </li>
            )
          })}
        </List>
      </div>
    </section>
  )
}
