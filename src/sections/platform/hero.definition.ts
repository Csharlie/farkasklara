import { heroDefinition } from '@spektra/sections'
import type { SectionDefinition } from '@spektra/runtime'
import { FkHeroBlock, type FkHeroData } from './hero.component'

/** Platform `hero` section type with the composed component (client override). */
export const fkHeroDefinition: SectionDefinition<FkHeroData> = {
  ...heroDefinition,
  component: FkHeroBlock,
}
