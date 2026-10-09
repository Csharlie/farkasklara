import { contentWidth } from '../../theme/layout'
import { CtaLink } from '../shared/CtaLink'
import type { FkPageHeaderData } from './fk-page-header.schema'

export function FkPageHeader({ id, eyebrow, title, lead, body, primary, secondary }: FkPageHeaderData) {
  const paragraphs = body?.filter((p) => p.trim() !== '') ?? []

  return (
    <section
      id={id}
      data-ui-id={`section-${id}`}
      data-ui-component="fk-page-header"
      data-ui-role="region"
      aria-labelledby={`${id}-title`}
      className="border-b border-border bg-muted pb-14 pt-14 md:pb-20 md:pt-24"
    >
      <div className={contentWidth}>
        <div className="max-w-4xl">
          {eyebrow && (
            <p
              data-ui-role="section-subtitle"
              className="mb-5 text-sm font-semibold uppercase tracking-[0.08em] text-accent-text"
            >
              {eyebrow}
            </p>
          )}
          <h1
            id={`${id}-title`}
            data-ui-id={`${id}-title`}
            data-ui-role="section-title"
            className="text-5xl md:text-6xl"
          >
            {title}
          </h1>
          {lead && (
            <p
              data-ui-role="section-description"
              className="mt-6 max-w-prose text-lg text-muted-foreground md:text-xl"
            >
              {lead}
            </p>
          )}
          {paragraphs.length > 0 && (
            <div className="mt-6 max-w-prose space-y-4">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          )}
          {(primary || secondary) && (
            <div className="mt-10 flex flex-wrap gap-3">
              {primary && <CtaLink cta={primary} />}
              {secondary && <CtaLink cta={secondary} />}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
