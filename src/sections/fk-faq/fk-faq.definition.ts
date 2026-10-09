import type { SectionDefinition } from '@spektra/runtime'
import type { FkFaqData } from './fk-faq.schema'
import { FkFaq } from './fk-faq.component'

export const fkFaqDefinition: SectionDefinition<FkFaqData> = {
  type: 'fk-faq',
  component: FkFaq,
}
