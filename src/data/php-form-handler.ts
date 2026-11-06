import type { FormFieldData, FormHandler, FormSubmitResult } from '@spektra/data'

/** Hidden spam-trap field of the quote form (fk-quote); people leave it empty. */
export const HONEYPOT_FIELD = 'website'

export interface PhpFormHandlerConfig {
  /** Same-origin endpoint, e.g. '/ajanlatkeres.php' (deploy/production/ajanlatkeres.php). */
  endpoint: string
  /** Clock for the time-on-page check; injectable for tests. */
  now?: () => number
}

interface EndpointResponse {
  status?: string
  message?: string
  field?: string
  retryAfter?: number
}

/**
 * FormHandler for the site's own PHP endpoint (platform FormSubmitResult
 * contract). Fields go out as multipart form data; array values use the
 * `key[]` name so PHP reads them as an array (`services[]` → $_POST['services']).
 *
 * `elapsed` (ms since the page loaded) lets the server drop instant,
 * bot-like submissions. An empty error message makes the form fall back to
 * its own general error text (copy.quoteForm.errors.general).
 */
export function createPhpFormHandler({ endpoint, now = Date.now }: PhpFormHandlerConfig): FormHandler {
  const loadedAt = now()

  return {
    id: 'php',
    async submit(formId: string, fields: FormFieldData): Promise<FormSubmitResult> {
      const body = new FormData()
      for (const [key, value] of Object.entries(fields)) {
        if (Array.isArray(value)) for (const item of value) body.append(`${key}[]`, item)
        else body.append(key, value)
      }
      body.append('formId', formId)
      body.append('elapsed', String(now() - loadedAt))

      let payload: EndpointResponse
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          body,
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
        })
        payload = (await response.json()) as EndpointResponse
      } catch {
        return { status: 'error', message: '' }
      }

      switch (payload.status) {
        case 'ok':
          return { status: 'ok' }
        case 'rate_limited':
          return { status: 'rate_limited', retryAfter: payload.retryAfter }
        default:
          return { status: 'error', message: payload.message ?? '', field: payload.field }
      }
    },
  }
}
