import { HeroBlock, cn, type HeroBlockProps } from '@spektra/components'

/**
 * Platform HeroBlock composed with the client shell: the translucent header
 * is fixed and overlays the hero, so the hero gets top padding equal to the
 * header height. Component and section type stay the platform's.
 */
export function FkHeroBlock({ className, ...props }: HeroBlockProps) {
  return <HeroBlock {...props} className={cn('min-h-[640px] pt-16 md:min-h-[680px] md:pt-20', className)} />
}
