import { cn } from '@spektra/components'
import { contentWidth, sectionSpacing } from '../../theme/layout'
import type { FkLegalChapter, FkLegalData } from './fk-legal.schema'

function Fields({ fields }: { fields: { label: string; value: string }[] }) {
  return (
    <dl className="mt-4 divide-y divide-border border-y border-border">
      {fields.map((field) => (
        <div key={field.label} className="grid gap-1 py-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-6">
          <dt className="text-muted-foreground">{field.label}</dt>
          <dd className="min-w-0 break-words font-semibold">{field.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function Chapter({ chapter, index }: { chapter: FkLegalChapter; index: number }) {
  return (
    <section id={chapter.id} aria-labelledby={`${chapter.id}-title`} className="scroll-mt-28">
      <h2 id={`${chapter.id}-title`} className="text-2xl md:text-3xl">
        <span className="mr-3 tabular-nums text-accent-text">{index + 1}.</span>
        {chapter.title}
      </h2>
      {chapter.paragraphs?.map((paragraph) => (
        <p key={paragraph} className="mt-4">
          {paragraph}
        </p>
      ))}
      {chapter.items && chapter.items.length > 0 && (
        <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-accent">
          {chapter.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {chapter.fields && chapter.fields.length > 0 && <Fields fields={chapter.fields} />}
      {chapter.groups?.map((group) => (
        <div key={group.title} className="mt-6 rounded-xl border border-border bg-surface p-5 md:p-6">
          <h3 className="text-lg">{group.title}</h3>
          <Fields fields={group.fields} />
        </div>
      ))}
    </section>
  )
}

/** Legal page body — chapters with a sticky table of contents on large screens. */
export function FkLegal({ id, updated, tocTitle, chapters }: FkLegalData) {
  if (chapters.length === 0) return null
  return (
    <section
      id={id}
      data-ui-id={`section-${id}`}
      data-ui-component="fk-legal"
      data-ui-role="region"
      className={cn(sectionSpacing, 'bg-background')}
    >
      <div className={cn(contentWidth, 'grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] lg:gap-16')}>
        {tocTitle && chapters.length > 2 ? (
          <nav aria-labelledby={`${id}-toc-title`} className="lg:sticky lg:top-28 lg:self-start">
            <p id={`${id}-toc-title`} className="text-sm font-semibold uppercase tracking-[0.06em] text-accent-text">
              {tocTitle}
            </p>
            <ol className="mt-3 space-y-1 text-sm">
              {chapters.map((chapter, index) => (
                <li key={chapter.id}>
                  <a
                    href={`#${chapter.id}`}
                    data-ui-id={`${id}-toc-${chapter.id}`}
                    data-ui-type="link"
                    data-ui-action="navigate"
                    className="inline-flex min-h-9 items-baseline gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <span className="tabular-nums">{index + 1}.</span>
                    {chapter.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : (
          <div aria-hidden="true" className="hidden lg:block" />
        )}
        <div className="min-w-0 max-w-prose space-y-12 text-lg">
          {updated && <p className="text-base text-muted-foreground">{updated}</p>}
          {chapters.map((chapter, index) => (
            <Chapter key={chapter.id} chapter={chapter} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
