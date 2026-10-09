import { cn } from '@spektra/components'
import type { ContactLink } from './types'

interface ContactAnchorProps {
  link: ContactLink
  /** Analytics action (data-ui standard §7): call → phone, email → e-mail. */
  action: 'call' | 'email'
  /** Stable data-ui-id, e.g. 'footer-phone'. */
  id: string
  /** Accessible name prefix, e.g. 'Telefon'. */
  label?: string
  className?: string
}

/**
 * Phone / e-mail value. Renders a tracked tel:/mailto: link when the value is
 * real; while it is still a placeholder it renders plain text (no broken link).
 */
export function ContactAnchor({ link, action, id, label, className }: ContactAnchorProps) {
  if (!link.href) {
    return (
      <span data-ui-id={id} className={className}>
        {link.text}
      </span>
    )
  }
  return (
    <a
      href={link.href}
      data-ui-id={id}
      data-ui-type="link"
      data-ui-action={action}
      data-ui-trigger="click"
      aria-label={label ? `${label}: ${link.text}` : undefined}
      className={cn(
        'inline-flex min-h-11 items-center underline-offset-4 hover:underline',
        className,
      )}
    >
      {link.text}
    </a>
  )
}
