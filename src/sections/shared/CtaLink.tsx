import { ctaClassName } from '../../theme/layout'
import type { LinkCta } from './types'

/** Route-based CTA: a real <a>, styled with the platform button recipe. */
export function CtaLink({ cta, className }: { cta: LinkCta; className?: string }) {
  return (
    <a
      href={cta.href}
      data-ui-id={cta.id}
      data-ui-type="link"
      data-ui-role="cta"
      data-ui-action={cta.action ?? 'navigate'}
      data-ui-trigger="click"
      className={ctaClassName(cta.kind, className)}
    >
      {cta.text}
    </a>
  )
}
