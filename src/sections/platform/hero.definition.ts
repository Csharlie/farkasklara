import { heroDefinition } from '@spektra/sections'
import type { HeroBlockProps } from '@spektra/components'
import type { SectionDefinition } from '@spektra/runtime'
import { FkHeroBlock } from './hero.component'

/** Platform `hero` section type with the composed component (client override). */
export const fkHeroDefinition: SectionDefinition<HeroBlockProps> = {
  ...heroDefinition,
  component: FkHeroBlock,
}
