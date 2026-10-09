import type { SectionDefinition } from '@spektra/runtime'
import type { FkServicesData } from './fk-services.schema'
import { FkServices } from './fk-services.component'

export const fkServicesDefinition: SectionDefinition<FkServicesData> = {
  type: 'fk-services',
  component: FkServices,
}
