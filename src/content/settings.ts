import type { Settings } from './types'

export const settings: Settings = {
  // Prices are not confirmed yet ([ÁR] placeholders). Switch to true to show
  // every price block (service cards + service pages) at once.
  showPrices: false,

  segments: {
    // "Összetettebb vállalkozások" audience — off by default.
    complex: { enabled: false },
  },

  // Prepared, not implemented. Enabling throws at build time (no silent page).
  modules: {
    audiencePages: false, // /kinek/<audience>
    pricingPage: false, // /dijak
  },

  quote: {
    prefillParam: 'szolgaltatas',
    businessForms: ['Egyéni vállalkozó', 'Kft.', 'Bt.', 'Egyéb / még nincs vállalkozásom'],
  },

  seo: {
    serviceTitleTemplate: '{service} {city} | {company}',
    pageTitleTemplate: '{page} | {company}',
  },
}
