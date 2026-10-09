import { cn } from '@spektra/components'
import { contentWidth, sectionSpacing } from '../../theme/layout'
import type { FkProseData } from './fk-prose.schema'

export function FkProse({ id, title, paragraphs, fields }: FkProseData) {
  const visibleParagraphs = paragraphs?.filter((p) => p.trim() !== '') ?? []
  const visibleFields = fields?.filter((f) => f.value.trim() !== '') ?? []
  if (visibleParagraphs.length === 0 && visibleFields.length === 0) return null

  return (
    <section
      id={id}
      data-ui-id={`section-${id}`}
      data-ui-component="fk-prose"
      data-ui-role="region"
      aria-labelledby={title ? `${id}-title` : undefined}
      className={cn(sectionSpacing, 'bg-background')}
    >
      <div className={contentWidth}>
        <div className="max-w-prose">
          {title && (
            <h2 id={`${id}-title`} data-ui-role="section-title" className="mb-8 text-4xl">
              {title}
            </h2>
          )}
          {visibleParagraphs.length > 0 && (
            <div className="space-y-5 text-lg">
              {visibleParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          )}
          {visibleFields.length > 0 && (
            <dl className="divide-y divide-border border-y border-border">
              {visibleFields.map((field) => (
                <div key={field.label} className="grid gap-1 py-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-6">
                  <dt className="text-muted-foreground">{field.label}</dt>
                  <dd className="font-semibold">{field.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </section>
  )
}
