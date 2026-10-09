import type { Address, Company, Person } from '../content/types'
import { isPlaceholder } from './text'

/** A contact value with an optional actionable href (tel:/mailto:). */
export interface ContactLink {
  text: string
  /** Undefined while the value is a placeholder — no broken tel:/mailto: links. */
  href?: string
}

export function phoneLink(phone: string): ContactLink {
  const digits = phone.replace(/[^\d+]/g, '')
  return {
    text: phone,
    href: isPlaceholder(phone) || digits.replace(/\D/g, '').length < 6 ? undefined : `tel:${digits}`,
  }
}

export function emailLink(email: string): ContactLink {
  return {
    text: email,
    href: isPlaceholder(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? undefined : `mailto:${email}`,
  }
}

export function formatAddress(address: Address): string {
  return `${address.postalCode} ${address.city}, ${address.street}`
}

/**
 * Resolves the single primary contact. Exactly one person must be flagged —
 * zero or several is a content error, reported loudly (no silent fallback).
 */
export function resolvePrimaryContact(people: readonly Person[]): Person {
  const primary = people.filter((p) => p.isPrimaryContact)
  if (primary.length !== 1) {
    throw new Error(
      `Content error: exactly one person must have isPrimaryContact: true (found ${primary.length}).`,
    )
  }
  return primary[0]!
}

/** Contact view derived from the single company source + primary contact. */
export interface ContactView {
  companyName: string
  address: string
  phone: ContactLink
  email: ContactLink
  hours: { days: string; hours: string }[]
  primaryContact: {
    name: string
    role: string
    phone: ContactLink
    email: ContactLink
  }
}

export function buildContactView(company: Company, people: readonly Person[]): ContactView {
  const primary = resolvePrimaryContact(people)
  return {
    companyName: company.name,
    address: formatAddress(company.address),
    phone: phoneLink(company.phone),
    email: emailLink(company.email),
    hours: company.openingHours.map((h) => ({ days: h.days, hours: h.hours })),
    primaryContact: {
      name: primary.name,
      role: primary.role,
      // A person's own number/e-mail wins; otherwise the office channel.
      phone: phoneLink(primary.phone ?? company.phone),
      email: emailLink(primary.email ?? company.email),
    },
  }
}
