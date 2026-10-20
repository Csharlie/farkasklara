import type { LayoutShellProps } from '@spektra/layouts'
import { ContactAnchor } from '../sections/shared/ContactAnchor'
import { Icon } from '../sections/shared/icons'
import { ConsentSettingsLink } from './ConsentUi'
import { shell } from './shell-context'

/** Footer — every contact value comes from the single company source. */
export function AppFooter({ siteData }: LayoutShellProps) {
  const { contact, copy } = shell
  const year = new Date().getFullYear()

  return (
    <footer
      data-ui-id="site-footer"
      data-ui-component="app-footer"
      data-ui-role="contentinfo"
      data-color-scheme="dark"
      className="bg-background text-foreground"
    >
      <div className="mx-auto grid w-full max-w-content gap-10 px-6 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-xl font-extrabold tracking-heading">{contact.companyName}</p>
          <p className="mt-4 text-muted-foreground">{shell.tagline}</p>
        </div>

        <div>
          <h2 className="text-lg">{copy.contactTitle}</h2>
          <ul className="mt-4 space-y-3 text-muted-foreground">
            {contact.addressLines.length > 0 && (
              <li className="flex items-start gap-3">
                <Icon name="mapPin" className="mt-0.5 size-5 shrink-0 text-accent" />
                <address className="not-italic">
                  {contact.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </li>
            )}
            {contact.primaryContact.name && (
              <li className="flex items-start gap-3">
                <Icon name="user" className="mt-0.5 size-5 shrink-0 text-accent" />
                <span>
                  <span className="block font-semibold text-foreground">{contact.primaryContact.name}</span>
                  <span className="block text-sm">{contact.primaryContact.role}</span>
                </span>
              </li>
            )}
            {contact.phone && (
              <li className="flex items-center gap-3">
                <Icon name="phone" className="size-5 shrink-0 text-accent" />
                <ContactAnchor link={contact.phone} action="call" id="footer-phone" label="Telefon" className="font-semibold text-foreground underline decoration-muted-on-dark/60 decoration-1 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent tabular-nums" />
              </li>
            )}
            {contact.email && (
              <li className="flex items-center gap-3">
                <Icon name="mail" className="size-5 shrink-0 text-accent" />
                <span className="min-w-0 break-all">
                  <ContactAnchor link={contact.email} action="email" id="footer-email" label="E-mail" className="font-semibold text-foreground underline decoration-muted-on-dark/60 decoration-1 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent" />
                </span>
              </li>
            )}
            {contact.hours.length > 0 && (
              <li className="flex items-start gap-3">
                <Icon name="clock" className="mt-0.5 size-5 shrink-0 text-accent" />
                <div>
                  <span className="sr-only">{copy.hoursTitle}: </span>
                  <dl>
                    {contact.hours.map((entry) => (
                      <div key={entry.days} className="flex flex-wrap gap-x-3">
                        <dt>{entry.days}</dt>
                        <dd className="tabular-nums">{entry.hours}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-1 text-sm">{copy.appointmentNote}</p>
                </div>
              </li>
            )}
          </ul>
        </div>

        {shell.services.length > 0 && (
          <nav aria-labelledby="footer-services-title">
            <h2 id="footer-services-title" className="text-lg">
              {copy.servicesTitle}
            </h2>
            <ul className="mt-3">
              {shell.services.map((service) => (
                <li key={service.slug}>
                  <a
                    href={service.href}
                    data-ui-id={`footer-service-${service.slug}`}
                    data-ui-type="link"
                    data-ui-action="navigate"
                    className="inline-flex min-h-11 items-center text-muted-foreground hover:text-foreground"
                  >
                    {service.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <nav aria-labelledby="footer-pages-title">
          <h2 id="footer-pages-title" className="text-lg">
            {copy.pagesTitle}
          </h2>
          <ul className="mt-3">
            {[...siteData.navigation.primary, ...(siteData.navigation.footer ?? [])].map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  data-ui-id={`footer-link-${link.href.slice(1)}`}
                  data-ui-type="link"
                  data-ui-action="navigate"
                  className="inline-flex min-h-11 items-center text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-content flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-6 text-sm text-muted-foreground">
          <p>
            © {year} {contact.companyName}
          </p>
          <ConsentSettingsLink className="inline-flex min-h-11 items-center underline-offset-4 hover:text-foreground hover:underline" />
        </div>
      </div>
    </footer>
  )
}
