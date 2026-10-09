import type { SectionDefinition } from '@spektra/runtime'
import type { FkCtaData } from './fk-cta.schema'
import { FkCta } from './fk-cta.component'

export const fkCtaDefinition: SectionDefinition<FkCtaData> = {
  type: 'fk-cta',
  component: FkCta,
}
