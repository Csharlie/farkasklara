import type { SectionDefinition } from '@spektra/runtime'
import type { FkMapData } from './fk-map.schema'
import { FkMap } from './fk-map.component'

export const fkMapDefinition: SectionDefinition<FkMapData> = {
  type: 'fk-map',
  component: FkMap,
}
