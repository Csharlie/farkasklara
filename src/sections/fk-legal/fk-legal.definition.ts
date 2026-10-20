import type { SectionDefinition } from '@spektra/runtime'
import type { FkLegalData } from './fk-legal.schema'
import { FkLegal } from './fk-legal.component'

export const fkLegalDefinition: SectionDefinition<FkLegalData> = {
  type: 'fk-legal',
  component: FkLegal,
}
