import { createFormHandler, type FormHandler } from '@spektra/data'

/**
 * Picks the platform FormHandler driver from VITE_FORM_HANDLER
 * (same contract as sp-benettcar / sp-luxcover).
 *
 *  - `noop`    development (console.log + fake success) — default
 *  - `cf7`     Contact Form 7 REST: VITE_FORM_CF7_API_BASE + VITE_FORM_CF7_FORM_ID
 *  - `mailto`  opens the visitor's mail client: VITE_FORM_MAILTO_TARGET
 *
 * The production driver is not decided yet (see README.md).
 */
export function createFkFormHandler(): FormHandler {
  const driver = import.meta.env.VITE_FORM_HANDLER ?? 'noop'

  switch (driver) {
    case 'cf7': {
      const apiBase = import.meta.env.VITE_FORM_CF7_API_BASE as string | undefined
      const formId = import.meta.env.VITE_FORM_CF7_FORM_ID as string | undefined
      if (!apiBase || !formId) {
        throw new Error('VITE_FORM_CF7_API_BASE and VITE_FORM_CF7_FORM_ID are required when VITE_FORM_HANDLER=cf7')
      }
      return createFormHandler({ driver: 'cf7', apiBase, formId })
    }

    case 'mailto': {
      const target = import.meta.env.VITE_FORM_MAILTO_TARGET as string | undefined
      if (!target) {
        throw new Error('VITE_FORM_MAILTO_TARGET is required when VITE_FORM_HANDLER=mailto')
      }
      return createFormHandler({ driver: 'mailto', target, subjectTemplate: 'Ajánlatkérés ({formId})', bodyField: 'message' })
    }

    case 'noop':
      return createFormHandler({ driver: 'noop' })

    default:
      console.warn(`Unknown VITE_FORM_HANDLER "${driver as string}", falling back to noop`)
      return createFormHandler({ driver: 'noop' })
  }
}
