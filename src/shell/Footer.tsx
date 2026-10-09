import type { LayoutShellProps } from '@spektra/layouts'
import { ContactAnchor } from '../sections/shared/ContactAnchor'
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
          <address className="mt-4 not-italic text-muted-foreground">{contact.address}</address>
        </div>

        <div>
          <h2 className="text-lg">{copy.contactTitle}</h2>
          <div className="mt-3 flex flex-col">
            <ContactAnchor link={contact.phone} action="call" id="footer-phone" label="Telefon" className="tabular-nums" />
            <ContactAnchor link={contact.email} action="email" id="footer-email" label="E-mail" />
          </div>
          {contact.hours.length > 0 && (
            <>
              <h3 className="mt-6 text-base">{copy.hoursTitle}</h3>
              <dl className="mt-2 text-muted-foreground">
                {contact.hours.map((entry) => (
                  <div key={entry.days} className="flex flex-wrap gap-x-3">
                    <dt>{entry.days}</dt>
                    <dd className="tabular-nums">{entry.hours}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
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
        <p className="mx-auto w-full max-w-content px-6 py-6 text-sm text-muted-foreground">
          © {year} {contact.companyName}
        </p>
      </div>
    </footer>
  )
}
