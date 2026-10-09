import type { SectionDefinition } from '@spektra/runtime'
import type { FkPriceData } from './fk-price.schema'
import { FkPrice } from './fk-price.component'

export const fkPriceDefinition: SectionDefinition<FkPriceData> = {
  type: 'fk-price',
  component: FkPrice,
}
