import type { Address, Company, Person } from '../content/types'
import { isPlaceholder, known } from './text'

/** A contact value with an actionable href (tel:/mailto:). */
export interface ContactLink {
  text: string
  href?: string
}

/** Phone link — undefined while the value is a placeholder or not a number. */
export function phoneLink(phone: string | undefined): ContactLink | undefined {
  if (phone === undefined || isPlaceholder(phone)) return undefined
  const digits = phone.replace(/[^\d+]/g, '')
  if (digits.replace(/\D/g, '').length < 6) return undefined
  return { text: phone, href: `tel:${digits}` }
}

/** E-mail link — undefined while the value is a placeholder or invalid. */
export function emailLink(email: string | undefined): ContactLink | undefined {
  if (email === undefined || isPlaceholder(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return undefined
  return { text: email, href: `mailto:${email}` }
}

/** Full address when every part is known; otherwise only the known parts. */
export function formatAddress(address: Address): string {
  const postalCode = known(address.postalCode)
  const street = known(address.street)
  const head = [postalCode, address.city].filter(Boolean).join(' ')
  return street ? `${head}, ${street}` : head
}

/** Address as display lines: ['6000 Kecskemét', 'Berzsenyi utca 19.'] (known parts only). */
export function addressLines(address: Address): string[] {
  const head = [known(address.postalCode), address.city].filter(Boolean).join(' ')
  const street = known(address.street)
  return street ? [head, street] : [head]
}

export function isCompleteAddress(address: Address): boolean {
  return [address.postalCode, address.city, address.street].every((part) => known(part) !== undefined)
}

/**
 * Map query for the real office address only (no guessed coordinates).
 * Undefined while any address part is still a placeholder.
 */
export function mapQuery(address: Address): string | undefined {
  return isCompleteAddress(address) ? formatAddress(address) : undefined
}

function exactlyOne(people: readonly Person[], flag: 'isPrimaryContact' | 'isLead'): Person {
  const matches = people.filter((p) => p[flag])
  if (matches.length !== 1) {
    throw new Error(`Content error: exactly one person must have ${flag}: true (found ${matches.length}).`)
  }
  return matches[0]!
}

/**
 * The person who receives general enquiries and quote requests. Exactly one
 * must be flagged — zero or several is a content error (no silent fallback).
 */
export function resolvePrimaryContact(people: readonly Person[]): Person {
  return exactlyOne(people, 'isPrimaryContact')
}

/** The professional lead of the office. Exactly one. */
export function resolveLead(people: readonly Person[]): Person {
  return exactlyOne(people, 'isLead')
}

export interface PersonView {
  /** Undefined while the name is a placeholder. */
  name?: string
  role: string
  description?: string
}

/** Contact view derived from the single company source + roles. */
export interface ContactView {
  companyName: string
  address: string
  addressLines: string[]
  phone?: ContactLink
  email?: ContactLink
  hours: { days: string; hours: string }[]
  /** Map query — only for a complete, real address. */
  mapQuery?: string
  /** Google Maps directions to the office — only for a complete, real address. */
  directionsHref?: string
  primaryContact: PersonView & { phone?: ContactLink; email?: ContactLink }
  lead: PersonView
}

export function buildContactView(company: Company, people: readonly Person[]): ContactView {
  const primary = resolvePrimaryContact(people)
  const lead = resolveLead(people)
  const officePhone = phoneLink(company.phone)
  const officeEmail = emailLink(company.email)
  return {
    companyName: company.name,
    address: formatAddress(company.address),
    addressLines: addressLines(company.address),
    phone: officePhone,
    email: officeEmail,
    hours: company.openingHours
      .filter((h) => known(h.days) && known(h.hours))
      .map((h) => ({ days: h.days, hours: h.hours })),
    mapQuery: mapQuery(company.address),
    directionsHref: isCompleteAddress(company.address)
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(formatAddress(company.address))}`
      : undefined,
    primaryContact: {
      name: known(primary.name),
      role: primary.role,
      description: known(primary.bio),
      // A person's own number/e-mail wins; otherwise the office channel.
      phone: phoneLink(primary.phone) ?? officePhone,
      email: emailLink(primary.email) ?? officeEmail,
    },
    lead: { name: known(lead.name), role: lead.role, description: known(lead.bio) },
  }
}
