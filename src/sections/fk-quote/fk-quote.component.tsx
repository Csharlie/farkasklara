import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { cn } from '@spektra/components'
import { useFormHandler } from '@spektra/runtime'
import { readPrefillService } from '../../data/routes'
import { fillTemplate } from '../../data/text'
import { contentWidth, ctaClassName, sectionSpacing, toneClassName } from '../../theme/layout'
import { ContactAnchor } from '../shared/ContactAnchor'
import { Icon, type IconName } from '../shared/icons'
import { SectionIntro } from '../shared/SectionIntro'
import type { FkQuoteData } from './fk-quote.schema'

type FieldName = 'name' | 'contact' | 'email' | 'service' | 'consent'
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

/**
 * Contact info card — same visual language as the service cards: large pale
 * corner icon (bc-services pattern), small label, value, optional note.
 */
function InfoCard({
  icon,
  label,
  note,
  wide,
  children,
}: {
  icon: IconName
  label: string
  note?: string
  wide?: boolean
  children: ReactNode
}) {
  return (
    <li
      className={cn(
        'relative isolate min-w-0 overflow-hidden rounded-xl border border-border bg-surface p-5 pt-12',
        wide && 'sm:col-span-2',
      )}
    >
      <Icon
        name={icon}
        className="pointer-events-none absolute -left-3 -top-3 -z-10 size-20 text-accent-text opacity-[0.14]"
      />
      <p className="text-sm font-semibold uppercase tracking-[0.06em] text-accent-text">{label}</p>
      <div className="mt-1.5 font-semibold">{children}</div>
      {note && <p className="mt-1 text-sm text-muted-foreground">{note}</p>}
    </li>
  )
}

export function FkQuote({
  id,
  title,
  intro,
  formId,
  services,
  prefillParam,
  privacyHref,
  labels,
  success,
  panel,
  primaryContact,
  tone,
}: FkQuoteData) {
  const handler = useFormHandler()
  const uid = useId()
  const fieldId = (name: string) => `${uid}-${name}`

  const [service, setService] = useState<string>(
    () => readPrefill(prefillParam, services.map((s) => s.value))[0] ?? '',
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
    if (!service) next.service = labels.errors.services
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
    const serviceLabel = services.find((s) => s.value === service)?.label ?? service

    setState({ kind: 'loading' })
    try {
      const result = await handler.submit(formId, {
        name: text('name'),
        email: text('email'),
        phone: text('phone'),
        services: [serviceLabel],
        message: text('message'),
        consent: 'yes',
      })
      switch (result.status) {
        case 'ok':
          setState({ kind: 'ok' })
          form.reset()
          setService('')
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
      <div className={contentWidth}>
        <SectionIntro id={id} title={title} intro={intro} />
      </div>

      <div
        className={cn(
          contentWidth,
          'mt-10 grid items-start gap-5',
          panel && 'lg:grid-cols-2',
        )}
      >
        {panel && (
          <aside aria-labelledby={`${id}-panel-title`}>
            <h3 id={`${id}-panel-title`} className="sr-only">
              {panel.title}
            </h3>
            <ul className="grid gap-4">
              {panel.phone && (
                <InfoCard icon="phone" label={panel.labels.phone} note={panel.notes.phone}>
                  <ContactAnchor link={panel.phone} action="call" id={`${id}-phone`} label={panel.labels.phone} className="min-h-0 tabular-nums" />
                </InfoCard>
              )}
              {panel.email && (
                <InfoCard icon="mail" label={panel.labels.email} note={panel.notes.email}>
                  <span className="break-all">
                    <ContactAnchor link={panel.email} action="email" id={`${id}-email`} label={panel.labels.email} className="min-h-0" />
                  </span>
                </InfoCard>
              )}
              {panel.addressLines.length > 0 && (
                <InfoCard icon="mapPin" label={panel.labels.address}>
                  <span>{panel.addressLines.join(', ')}</span>
                  {panel.directions && (
                    <a
                      href={panel.directions.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-ui-id={`${id}-directions`}
                      data-ui-type="link"
                      data-ui-action="navigate"
                      data-ui-trigger="click"
                      className="mt-1 inline-flex min-h-11 items-center text-sm underline underline-offset-4 hover:text-accent-text"
                    >
                      {panel.directions.label}
                      <span className="sr-only"> (új lapon nyílik)</span>
                    </a>
                  )}
                </InfoCard>
              )}
              {panel.hours.length > 0 && (
                <InfoCard icon="clock" label={panel.labels.hours} note={panel.notes.hours}>
                  <dl className="space-y-0.5">
                    {panel.hours.map((entry) => (
                      <div key={entry.days} className="flex flex-wrap justify-between gap-x-4">
                        <dt>{entry.days}</dt>
                        <dd className="tabular-nums">{entry.hours}</dd>
                      </div>
                    ))}
                  </dl>
                </InfoCard>
              )}
              {/* Contact person last — the office channels come first. */}
              {panel.contactPerson && (
                <InfoCard icon="user" label={panel.contactPerson.label}>
                  <span className="block font-display text-xl font-bold tracking-heading">{panel.contactPerson.name}</span>
                  <span className="block text-sm font-semibold text-muted-foreground">{panel.contactPerson.role}</span>
                </InfoCard>
              )}
            </ul>
          </aside>
        )}

        <div className={cn('rounded-2xl border border-border bg-surface p-6 md:p-8', !panel && 'w-full max-w-3xl')}>
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
                {fillTemplate(success.message, { primaryContact: primaryContact.name ?? primaryContact.role })}
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
              className="space-y-5"
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
                <div className="grid gap-4 sm:grid-cols-2">
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
                <label htmlFor={fieldId('service')} className="mb-2 block font-semibold">
                  {labels.services} <span aria-hidden="true">*</span>
                </label>
                <select
                  id={fieldId('service')}
                  name="service"
                  required
                  value={service}
                  onChange={(e) => {
                    setService(e.target.value)
                    if (errors.service) setErrors((current) => ({ ...current, service: undefined }))
                  }}
                  disabled={disabled}
                  aria-invalid={errors.service ? true : undefined}
                  aria-describedby={describedBy(errors.service && fieldId('service-error'))}
                  data-ui-id={`${id}-service`}
                  data-ui-type="select"
                  data-ui-action="select"
                  data-ui-trigger="change"
                  className={inputClassName}
                >
                  <option value="" disabled>
                    {labels.servicePlaceholder}
                  </option>
                  {services.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.service && (
                  <p id={fieldId('service-error')} className="mt-2 text-sm text-destructive">
                    {errors.service}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor={fieldId('message')} className="mb-2 block font-semibold">
                  {labels.message}
                </label>
                <textarea
                  id={fieldId('message')}
                  name="message"
                  rows={3}
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
