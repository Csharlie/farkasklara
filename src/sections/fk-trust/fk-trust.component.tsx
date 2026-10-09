import { contentWidth } from '../../theme/layout'
import type { FkTrustData } from './fk-trust.schema'

export function FkTrust({ id, label, facts }: FkTrustData) {
  if (facts.length === 0) return null

  return (
    <section
      id={id}
      data-ui-id={`section-${id}`}
      data-ui-component="fk-trust"
      data-ui-role="region"
      aria-label={label}
      className="border-b border-border bg-background"
    >
      <div className={contentWidth}>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 py-10 md:py-12 lg:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="flex flex-col-reverse gap-1 border-l-2 border-border pl-5">
              <dt className="text-sm text-muted-foreground">{fact.label}</dt>
              <dd className="font-display text-3xl font-bold tracking-heading tabular-nums md:text-4xl">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
