import { cn } from '@spektra/components'
import { contentWidth, sectionSpacing, toneClassName } from '../../theme/layout'
import { isIconName } from '../shared/icon-paths'
import { Icon } from '../shared/icons'
import { SectionIntro } from '../shared/SectionIntro'
import type { FkServicesData } from './fk-services.schema'

/**
 * Service cards — static, concise navigation. Data-driven: one card per item;
 * the title and the explicit "Részletek" link point to the canonical service
 * route (no modal, no in-place expansion).
 */
export function FkServices({
  id,
  title,
  intro,
  items,
  numbered,
  highlightFirst,
  iconCards,
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

        {iconCards ? (
          <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li
                key={item.slug}
                data-ui-id={`service-card-${item.slug}`}
                data-ui-type="card"
                className={cn(
                  'group relative isolate flex min-h-[15rem] min-w-0 cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-surface p-6 pt-14 md:p-7 md:pt-14',
                  'transition-colors duration-200 hover:border-surface-strong hover:bg-surface-strong',
                  'has-[a:focus-visible]:outline has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2',
                )}
              >
                {isIconName(item.icon) && (
                  <Icon
                    name={item.icon}
                    className="pointer-events-none absolute -left-4 -top-4 -z-10 size-32 text-accent-text opacity-[0.14] transition-[color,opacity] duration-200 group-hover:text-accent group-hover:opacity-30"
                  />
                )}
                <h3
                  data-ui-role="item-title"
                  className="text-2xl transition-colors duration-200 group-hover:text-on-strong md:text-3xl"
                >
                  {/* Stretched link: the whole card is one click target. */}
                  <a
                    href={item.href}
                    data-ui-id={`service-link-${item.slug}`}
                    data-ui-type="link"
                    data-ui-action="navigate"
                    data-ui-trigger="click"
                    className="after:absolute after:inset-0 after:z-10 after:rounded-xl focus-visible:outline-none"
                  >
                    {item.title}
                  </a>
                </h3>
                <p
                  data-ui-role="item-description"
                  className="mt-3 text-muted-foreground transition-colors duration-200 group-hover:text-muted-on-dark"
                >
                  {item.summary}
                </p>
                {item.price && (
                  <p data-ui-role="meta" className="mt-4 font-semibold tabular-nums group-hover:text-on-strong">
                    {item.price.amount}
                    {item.price.unit && <span className="font-normal"> {item.price.unit}</span>}
                  </p>
                )}
                <span
                  aria-hidden="true"
                  className="mt-auto pt-5 font-semibold text-foreground transition-colors duration-200 group-hover:text-accent"
                >
                  {linkLabel} →
                </span>
              </li>
            ))}
          </ul>
        ) : (
      <List className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => {
              const highlighted = highlightFirst && index === 0
              return (
                <li
                  key={item.slug}
                  data-ui-id={`service-card-${item.slug}`}
                  data-ui-type="card"
                  data-color-scheme={highlighted ? 'dark' : undefined}
                  className={cn(
                    'group relative flex min-w-0 cursor-pointer flex-col rounded-xl border p-6 transition-colors duration-200 md:p-7',
                    'has-[a:focus-visible]:outline has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2',
                    highlighted
                      ? 'border-transparent bg-background text-foreground hover:bg-surface'
                      : 'border-border bg-surface hover:border-foreground/40',
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
                      data-ui-id={`service-link-${item.slug}`}
                      data-ui-type="link"
                      data-ui-action="navigate"
                      data-ui-trigger="click"
                      className="after:absolute after:inset-0 after:z-10 after:rounded-xl focus-visible:outline-none"
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

                  <span
                    aria-hidden="true"
                    className={cn(
                      'mt-auto inline-flex w-fit items-center pt-4 font-semibold group-hover:underline group-hover:underline-offset-4',
                      highlighted ? 'text-accent' : 'text-foreground',
                    )}
                  >
                    {linkLabel}&nbsp;→
                  </span>
                </li>
              )
            })}
          </List>
        )}
      </div>
    </section>
  )
}
