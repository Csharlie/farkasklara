import { featuresDefinition } from '@spektra/sections'
import type { SectionDefinition } from '@spektra/runtime'
import { FkFeaturesBlock, type FkFeaturesData } from './features.component'

/**
 * Platform `features` section type with the composed component — a client
 * override registered through the platform SectionRegistry.
 */
export const fkFeaturesDefinition: SectionDefinition<FkFeaturesData> = {
  ...featuresDefinition,
  component: FkFeaturesBlock,
}
