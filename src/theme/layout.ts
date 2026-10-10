import { buttonVariants, cn } from '@spektra/components'

/**
 * Client layout recipes — class compositions over theme tokens
 * (fk-theme.ts). Single place for section rhythm and CTA appearance.
 */

/** Vertical section rhythm: 64px mobile, 96px desktop. */
export const sectionSpacing = 'py-16 md:py-24'

/** Compact rhythm for bands placed between sections (closing CTA). */
export const bandSpacing = 'py-8 md:py-12'

/** Content column: max 1240px, 24px side margin. */
export const contentWidth = 'mx-auto w-full max-w-content px-6'

/** Section background by tone: warm → surface-warm, plain → surface. */
export function toneClassName(tone: 'plain' | 'warm' | undefined): string {
  return tone === 'warm' ? 'bg-muted' : 'bg-background'
}

export type CtaKind = 'primary' | 'secondary'

/**
 * The single CTA recipe of the site (platform buttonVariants as the base).
 * - primary   — every quote request (ajánlatkérés): solid gold, ink label.
 * - secondary — everything else; solid, never gold, adapts to its surface:
 *     light surface → solid dark blue (surface-strong), white label
 *     dark surface  → solid white, dark-blue (ink) label
 *   (dark surface = inside [data-color-scheme='dark'], the platform convention)
 * Both: pill, 48px high, 17px semibold label. Focus is shown only for
 * keyboard users (global :focus-visible outline in index.css).
 * The platform HeroBlock CTAs get the same look in index.css.
 */
export function ctaClassName(kind: CtaKind, className?: string): string {
  return cn(
    buttonVariants({ variant: kind === 'primary' ? 'primary' : 'outline', size: 'lg' }),
    'min-h-12 rounded-full border px-7 py-3 text-base font-semibold leading-tight tracking-[0.01em] transition-colors duration-200',
    'focus:ring-0 focus:ring-offset-0',
    kind === 'primary'
      ? 'border-transparent bg-accent text-accent-foreground hover:bg-accent-hover'
      : cn(
          'border-transparent bg-surface-strong text-on-strong hover:bg-surface-strong-raised',
          '[[data-color-scheme=dark]_&]:bg-on-strong [[data-color-scheme=dark]_&]:text-ink',
          '[[data-color-scheme=dark]_&]:hover:bg-muted-on-dark',
        ),
    className,
  )
}
