import type { SectionDefinition } from '@spektra/runtime'
import type { FkContactData } from './fk-contact.schema'
import { FkContact } from './fk-contact.component'

export const fkContactDefinition: SectionDefinition<FkContactData> = {
  type: 'fk-contact',
  component: FkContact,
}
