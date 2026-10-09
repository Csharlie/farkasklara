import type { SectionDefinition } from '@spektra/runtime'
import type { FkArticlesData } from './fk-articles.schema'
import { FkArticles } from './fk-articles.component'

export const fkArticlesDefinition: SectionDefinition<FkArticlesData> = {
  type: 'fk-articles',
  component: FkArticles,
}
