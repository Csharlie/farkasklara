import { cn } from '@spektra/components'
import { contentWidth, sectionSpacing, toneClassName } from '../../theme/layout'
import type { FkPriceData } from './fk-price.schema'

/** Rendered only when the builder passes a price (settings.showPrices). */
export function FkPrice({ id, title, price, tone }: FkPriceData) {
  return (
    <section
      id={id}
      data-ui-id={`section-${id}`}
      data-ui-component="fk-price"
      data-ui-role="region"
      aria-labelledby={`${id}-title`}
      className={cn(sectionSpacing, toneClassName(tone))}
    >
      <div className={cn(contentWidth, 'grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]')}>
        <h2 id={`${id}-title`} data-ui-role="section-title" className="text-4xl md:text-5xl">
          {title}
        </h2>
        <div className="rounded-xl border border-border bg-surface p-7 md:p-8">
          <p className="font-display text-4xl font-bold tracking-heading tabular-nums md:text-5xl">
            {price.amount}
            {price.unit && <span className="ml-2 font-sans text-xl font-medium text-muted-foreground">{price.unit}</span>}
          </p>
          {price.vatNote && <p className="mt-3 text-muted-foreground">{price.vatNote}</p>}
          {price.note && <p className="mt-4">{price.note}</p>}
        </div>
      </div>
    </section>
  )
}
