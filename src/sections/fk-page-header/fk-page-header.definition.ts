import type { SectionDefinition } from '@spektra/runtime'
import type { FkPageHeaderData } from './fk-page-header.schema'
import { FkPageHeader } from './fk-page-header.component'

export const fkPageHeaderDefinition: SectionDefinition<FkPageHeaderData> = {
  type: 'fk-page-header',
  component: FkPageHeader,
}
