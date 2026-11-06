import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { createMemoryConsentStorage } from '@spektra/data'
import { ConsentProvider, FormHandlerProvider, SectionRenderer } from '@spektra/runtime'
import type { FkQuoteData } from '../sections/fk-quote'
import { content } from '../content'
import { consentConfig } from '../content/consent'
import { registry } from '../registry'
import { buildSiteData } from './build-site'
import { HONEYPOT_FIELD, createPhpFormHandler } from './php-form-handler'
import { quoteFormConfig, quoteFormConfigPhp } from './quote-form-config'

/** The exact field shape fk-quote.component.tsx passes to handler.submit(). */
const quoteFields = {
  name: 'Teszt Elek',
  email: 'teszt@example.hu',
  phone: '',
  services: ['Könyvelés'],
  message: 'Árajánlatot kérek.',
  consent: 'yes',
  [HONEYPOT_FIELD]: '',
}

function mockFetch(response: unknown) {
  const calls: { url: string; init: RequestInit }[] = []
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    calls.push({ url, init })
    if (response instanceof Error) throw response
    return { json: async () => response } as Response
  })
  return calls
}

afterEach(() => vi.unstubAllGlobals())

describe('php form handler', () => {
  it('posts the quote fields as PHP-readable form data', async () => {
    const calls = mockFetch({ status: 'ok' })
    let clock = 1_000
    const handler = createPhpFormHandler({ endpoint: '/ajanlatkeres.php', now: () => clock })
    clock = 9_500

    expect(await handler.submit('quote', quoteFields)).toEqual({ status: 'ok' })
    const { url, init } = calls[0]!
    expect(url).toBe('/ajanlatkeres.php')
    expect(init.method).toBe('POST')
    const body = init.body as FormData
    // Arrays use `key[]` → $_POST['services'] is an array in PHP.
    expect(body.getAll('services[]')).toEqual(['Könyvelés'])
    expect(body.has('services')).toBe(false)
    expect(body.get('consent')).toBe('yes')
    expect(body.get(HONEYPOT_FIELD)).toBe('')
    expect(body.get('elapsed')).toBe('8500')
    expect(body.get('formId')).toBe('quote')
    expect(body.get('name')).toBe('Teszt Elek')
  })

  it('maps the endpoint answers to FormSubmitResult', async () => {
    const handler = createPhpFormHandler({ endpoint: '/x' })
    mockFetch({ status: 'error', message: 'Adja meg a nevét.', field: 'name' })
    expect(await handler.submit('quote', quoteFields)).toEqual({ status: 'error', message: 'Adja meg a nevét.', field: 'name' })
    mockFetch({ status: 'rate_limited', retryAfter: 120 })
    expect(await handler.submit('quote', quoteFields)).toEqual({ status: 'rate_limited', retryAfter: 120 })
  })

  it('reports network and non-JSON failures as an error (the form shows its general text)', async () => {
    const handler = createPhpFormHandler({ endpoint: '/x' })
    mockFetch(new TypeError('offline'))
    expect(await handler.submit('quote', quoteFields)).toEqual({ status: 'error', message: '' })
  })
})

describe('quote endpoint config', () => {
  const quote = buildSiteData(content)
    .pages.find((p) => p.slug === 'kapcsolat')!
    .sections.find((s) => s.type === 'fk-quote')!.data as FkQuoteData

  it('accepts exactly the service labels the form sends', () => {
    expect(quoteFormConfig(content, 'key').services).toEqual(quote.services.map((s) => s.label))
  })

  it('mails the enquiry mailbox of company.ts on the canonical host', () => {
    const config = quoteFormConfig(content, 'key')
    expect(config.to).toBe('kapcsolat@farkaskonyveles.hu')
    expect(config.from).toBe(config.to)
    expect(config.host).toBe('farkaskonyveles.hu')
  })

  it('writes a PHP array with escaped strings and no placeholder', () => {
    const php = quoteFormConfigPhp({ ...content, company: { ...content.company, name: "O'Brien \\ Iroda" } }, 'abc')
    expect(php.startsWith('<?php')).toBe(true)
    expect(php).toContain("'site' => 'O\\'Brien \\\\ Iroda',")
    expect(php).toContain("'ipHashKey' => 'abc',")
    expect(php).not.toMatch(/\[[A-ZÁÉÍÓÖŐÚÜŰ][^\]]*\]/)
  })

  it('renders the honeypot field in the quote form', () => {
    const page = buildSiteData(content).pages.find((p) => p.slug === 'kapcsolat')!
    const html = renderToStaticMarkup(
      <ConsentProvider config={consentConfig} storage={createMemoryConsentStorage()}>
        <FormHandlerProvider handler={createPhpFormHandler({ endpoint: '/x' })}>
          <SectionRenderer sections={page.sections} registry={registry} />
        </FormHandlerProvider>
      </ConsentProvider>,
    )
    expect(html).toMatch(new RegExp(`<div aria-hidden="true"[^>]*><label[^>]*>Weboldal</label><input[^>]*name="${HONEYPOT_FIELD}"[^>]*tabindex="-1"`))
  })
})
