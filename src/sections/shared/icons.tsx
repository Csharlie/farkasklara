import type { SVGProps } from 'react'
import { paths, type IconName } from './icon-paths'

export type { IconName } from './icon-paths'

/** Small inline icon (24×24, 1.5 stroke) — the client has no icon dependency. */
export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {paths[name]}
    </svg>
  )
}
