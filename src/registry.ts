import { createSectionRegistry, registerSections } from '@spektra/runtime'
import type { AnySectionDefinition } from '@spektra/runtime'

import { fkArticlesDefinition } from './sections/fk-articles'
import { fkContactDefinition } from './sections/fk-contact'
import { fkCtaDefinition } from './sections/fk-cta'
import { fkFaqDefinition } from './sections/fk-faq'
import { fkLegalDefinition } from './sections/fk-legal'
import { fkListDefinition } from './sections/fk-list'
import { fkMapDefinition } from './sections/fk-map'
import { fkPageHeaderDefinition } from './sections/fk-page-header'
import { fkPriceDefinition } from './sections/fk-price'
import { fkProseDefinition } from './sections/fk-prose'
import { fkQuoteDefinition } from './sections/fk-quote'
import { fkServicesDefinition } from './sections/fk-services'
import { fkTeamDefinition } from './sections/fk-team'
import { fkTrustDefinition } from './sections/fk-trust'
import { fkFeaturesDefinition, fkHeroDefinition } from './sections/platform'

/** Platform sections reused as-is or composed (type stays the platform's). */
const platformSections: readonly AnySectionDefinition[] = [
  fkHeroDefinition, // 'hero' — platform HeroBlock + offset for the fixed header
  fkFeaturesDefinition, // 'features' — platform FeaturesBlock + client rhythm
]

/** Client sections (fk- prefix) — capabilities the platform does not provide. */
const fkSections: readonly AnySectionDefinition[] = [
  fkPageHeaderDefinition,
  fkTrustDefinition,
  fkServicesDefinition,
  fkTeamDefinition,
  fkQuoteDefinition,
  fkListDefinition,
  fkPriceDefinition,
  fkFaqDefinition,
  fkCtaDefinition,
  fkArticlesDefinition,
  fkProseDefinition,
  fkLegalDefinition,
  fkContactDefinition,
  fkMapDefinition,
]

export const registry = createSectionRegistry()
registerSections(registry, platformSections)
registerSections(registry, fkSections)
