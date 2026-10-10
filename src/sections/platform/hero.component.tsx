import type { ReactNode } from 'react'
import { HeroBlock, cn, type HeroBlockProps } from '@spektra/components'

/** Hero data: platform HeroBlockProps + an optional highlighted word (serializable). */
export type FkHeroData = HeroBlockProps & {
  /** Word of the title rendered in gold (accent), e.g. 'Könyvelés'. */
  titleHighlight?: string
}

/** '\n' → line break; the highlight word → gold span. */
function richTitle(title: string, highlight: string | undefined): ReactNode {
  return title.split('\n').map((line, lineIndex) => {
    const parts = highlight ? line.split(highlight) : [line]
    return (
      <span key={lineIndex} className="block">
        {parts.map((part, partIndex) => (
          <span key={partIndex}>
            {partIndex > 0 && <span className="text-accent">{highlight}</span>}
            {part}
          </span>
        ))}
      </span>
    )
  })
}

/**
 * Platform HeroBlock composed with the client shell: the translucent header
 * is fixed and overlays the hero, so the hero gets top padding equal to the
 * header height. Component and section type stay the platform's.
 *
 * HeroBlock renders `title` as-is inside its <h1>; the client passes a
 * formatted node (line break + gold highlight) while the content stays a
 * plain string. Platform extension candidate: a ReactNode-capable title.
 */
export function FkHeroBlock({ className, title, titleHighlight, ...props }: FkHeroData) {
  return (
    <HeroBlock
      {...props}
      title={richTitle(title, titleHighlight) as unknown as string}
      className={cn('min-h-[640px] pt-16 md:min-h-[680px] md:pt-20', className)}
    />
  )
}
