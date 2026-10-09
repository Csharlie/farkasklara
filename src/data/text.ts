/** A whole value that is an unknown-fact placeholder, e.g. '[TELEFONSZÁM]'. */
export function isPlaceholder(value: string | undefined): boolean {
  return value !== undefined && /^\[[^\]]+\]$/.test(value.trim())
}

/** Any placeholder inside a text, e.g. 'Minden hónap [NAP]. napjáig'. */
export function containsPlaceholder(value: string): boolean {
  return /\[[^\]]+\]/.test(value)
}

/**
 * The render gate for unknown facts: returns the value only when it contains
 * no [PLACEHOLDER]. Placeholders stay in content for later filling, but never
 * reach the UI — the related element is omitted instead.
 */
export function known(value: string | undefined): string | undefined {
  if (value === undefined) return undefined
  const trimmed = value.trim()
  return trimmed === '' || containsPlaceholder(trimmed) ? undefined : value
}

/** Keeps only fully known strings of a list. */
export function knownItems(values: readonly string[] | undefined): string[] {
  return (values ?? []).filter((v): v is string => known(v) !== undefined)
}

/** Fills {token} placeholders. Unknown tokens are an authoring error. */
export function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key]
    if (value === undefined) {
      throw new Error(`fillTemplate: missing value for {${key}} in "${template}"`)
    }
    return value
  })
}
