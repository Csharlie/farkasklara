import type { SectionDefinition } from '@spektra/runtime'
import type { FkListData } from './fk-list.schema'
import { FkList } from './fk-list.component'

export const fkListDefinition: SectionDefinition<FkListData> = {
  type: 'fk-list',
  component: FkList,
}
