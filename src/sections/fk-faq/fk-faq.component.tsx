import { cn } from '@spektra/components'
import { contentWidth, sectionSpacing, toneClassName } from '../../theme/layout'
import type { FkFaqData } from './fk-faq.schema'

/** FAQ with native <details>/<summary>: keyboard accessible, content in the DOM. */
export function FkFaq({ id, title, items, tone }: FkFaqData) {
  const visibleItems = items.filter((item) => item.question.trim() !== '' && item.answer.trim() !== '')
  if (visibleItems.length === 0) return null

  return (
    <section
      id={id}
      data-ui-id={`section-${id}`}
      data-ui-component="fk-faq"
      data-ui-role="region"
      aria-labelledby={`${id}-title`}
      className={cn(sectionSpacing, toneClassName(tone))}
    >
      <div className={cn(contentWidth, 'grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]')}>
        <h2 id={`${id}-title`} data-ui-role="section-title" className="text-4xl md:text-5xl">
          {title}
        </h2>
        <div className="divide-y divide-border border-y border-border">
          {visibleItems.map((item) => (
            <details key={item.question} className="group py-2">
              <summary
                data-ui-type="toggle"
                data-ui-action="expand"
                data-ui-trigger="click"
                className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 py-3 text-lg font-semibold [&::-webkit-details-marker]:hidden"
              >
                {item.question}
                <span aria-hidden="true" className="text-2xl leading-none transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-4 pr-10 text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
