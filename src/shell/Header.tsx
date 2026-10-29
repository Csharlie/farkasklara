import { useId, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'
import { cn } from '@spektra/components'
import type { LayoutShellProps } from '@spektra/layouts'
import type { NavItem } from '@spektra/types'
import { ctaClassName } from '../theme/layout'
import { Icon } from '../sections/shared/icons'
import { pathToPageSlug, routes } from '../data/routes'
import { ariaCurrent, currentPath, shell } from './shell-context'

/** data-ui-id fragment of a link: its page slug ('home', 'kapcsolat') — independent of the deploy base. */
const uiSlug = (href: string) => pathToPageSlug(href).replace(/\//g, '-')

// Dark blue-grey underline draws in from the left. Width is animated (not a
// scale transform), so the 2px line stays crisp at constant thickness.
const underlineClass = cn(
  "after:absolute after:bottom-1.5 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-surface-strong after:content-['']",
  'after:transition-[width] after:duration-300 after:ease-out hover:after:w-full',
  'motion-reduce:after:transition-none',
)

const desktopLinkClass = cn(
  'relative inline-flex min-h-11 items-center font-medium text-foreground',
  underlineClass,
  'aria-[current]:after:w-full',
)

function Chevron({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

/**
 * Desktop nav item with a dropdown (disclosure pattern): the label stays a
 * link to the parent page; the chevron button toggles the list. Opens on
 * hover too; closes on Escape, on leaving with the mouse or with focus.
 */
function DesktopDropdown({ link, path }: { link: NavItem; path: string }) {
  const [open, setOpen] = useState(false)
  const listId = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const slug = uiSlug(link.href)
  const current = ariaCurrent(link.href, path)

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      setOpen(false)
      buttonRef.current?.focus()
    }
  }
  const onBlur = (e: FocusEvent<HTMLLIElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false)
  }

  return (
    <li
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
    >
      {/* One underline under label + chevron: drawn by this wrapper, kept while the list is open. */}
      <span className={cn('relative flex min-h-11 items-center gap-0.5', underlineClass, (open || current) && 'after:w-full')}>
        <a
          href={link.href}
          aria-current={current}
          data-ui-id={`nav-link-${slug}`}
          data-ui-type="link"
          data-ui-action="navigate"
          className="inline-flex min-h-11 items-center font-medium text-foreground"
        >
          {link.label}
        </a>
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((v) => !v)}
          data-ui-id={`nav-dropdown-${slug}`}
          data-ui-type="toggle"
          data-ui-action="toggle"
          data-ui-trigger="click"
          className="inline-flex h-11 w-5 items-center justify-end text-foreground"
        >
          <span className="sr-only">{`${link.label} almenü`}</span>
          <Chevron className={cn('size-4 transition-transform motion-reduce:transition-none', open && 'rotate-180')} />
        </button>
      </span>
      {/* pt bridges the gap below the header row, so the hover does not drop on the way down. */}
      <div className={cn('absolute left-0 top-full pt-2', !open && 'hidden')}>
        <ul
          id={listId}
          data-ui-id={`nav-dropdown-${slug}-list`}
          className="min-w-72 rounded-xl border border-border bg-background p-2 shadow-lg"
        >
          {link.children!.map((child) => (
            <li key={child.href}>
              <a
                href={child.href}
                aria-current={ariaCurrent(child.href, path)}
                data-ui-id={`nav-link-${uiSlug(child.href)}`}
                data-ui-type="link"
                data-ui-action="navigate"
                className="flex min-h-11 items-center rounded-lg px-3 font-medium text-foreground hover:bg-muted aria-[current]:bg-muted"
              >
                {child.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </li>
  )
}

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
  const contactName = shell.contact.primaryContact.name
  const callLabel = contactName
    ? `${contactName} hívása: ${shell.contact.phone?.text ?? ''}`
    : `Telefon: ${shell.contact.phone?.text ?? ''}`

  return (
    <header
      data-ui-id="site-header"
      data-ui-component="app-header"
      data-ui-role="banner"
      className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md"
    >
      <div className="mx-auto flex min-h-16 w-full max-w-content items-center gap-6 px-6 md:min-h-20">
        <a
          href={routes.home}
          data-ui-id="header-logo"
          data-ui-type="link"
          data-ui-role="logo"
          data-ui-action="navigate"
          className="font-display text-lg font-extrabold tracking-heading md:text-xl"
        >
          {siteData.site.name}
        </a>

        <nav aria-label="Fő navigáció" data-ui-id="header-nav" data-ui-role="navigation" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-7">
            {links.map((link) =>
              link.children?.length ? (
                <DesktopDropdown key={link.href} link={link} path={path} />
              ) : (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={ariaCurrent(link.href, path)}
                    data-ui-id={`nav-link-${uiSlug(link.href)}`}
                    data-ui-type="link"
                    data-ui-action="navigate"
                    className={desktopLinkClass}
                  >
                    {link.label}
                  </a>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:gap-4 lg:ml-2">
          {/* Phone in place of the header CTA (the quote CTA stays in the mobile menu). */}
          {shell.contact.phone?.href && (
            <a
              href={shell.contact.phone.href}
              aria-label={callLabel}
              title={callLabel}
              data-ui-id="header-phone"
              data-ui-type="link"
              data-ui-role="cta"
              data-ui-action="call"
              data-ui-trigger="click"
              className={ctaClassName('secondary', 'hidden min-h-11 gap-2 px-5 py-2 tabular-nums sm:inline-flex')}
            >
              <Icon name="phone" className="size-[1.125rem] text-accent" />
              {shell.contact.phone.text}
            </a>
          )}
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
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                aria-current={ariaCurrent(link.href, path)}
                data-ui-id={`nav-mobile-link-${uiSlug(link.href)}`}
                data-ui-type="link"
                data-ui-action="navigate"
                className="flex min-h-12 items-center border-b border-border text-lg font-medium aria-[current]:underline"
              >
                {link.label}
              </a>
              {link.children?.length ? (
                <ul aria-label={link.label} className="border-b border-border py-1 pl-4">
                  {link.children.map((child) => (
                    <li key={child.href}>
                      <a
                        href={child.href}
                        aria-current={ariaCurrent(child.href, path)}
                        data-ui-id={`nav-mobile-link-${uiSlug(child.href)}`}
                        data-ui-type="link"
                        data-ui-action="navigate"
                        className="flex min-h-11 items-center text-muted-foreground aria-[current]:font-medium aria-[current]:text-foreground aria-[current]:underline"
                      >
                        {child.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
          {shell.contact.phone?.href && (
            <li className="pt-5">
              <a
                href={shell.contact.phone.href}
                aria-label={callLabel}
                onClick={() => setOpen(false)}
                data-ui-id="nav-mobile-call"
                data-ui-type="link"
                data-ui-role="cta"
                data-ui-action="call"
                data-ui-trigger="click"
                className={ctaClassName('secondary', 'w-full gap-2 tabular-nums')}
              >
                <Icon name="phone" className="size-[1.125rem] text-accent" />
                {shell.contact.phone.text}
              </a>
            </li>
          )}
        </ul>
      </nav>
    </header>
  )
}
