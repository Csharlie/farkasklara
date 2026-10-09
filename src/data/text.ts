/** A whole value that is an unknown-fact placeholder, e.g. '[TELEFONSZÁM]'. */
export function isPlaceholder(value: string | undefined): boolean {
  return value !== undefined && /^\[[^\]]+\]$/.test(value.trim())
}

/** Any placeholder inside a text, e.g. 'Minden hónap [NAP]. napjáig'. */
export function containsPlaceholder(value: string): boolean {
  return /\[[^\]]+\]/.test(value)
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
