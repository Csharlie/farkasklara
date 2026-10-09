import type { SectionDefinition } from '@spektra/runtime'
import type { FkQuoteData } from './fk-quote.schema'
import { FkQuote } from './fk-quote.component'

export const fkQuoteDefinition: SectionDefinition<FkQuoteData> = {
  type: 'fk-quote',
  component: FkQuote,
}
