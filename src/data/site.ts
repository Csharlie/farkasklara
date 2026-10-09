import type { SiteData } from '@spektra/types'
import { content } from '../content'
import { buildSiteData } from './build-site'

/** Static SiteData for the json adapter (and a future seed export). */
export const siteData: SiteData = buildSiteData(content)
