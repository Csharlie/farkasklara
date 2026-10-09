import { createJsonAdapter } from '@spektra/data'
import type { SiteDataAdapter } from '@spektra/types'
import { siteData } from './site'

/**
 * Picks the SiteData adapter from VITE_DATA_SOURCE.
 *
 * Only `json` is implemented for this client. `wordpress` needs a client
 * infra overlay (infra/acf, config.php) and a wp-mapper, which do not exist
 * yet — it fails loudly instead of silently rendering something else.
 */
export function createAdapter(): SiteDataAdapter {
  const source = import.meta.env.VITE_DATA_SOURCE ?? 'json'

  switch (source) {
    case 'json':
      return createJsonAdapter({ data: siteData })
    case 'wordpress':
      throw new Error(
        'VITE_DATA_SOURCE=wordpress is not implemented for sp-farkasklara (no infra overlay / wp-mapper yet)',
      )
    default:
      console.warn(`Unknown VITE_DATA_SOURCE "${source}", falling back to json`)
      return createJsonAdapter({ data: siteData })
  }
}
