import type { Settings } from './types'

export const settings: Settings = {
  // Prices are not confirmed yet ([ÁR] placeholders). Switch to true to show
  // every price block (service cards + service pages) at once.
  showPrices: false,

  // Storefront photo in the homepage "Rólunk" block (copy.home.about.photo).
  // Switch to false to remove it.
  showOfficePhoto: true,

  segments: {
    // "Nagyobb vállalatok" audience — one of the three primary groups.
    complex: { enabled: true },
  },

  // Prepared, not implemented. Enabling throws at build time (no silent page).
  modules: {
    audiencePages: false, // /kinek/<audience>
    pricingPage: false, // /dijak
  },

  quote: {
    prefillParam: 'szolgaltatas',
  },

  seo: {
    serviceTitleTemplate: '{service} {city} | {company}',
    pageTitleTemplate: '{page} | {company}',
  },
}
