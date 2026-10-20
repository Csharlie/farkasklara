import { ConsentBanner } from '@spektra/components'
import { useConsent } from '@spektra/runtime'
import { consentCopy } from '../content/consent'
import { routes } from '../data/routes'

/**
 * Site-wide consent UI: the platform ConsentBanner fed from useConsent().
 * The bottom banner appears until the visitor decides; the settings dialog
 * opens from the banner or the footer link.
 */
export function ConsentUi() {
  const consent = useConsent()
  return (
    <ConsentBanner
      bannerOpen={consent.bannerOpen}
      settingsOpen={consent.settingsOpen}
      categories={consent.categories.map((category) => ({
        id: category,
        ...consentCopy.categories[category],
        checked: consent.isCategoryAllowed(category),
        services: consent.servicesOf(category),
      }))}
      policyHref={routes.privacy}
      onAcceptAll={consent.acceptAll}
      onRejectAll={consent.rejectAll}
      onSave={(ids) => consent.saveCategories(consent.categories.filter((c) => ids.includes(c)))}
      onOpenSettings={consent.openSettings}
      onCloseSettings={consent.closeSettings}
      labels={consentCopy.banner}
    />
  )
}

/** Footer entry point — withdrawing consent is as easy as giving it. */
export function ConsentSettingsLink({ className }: { className?: string }) {
  const consent = useConsent()
  if (consent.categories.length === 0) return null
  return (
    <button
      type="button"
      onClick={consent.openSettings}
      data-ui-id="footer-consent-settings"
      data-ui-type="button"
      data-ui-action="open"
      data-ui-target="consent-dialog"
      data-ui-trigger="click"
      className={className}
    >
      {consentCopy.footerLink}
    </button>
  )
}
