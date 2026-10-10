import { contentWidth } from '../../theme/layout'
import type { FkTrustData } from './fk-trust.schema'

/**
 * Facts strip — placed directly below the About section as a supporting
 * trust element. Values come from verified content data only.
 */
export function FkTrust({ id, label, facts }: FkTrustData) {
  if (facts.length === 0) return null

  return (
    <section
      id={id}
      data-ui-id={`section-${id}`}
      data-ui-component="fk-trust"
      data-ui-role="region"
      aria-label={label}
      className="bg-background pb-16 md:pb-24"
    >
      <div className={contentWidth}>
        <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border border-border lg:grid-cols-4">
          {facts.map((fact, index) => (
            <div
              key={fact.label}
              className={[
                'flex min-w-0 flex-col-reverse items-center justify-end gap-1.5 px-4 py-6 text-center sm:px-6 md:px-8 md:py-8',
                index % 2 === 1 ? 'border-l border-border' : '',
                index >= 2 ? 'border-t border-border lg:border-t-0' : '',
                index === 2 ? 'lg:border-l' : '',
              ].join(' ')}
            >
              <dt className="text-sm text-muted-foreground">{fact.label}</dt>
              <dd className="font-display text-[1.375rem] font-bold leading-tight tracking-heading tabular-nums [hyphens:manual] sm:text-3xl md:text-4xl">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
