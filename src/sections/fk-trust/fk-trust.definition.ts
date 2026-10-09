import type { SectionDefinition } from '@spektra/runtime'
import type { FkTrustData } from './fk-trust.schema'
import { FkTrust } from './fk-trust.component'

export const fkTrustDefinition: SectionDefinition<FkTrustData> = {
  type: 'fk-trust',
  component: FkTrust,
}
