import type { SectionDefinition } from '@spektra/runtime'
import type { FkProseData } from './fk-prose.schema'
import { FkProse } from './fk-prose.component'

export const fkProseDefinition: SectionDefinition<FkProseData> = {
  type: 'fk-prose',
  component: FkProse,
}
