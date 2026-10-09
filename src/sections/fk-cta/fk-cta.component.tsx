import { cn } from '@spektra/components'
import { contentWidth, sectionSpacing } from '../../theme/layout'
import { CtaLink } from '../shared/CtaLink'
import type { FkCtaData } from './fk-cta.schema'

/** Closing CTA — a large block on the configurable dark surface (surface-strong). */
export function FkCta({ id, title, text, primary, secondary }: FkCtaData) {
  return (
    <section
      id={id}
      data-ui-id={`section-${id}`}
      data-ui-component="fk-cta"
      data-ui-role="cta"
      aria-labelledby={`${id}-title`}
      className={cn(sectionSpacing, 'bg-background')}
    >
      <div className={contentWidth}>
        <div
          data-color-scheme="dark"
          className="rounded-2xl bg-background px-7 py-12 text-foreground md:rounded-3xl md:px-14 md:py-16"
        >
          <h2 id={`${id}-title`} data-ui-role="section-title" className="max-w-3xl text-4xl md:text-5xl">
            {title}
          </h2>
          {text && (
            <p data-ui-role="section-description" className="mt-5 max-w-prose text-lg text-muted-foreground">
              {text}
            </p>
          )}
          <div className="mt-10 flex flex-wrap gap-3">
            <CtaLink cta={primary} />
            {secondary && <CtaLink cta={secondary} />}
          </div>
        </div>
      </div>
    </section>
  )
}
