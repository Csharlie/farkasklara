import { cn } from '@spektra/components'
import { contentWidth, sectionSpacing } from '../../theme/layout'
import { ContactAnchor } from '../shared/ContactAnchor'
import type { FkContactData } from './fk-contact.schema'

/**
 * Official office contact details and roles — all derived from the
 * single company source (data/contact.ts). Unknown values are not rendered.
 */
export function FkContact({
  id,
  title,
  companyName,
  address,
  directions,
  phone,
  email,
  hoursTitle,
  hours,
  primaryContact,
  lead,
}: FkContactData) {
  return (
    <section
      id={id}
      data-ui-id={`section-${id}`}
      data-ui-component="fk-contact"
      data-ui-role="contact"
      aria-labelledby={`${id}-title`}
      className={cn(sectionSpacing, 'bg-background')}
    >
      <div className={cn(contentWidth, 'grid items-start gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]')}>
        <div className="min-w-0 rounded-xl border border-border bg-surface p-6 md:p-8">
          <h2 id={`${id}-title`} data-ui-role="section-title" className="text-3xl">
            {title}
          </h2>
          <address className="mt-6 not-italic">
            <p className="font-semibold">{companyName}</p>
            {address && <p className="text-muted-foreground">{address}</p>}
            {directions && (
              <a
                href={directions.href}
                target="_blank"
                rel="noopener noreferrer"
                data-ui-id={`${id}-directions`}
                data-ui-type="link"
                data-ui-action="navigate"
                data-ui-trigger="click"
                className="mt-1 inline-flex min-h-11 items-center font-semibold underline underline-offset-4 hover:text-accent-text"
              >
                {directions.label}
                <span className="sr-only"> (új lapon nyílik)</span>
              </a>
            )}
            {(phone || email) && (
              <div className="mt-4 flex flex-col font-semibold">
                {phone && <ContactAnchor link={phone} action="call" id={`${id}-phone`} label="Telefon" />}
                {email && <ContactAnchor link={email} action="email" id={`${id}-email`} label="E-mail" />}
              </div>
            )}
          </address>

          {hours.length > 0 && (
            <>
              <h3 className="mt-8 text-xl">{hoursTitle}</h3>
              <dl className="mt-3 space-y-1">
                {hours.map((entry) => (
                  <div key={entry.days} className="flex flex-wrap gap-x-4">
                    <dt className="text-muted-foreground">{entry.days}</dt>
                    <dd className="tabular-nums">{entry.hours}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}

        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <div className="rounded-xl border border-border bg-muted p-6 md:p-8">
            <p className="text-sm font-semibold text-accent-text">{primaryContact.label}</p>
            <p className="mt-2 font-display text-2xl font-bold tracking-heading">
              {primaryContact.name ?? primaryContact.role}
            </p>
            {primaryContact.name && <p className="text-muted-foreground">{primaryContact.role}</p>}
            {primaryContact.description && <p className="mt-3">{primaryContact.description}</p>}
            {(primaryContact.phone || primaryContact.email) && (
              <div className="mt-4 flex flex-col font-semibold">
                {primaryContact.phone && (
                  <ContactAnchor link={primaryContact.phone} action="call" id={`${id}-primary-phone`} label="Telefon" />
                )}
                {primaryContact.email && (
                  <ContactAnchor link={primaryContact.email} action="email" id={`${id}-primary-email`} label="E-mail" />
                )}
              </div>
            )}
          </div>

          {lead && (
            <div className="rounded-xl border border-border bg-surface p-6 md:p-8">
              <p className="text-sm text-muted-foreground">{lead.label}</p>
              <p className="mt-1 text-xl font-semibold">{lead.name ?? lead.role}</p>
              {lead.description && <p className="mt-2 text-muted-foreground">{lead.description}</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
