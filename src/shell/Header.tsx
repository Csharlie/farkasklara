import { useState } from 'react'
import { cn } from '@spektra/components'
import type { LayoutShellProps } from '@spektra/layouts'
import { ctaClassName } from '../theme/layout'
import { ContactAnchor } from '../sections/shared/ContactAnchor'
import { ariaCurrent, currentPath, shell } from './shell-context'

/**
 * Header — maps SiteData navigation to a route-based header.
 * Not the platform NavigationBar: its CTA is an onClick <button> and it has
 * no phone slot, while this client needs a real <a> CTA and tap-to-call
 * (recorded as a platform observation in README.md).
 */
export function AppHeader({ siteData }: LayoutShellProps) {
  const [open, setOpen] = useState(false)
  const path = currentPath()
  const links = siteData.navigation.primary

  return (
    <header
      data-ui-id="site-header"
      data-ui-component="app-header"
      data-ui-role="banner"
      className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md"
    >
      <div className="mx-auto flex min-h-16 w-full max-w-content items-center justify-between gap-6 px-6 md:min-h-20">
        <a
          href="/"
          data-ui-id="header-logo"
          data-ui-type="link"
          data-ui-role="logo"
          data-ui-action="navigate"
          className="font-display text-lg font-extrabold tracking-heading md:text-xl"
        >
          {siteData.site.name}
        </a>

        <nav aria-label="Fő navigáció" data-ui-id="header-nav" data-ui-role="navigation" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  aria-current={ariaCurrent(link.href, path)}
                  data-ui-id={`nav-link-${link.href.slice(1) || 'home'}`}
                  data-ui-type="link"
                  data-ui-action="navigate"
                  className="inline-flex min-h-11 items-center font-medium text-foreground underline-offset-8 hover:underline aria-[current]:underline aria-[current]:decoration-2"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          {shell.contact.phone && (
            <ContactAnchor
              link={shell.contact.phone}
              action="call"
              id="header-phone"
              label="Telefon"
              className="hidden font-semibold tabular-nums sm:inline-flex"
            />
          )}
          <a
            href={shell.quote.href}
            data-ui-id="header-quote"
            data-ui-type="link"
            data-ui-role="cta"
            data-ui-action="navigate"
            className={ctaClassName('secondary', 'hidden min-h-11 px-5 py-2 sm:inline-flex')}
          >
            {shell.quote.label}
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            data-ui-id="nav-mobile-toggle"
            data-ui-type="toggle"
            data-ui-action="toggle"
            data-ui-trigger="click"
            className="inline-flex size-11 items-center justify-center rounded-full border border-border lg:hidden"
          >
            <span className="sr-only">{open ? 'Menü bezárása' : 'Menü megnyitása'}</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        aria-label="Fő navigáció (mobil)"
        hidden={!open}
        className={cn('border-t border-border/60 lg:hidden')}
      >
        <ul className="mx-auto flex w-full max-w-content flex-col px-6 py-4">
          {shell.contact.phone && (
            <li className="border-b border-border pb-2 sm:hidden">
              <ContactAnchor
                link={shell.contact.phone}
                action="call"
                id="nav-mobile-phone"
                label="Telefon"
                className="min-h-12 text-lg font-semibold tabular-nums"
              />
            </li>
          )}
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                aria-current={ariaCurrent(link.href, path)}
                data-ui-id={`nav-mobile-link-${link.href.slice(1) || 'home'}`}
                data-ui-type="link"
                data-ui-action="navigate"
                className="flex min-h-12 items-center border-b border-border text-lg font-medium aria-[current]:underline"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="pt-5">
            <a
              href={shell.quote.href}
              data-ui-id="nav-mobile-quote"
              data-ui-type="link"
              data-ui-role="cta"
              data-ui-action="navigate"
              className={ctaClassName('primary', 'w-full')}
            >
              {shell.quote.label}
            </a>
          </li>
        </ul>
      </nav>
    </header>
  )
}
