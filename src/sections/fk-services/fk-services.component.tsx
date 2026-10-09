import { cn } from '@spektra/components'
import { contentWidth, sectionSpacing, toneClassName } from '../../theme/layout'
import { SectionIntro } from '../shared/SectionIntro'
import type { FkServicesData } from './fk-services.schema'

/**
 * Service cards. Data-driven: one card per item. The title and the
 * always-visible link point to the canonical service route; an optional
 * native <details> panel shows a short preview in place (content is in the
 * HTML, state is exposed to assistive tech by the browser).
 */
export function FkServices({
  id,
  title,
  intro,
  items,
  numbered,
  highlightFirst,
  detailsLabel,
  linkLabel,
  tone,
}: FkServicesData) {
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

        <List className="mt-10 grid items-start gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => {
            const highlighted = highlightFirst && index === 0
            const highlights = item.highlights ?? []
            return (
              <li
                key={item.slug}
                data-ui-id={`service-card-${item.slug}`}
                data-ui-type="card"
                data-color-scheme={highlighted ? 'dark' : undefined}
                className={cn(
                  'flex min-w-0 flex-col rounded-xl border p-6 md:p-7',
                  highlighted ? 'border-transparent bg-background text-foreground' : 'border-border bg-surface',
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
                <h3 data-ui-role="item-title" className={cn('text-2xl md:text-3xl', numbered && 'mt-4')}>
                  <a
                    href={item.href}
                    data-ui-id={`service-title-link-${item.slug}`}
                    data-ui-type="link"
                    data-ui-action="navigate"
                    data-ui-trigger="click"
                    className="underline-offset-4 hover:underline"
                  >
                    {item.title}
                  </a>
                </h3>
                <p data-ui-role="item-description" className="mt-3 text-muted-foreground">
                  {item.summary}
                </p>
                {item.price && (
                  <p data-ui-role="meta" className="mt-4 font-semibold tabular-nums">
                    {item.price.amount}
                    {item.price.unit && <span className="font-normal text-muted-foreground"> {item.price.unit}</span>}
                  </p>
                )}

                {highlights.length > 0 && (
                  <details className="group mt-5 border-t border-border pt-2">
                    <summary
                      data-ui-id={`service-details-${item.slug}`}
                      data-ui-type="toggle"
                      data-ui-action="expand"
                      data-ui-trigger="click"
                      className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden"
                    >
                      {detailsLabel}
                      <span aria-hidden="true" className="text-xl leading-none transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <ul className="space-y-2 pb-2 pt-1">
                      {highlights.map((highlight) => (
                        <li key={highlight} className="flex gap-3 text-[0.9375rem]">
                          <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-foreground" />
                          <span className="min-w-0">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}

                <a
                  href={item.href}
                  data-ui-id={`service-link-${item.slug}`}
                  data-ui-type="link"
                  data-ui-action="navigate"
                  data-ui-trigger="click"
                  className={cn(
                    'inline-flex min-h-11 w-fit items-center font-semibold underline-offset-4 hover:underline',
                    highlights.length > 0 ? 'mt-1' : 'mt-5',
                  )}
                >
                  {linkLabel}
                  <span className="sr-only">: {item.title}</span>
                  <span aria-hidden="true">&nbsp;→</span>
                </a>
              </li>
            )
          })}
        </List>
      </div>
    </section>
  )
}
