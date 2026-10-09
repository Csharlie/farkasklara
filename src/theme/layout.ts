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
 * CTA anchors reuse the platform buttonVariants recipe.
 * - primary: accent background, ink text (never white on accent)
 * - secondary: ink outline; the platform outline/ghost variants use
 *   text-accent, which fails 4.5:1 on light surfaces, so color is overridden.
 * Both are pill-shaped, 17px label, min. 44px touch target.
 */
export function ctaClassName(kind: CtaKind, className?: string): string {
  return cn(
    kind === 'primary'
      ? buttonVariants({ variant: 'primary', size: 'lg' })
      : buttonVariants({ variant: 'outline', size: 'lg' }),
    'min-h-11 rounded-full px-7 text-base font-semibold',
    kind === 'secondary' && 'border-foreground text-foreground hover:bg-foreground/5 focus:ring-foreground',
    className,
  )
}
