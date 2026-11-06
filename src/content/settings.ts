import type { Settings } from './types'

export const settings: Settings = {
  // Prices are not confirmed yet ([ÁR] placeholders). Switch to true to show
  // every price block (service cards + service pages) at once.
  showPrices: false,

  // Storefront photo in the homepage "Rólunk" block (copy.home.about.photo).
  // Switch to false to remove it.
  showOfficePhoto: true,

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
    // Shown when a page is shared (Facebook, Messenger, LinkedIn…). Cropped from
    // the hero photo by scripts/make-images.mjs; replace once a logo exists.
    ogImage: { src: '/og-image.jpg', width: 1200, height: 630, alt: 'Farkas Klára Könyvelőiroda – könyvelés Kecskeméten' },
  },
}
