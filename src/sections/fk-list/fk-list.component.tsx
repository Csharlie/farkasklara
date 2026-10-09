import { cn } from '@spektra/components'
import { contentWidth, sectionSpacing, toneClassName } from '../../theme/layout'
import type { FkListData } from './fk-list.schema'

export function FkList({ id, title, items, tone }: FkListData) {
  const visibleItems = items.filter((item) => item.trim() !== '')
  if (visibleItems.length === 0) return null

  return (
    <section
      id={id}
      data-ui-id={`section-${id}`}
      data-ui-component="fk-list"
      data-ui-role="region"
      aria-labelledby={`${id}-title`}
      className={cn(sectionSpacing, toneClassName(tone))}
    >
      <div className={cn(contentWidth, 'grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]')}>
        <h2 id={`${id}-title`} data-ui-role="section-title" className="text-4xl md:text-5xl">
          {title}
        </h2>
        <ul className="divide-y divide-border border-y border-border">
          {visibleItems.map((item) => (
            <li key={item} className="flex gap-4 py-4 text-lg">
              <span aria-hidden="true" className="mt-3 size-1.5 shrink-0 rounded-full bg-foreground" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
