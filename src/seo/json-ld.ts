import type { ClientContent } from '../content'
import type { OpeningHours } from '../content/types'
import { emailLink, isCompleteAddress, phoneLink } from '../data/contact'
import { known, knownItems } from '../data/text'

const DAYS = ['hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat', 'vasárnap']
const SCHEMA_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

/** 'Hétfő–csütörtök' / 'Kedd, csütörtök' / 'Péntek' → schema.org day names; undefined if unreadable. */
function parseDays(text: string): string[] | undefined {
  const index = (day: string) => DAYS.indexOf(day.trim().toLocaleLowerCase('hu-HU'))
  const days: string[] = []
  for (const part of text.split(',')) {
    const [from, to, ...rest] = part.split(/[–-]/)
    const start = index(from ?? '')
    const end = to === undefined ? start : index(to)
    if (rest.length > 0 || start < 0 || end < start) return undefined
    days.push(...SCHEMA_DAYS.slice(start, end + 1))
  }
  return days
}

/** '9:00–16:00' → ['09:00', '16:00']; undefined if unreadable. */
function parseHours(text: string): [string, string] | undefined {
  const match = /^\s*(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})\s*$/.exec(text)
  if (!match) return undefined
  const [, h1, m1, h2, m2] = match
  return [`${h1!.padStart(2, '0')}:${m1}`, `${h2!.padStart(2, '0')}:${m2}`]
}

/**
 * Content opening hours → schema.org OpeningHoursSpecification.
 * Undefined when any entry cannot be read (validate-content reports it).
 */
export function openingHoursSpecification(hours: readonly OpeningHours[]): Record<string, unknown>[] | undefined {
  const specs = hours.map((entry) => {
    const days = parseDays(entry.days)
    const time = parseHours(entry.hours)
    return days && time ? { '@type': 'OpeningHoursSpecification', dayOfWeek: days, opens: time[0], closes: time[1] } : undefined
  })
  return specs.every((s) => s !== undefined) ? specs : undefined
}

/**
 * Structured data (schema.org JSON-LD) of the firm for the homepage — how
 * Google reads the name, address and phone (NAP) as facts. Every value comes
 * from src/content/company.ts and passes the known() gate, so a placeholder
 * never reaches it; unknown values are left out rather than guessed.
 */
export function businessJsonLd(content: ClientContent): Record<string, unknown> | undefined {
  const { company, settings } = content
  const url = company.url?.replace(/\/$/, '')
  if (!url) return undefined

  const { address } = company
  const sameAs = knownItems(company.sameAs)
  const hours = company.openingHoursConfirmed ? openingHoursSpecification(company.openingHours) : undefined
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'AccountingService',
    '@id': `${url}/#iroda`,
    name: company.name,
    url: `${url}/`,
    // tel:+36702312517 → +36702312517 (E.164)
    telephone: phoneLink(company.phone)?.href?.replace(/^tel:/, ''),
    email: emailLink(company.email)?.text,
    image: `${url}${settings.seo.ogImage.src}`,
    address: isCompleteAddress(address)
      ? {
          '@type': 'PostalAddress',
          streetAddress: address.street,
          postalCode: address.postalCode,
          addressLocality: address.city,
          addressCountry: 'HU',
        }
      : undefined,
    areaServed: known(company.city) ? { '@type': 'City', name: company.city } : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    openingHoursSpecification: hours,
  }
  // JSON.stringify drops undefined values; strip them here too so the object is clean for tests.
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined))
}

/** JSON-LD as a <script> tag; '<' is escaped so the content can never close the tag. */
export function jsonLdScript(data: Record<string, unknown>): string {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`
}
