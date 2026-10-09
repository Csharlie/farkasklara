import type { SectionDefinition } from '@spektra/runtime'
import type { FkTeamData } from './fk-team.schema'
import { FkTeam } from './fk-team.component'

export const fkTeamDefinition: SectionDefinition<FkTeamData> = {
  type: 'fk-team',
  component: FkTeam,
}
