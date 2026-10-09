import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { cn } from '@spektra/components'
import { useFormHandler } from '@spektra/runtime'
import { readPrefillService } from '../../data/routes'
import { fillTemplate } from '../../data/text'
import { contentWidth, ctaClassName, sectionSpacing, toneClassName } from '../../theme/layout'
import { ContactAnchor } from '../shared/ContactAnchor'
import { SectionIntro } from '../shared/SectionIntro'
import type { FkQuoteData } from './fk-quote.schema'

type FieldName = 'name' | 'contact' | 'email' | 'businessForm' | 'services' | 'consent'
type FieldErrors = Partial<Record<FieldName, string>>

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ok' }
  | { kind: 'error'; message: string }
  | { kind: 'rate_limited' }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Service preselected through ?<prefillParam>=<slug> (route-based CTA prefill). */
function readPrefill(prefillParam: string, allowed: readonly string[]): string[] {
  if (typeof window === 'undefined') return []
  return readPrefillService(window.location.search, prefillParam, allowed)
}

const inputClassName = cn(
  'w-full min-h-11 rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground',
  'placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20',
  'aria-[invalid=true]:border-destructive disabled:opacity-60',
)

export function FkQuote({
  id,
  title,
  intro,
  formId,
  services,
  businessForms,
  prefillParam,
  privacyHref,
  labels,
  success,
  primaryContact,
  tone,
}: FkQuoteData) {
  const handler = useFormHandler()
  const uid = useId()
  const fieldId = (name: string) => `${uid}-${name}`

  const [selected, setSelected] = useState<string[]>(() =>
    readPrefill(prefillParam, services.map((s) => s.value)),
  )
  const [errors, setErrors] = useState<FieldErrors>({})
  const [state, setState] = useState<SubmitState>({ kind: 'idle' })
  const successRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (state.kind === 'ok') successRef.current?.focus()
  }, [state.kind])

  function validate(form: HTMLFormElement): FieldErrors {
    const data = new FormData(form)
    const value = (key: string) => String(data.get(key) ?? '').trim()
    const next: FieldErrors = {}

    if (!value('name')) next.name = labels.errors.name
    const email = value('email')
    const phone = value('phone')
    if (!email && !phone) next.contact = labels.errors.contact
    else if (email && !EMAIL_PATTERN.test(email)) next.email = labels.errors.email
    if (!value('businessForm')) next.businessForm = labels.errors.businessForm
    if (selected.length === 0) next.services = labels.errors.services
    if (data.get('consent') !== 'on') next.consent = labels.errors.consent
    return next
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state.kind === 'loading') return

    const form = event.currentTarget
    const nextErrors = validate(form)
    setErrors(nextErrors)

    const firstInvalid = (Object.keys(nextErrors) as FieldName[])[0]
    if (firstInvalid) {
      const target = firstInvalid === 'contact' ? 'email' : firstInvalid
      form.querySelector<HTMLElement>(`[name="${target}"]`)?.focus()
      return
    }

    const data = new FormData(form)
    const text = (key: string) => String(data.get(key) ?? '').trim()
    const selectedLabels = services.filter((s) => selected.includes(s.value)).map((s) => s.label)

    setState({ kind: 'loading' })
    try {
      const result = await handler.submit(formId, {
        name: text('name'),
        email: text('email'),
        phone: text('phone'),
        businessForm: text('businessForm'),
        services: selectedLabels,
        message: text('message'),
        consent: 'yes',
      })
      switch (result.status) {
        case 'ok':
          setState({ kind: 'ok' })
          form.reset()
          setSelected([])
          break
        case 'error':
          setState({ kind: 'error', message: result.message || labels.errors.general })
          break
        case 'rate_limited':
          setState({ kind: 'rate_limited' })
          break
      }
    } catch {
      setState({ kind: 'error', message: labels.errors.general })
    }
  }

  function toggleService(value: string, checked: boolean) {
    setSelected((current) => (checked ? [...current, value] : current.filter((v) => v !== value)))
    if (errors.services) setErrors((current) => ({ ...current, services: undefined }))
  }

  const disabled = state.kind === 'loading'
  const contactError = errors.contact ?? errors.email
  const describedBy = (...ids: (string | false | undefined)[]) => ids.filter(Boolean).join(' ') || undefined

  return (
    <section
      id={id}
      data-ui-id={`section-${id}`}
      data-ui-component="fk-quote"
      data-ui-role="contact"
      aria-labelledby={`${id}-title`}
      className={cn(sectionSpacing, toneClassName(tone), 'scroll-mt-20')}
    >
      <div className={cn(contentWidth, 'grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]')}>
        <div>
          <SectionIntro id={id} title={title} intro={intro} />
          <div className="mt-10 border-l-2 border-border pl-5">
            <p className="text-sm text-muted-foreground">{primaryContact.label}</p>
            <p className="mt-1 font-display text-2xl font-bold tracking-heading">{primaryContact.name}</p>
            <p className="text-muted-foreground">{primaryContact.role}</p>
            <div className="mt-3 flex flex-col font-semibold">
              <ContactAnchor link={primaryContact.phone} action="call" id={`${id}-phone`} label="Telefon" />
              <ContactAnchor link={primaryContact.email} action="email" id={`${id}-email`} label="E-mail" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 md:p-10">
          {state.kind === 'ok' ? (
            <div
              role="status"
              data-ui-id={`${id}-success`}
              data-ui-role="feedback-container"
              data-ui-status="success"
              className="py-6"
            >
              <h3
                ref={successRef}
                tabIndex={-1}
                data-ui-role="feedback-title"
                className="text-3xl focus:outline-none"
              >
                {success.title}
              </h3>
              <p data-ui-role="feedback-description" className="mt-4 text-lg text-muted-foreground">
                {fillTemplate(success.message, { primaryContact: primaryContact.name })}
              </p>
              <button
                type="button"
                data-ui-id={`${id}-reset`}
                data-ui-type="button"
                data-ui-action="reset"
                data-ui-trigger="click"
                onClick={() => setState({ kind: 'idle' })}
                className={ctaClassName('secondary', 'mt-8')}
              >
                {success.reset}
              </button>
            </div>
          ) : (
            <form
              noValidate
              onSubmit={handleSubmit}
              data-ui-id={`${id}-form`}
              data-ui-type="form"
              data-ui-action="submit-form"
              data-ui-trigger="submit"
              data-ui-status={state.kind === 'loading' ? 'loading' : state.kind === 'error' ? 'error' : undefined}
              aria-describedby={state.kind === 'error' || state.kind === 'rate_limited' ? fieldId('form-error') : undefined}
              className="space-y-6"
            >
              {(state.kind === 'error' || state.kind === 'rate_limited') && (
                <p id={fieldId('form-error')} role="alert" className="rounded-lg bg-destructive/10 p-4 text-destructive">
                  {state.kind === 'error' ? state.message : labels.errors.rateLimited}
                </p>
              )}

              <div>
                <label htmlFor={fieldId('name')} className="mb-2 block font-semibold">
                  {labels.name} <span aria-hidden="true">*</span>
                </label>
                <input
                  id={fieldId('name')}
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  disabled={disabled}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={describedBy(errors.name && fieldId('name-error'))}
                  data-ui-id={`${id}-name`}
                  data-ui-type="input"
                  className={inputClassName}
                />
                {errors.name && (
                  <p id={fieldId('name-error')} className="mt-2 text-sm text-destructive">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <p id={fieldId('contact-hint')} className="mb-3 text-sm text-muted-foreground">
                  {labels.contactHint}
                </p>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor={fieldId('email')} className="mb-2 block font-semibold">
                      {labels.email}
                    </label>
                    <input
                      id={fieldId('email')}
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      disabled={disabled}
                      aria-invalid={contactError ? true : undefined}
                      aria-describedby={describedBy(fieldId('contact-hint'), contactError && fieldId('contact-error'))}
                      data-ui-id={`${id}-email-input`}
                      data-ui-type="input"
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label htmlFor={fieldId('phone')} className="mb-2 block font-semibold">
                      {labels.phone}
                    </label>
                    <input
                      id={fieldId('phone')}
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      disabled={disabled}
                      aria-invalid={errors.contact ? true : undefined}
                      aria-describedby={describedBy(fieldId('contact-hint'), contactError && fieldId('contact-error'))}
                      data-ui-id={`${id}-phone-input`}
                      data-ui-type="input"
                      className={inputClassName}
                    />
                  </div>
                </div>
                {contactError && (
                  <p id={fieldId('contact-error')} className="mt-2 text-sm text-destructive">
                    {contactError}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor={fieldId('businessForm')} className="mb-2 block font-semibold">
                  {labels.businessForm} <span aria-hidden="true">*</span>
                </label>
                <select
                  id={fieldId('businessForm')}
                  name="businessForm"
                  required
                  defaultValue=""
                  disabled={disabled}
                  aria-invalid={errors.businessForm ? true : undefined}
                  aria-describedby={describedBy(errors.businessForm && fieldId('businessForm-error'))}
                  data-ui-id={`${id}-business-form`}
                  data-ui-type="select"
                  className={inputClassName}
                >
                  <option value="" disabled>
                    {labels.businessFormPlaceholder}
                  </option>
                  {businessForms.map((form) => (
                    <option key={form} value={form}>
                      {form}
                    </option>
                  ))}
                </select>
                {errors.businessForm && (
                  <p id={fieldId('businessForm-error')} className="mt-2 text-sm text-destructive">
                    {errors.businessForm}
                  </p>
                )}
              </div>

              <fieldset
                aria-describedby={describedBy(errors.services && fieldId('services-error'))}
                aria-invalid={errors.services ? true : undefined}
              >
                <legend className="mb-3 font-semibold">
                  {labels.services} <span aria-hidden="true">*</span>
                </legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {services.map((service) => (
                    <label
                      key={service.value}
                      className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-2 has-[:checked]:border-foreground"
                    >
                      <input
                        type="checkbox"
                        name="services"
                        value={service.value}
                        checked={selected.includes(service.value)}
                        onChange={(e) => toggleService(service.value, e.target.checked)}
                        disabled={disabled}
                        data-ui-id={`${id}-service-${service.value}`}
                        data-ui-type="checkbox"
                        data-ui-action="select"
                        data-ui-trigger="change"
                        className="size-5 accent-[hsl(var(--fk-ink))]"
                      />
                      {service.label}
                    </label>
                  ))}
                </div>
                {errors.services && (
                  <p id={fieldId('services-error')} className="mt-2 text-sm text-destructive">
                    {errors.services}
                  </p>
                )}
              </fieldset>

              <div>
                <label htmlFor={fieldId('message')} className="mb-2 block font-semibold">
                  {labels.message}
                </label>
                <textarea
                  id={fieldId('message')}
                  name="message"
                  rows={4}
                  disabled={disabled}
                  data-ui-id={`${id}-message`}
                  data-ui-type="textarea"
                  className={cn(inputClassName, 'resize-y')}
                />
              </div>

              <div>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    name="consent"
                    required
                    disabled={disabled}
                    aria-invalid={errors.consent ? true : undefined}
                    aria-describedby={describedBy(errors.consent && fieldId('consent-error'))}
                    data-ui-id={`${id}-consent`}
                    data-ui-type="checkbox"
                    className="mt-1 size-5 shrink-0 accent-[hsl(var(--fk-ink))]"
                  />
                  <span>
                    {labels.consentBefore}
                    <a href={privacyHref} className="font-semibold underline underline-offset-4">
                      {labels.consentLink}
                    </a>
                    {labels.consentAfter} <span aria-hidden="true">*</span>
                  </span>
                </label>
                {errors.consent && (
                  <p id={fieldId('consent-error')} className="mt-2 text-sm text-destructive">
                    {errors.consent}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={disabled}
                data-ui-id={`${id}-submit`}
                data-ui-type="button"
                data-ui-role="cta"
                className={ctaClassName('primary', 'w-full sm:w-auto')}
              >
                {disabled ? labels.sending : labels.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
