import { isPlaceholder } from '../../data/text'

/** Initials from a name, e.g. 'Farkas Klára' → 'FK'. Placeholder names → '–'. */
export function monogramOf(name: string): string {
  if (isPlaceholder(name)) return '–'
  const initials = name
    .split(/\s+/)
    .filter((word) => /^\p{L}/u.test(word))
    .slice(0, 2)
    .map((word) => word.charAt(0).toLocaleUpperCase('hu-HU'))
    .join('')
  return initials || '–'
}
