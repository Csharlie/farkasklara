import { cn } from '@spektra/components'
import { contentWidth, sectionSpacing } from '../../theme/layout'
import { ContactAnchor } from '../shared/ContactAnchor'
import type { FkContactData } from './fk-contact.schema'

/** Contact details derived from the single company source (data/contact.ts). */
export function FkContact({
  id,
  title,
  companyName,
  address,
  phone,
  email,
  hoursTitle,
  hours,
  primaryContact,
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
      <div className={cn(contentWidth, 'grid gap-5 md:grid-cols-2')}>
        <div className="rounded-xl border border-border bg-surface p-7 md:p-8">
          <h2 id={`${id}-title`} data-ui-role="section-title" className="text-3xl">
            {title}
          </h2>
          <address className="mt-6 not-italic">
            <p className="font-semibold">{companyName}</p>
            <p className="text-muted-foreground">{address}</p>
            <div className="mt-4 flex flex-col font-semibold">
              <ContactAnchor link={phone} action="call" id={`${id}-phone`} label="Telefon" />
              <ContactAnchor link={email} action="email" id={`${id}-email`} label="E-mail" />
            </div>
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

        <div className="rounded-xl border border-border bg-muted p-7 md:p-8">
          <p className="text-sm text-muted-foreground">{primaryContact.label}</p>
          <p className="mt-1 font-display text-3xl font-bold tracking-heading">{primaryContact.name}</p>
          <p className="text-muted-foreground">{primaryContact.role}</p>
          <div className="mt-4 flex flex-col font-semibold">
            <ContactAnchor link={primaryContact.phone} action="call" id={`${id}-primary-phone`} label="Telefon" />
            <ContactAnchor link={primaryContact.email} action="email" id={`${id}-primary-email`} label="E-mail" />
          </div>
        </div>
      </div>
    </section>
  )
}
