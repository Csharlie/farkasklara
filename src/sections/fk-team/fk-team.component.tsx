import { useRef } from 'react'
import { cn } from '@spektra/components'
import { contentWidth, sectionSpacing, toneClassName } from '../../theme/layout'
import { ContactAnchor } from '../shared/ContactAnchor'
import { CtaLink } from '../shared/CtaLink'
import { SectionIntro } from '../shared/SectionIntro'
import { useSlantedLeftClip } from '../shared/slanted-clip'
import type { FkTeamData, FkTeamMember } from './fk-team.schema'

/**
 * Decorative name in the top-left corner — large, pale gold, partly cropped
 * (same placement as the service-card icons). Hidden from assistive tech:
 * the real name is the card heading.
 */
function CornerName({ name, size }: { name?: string; size: 'lg' | 'md' }) {
  if (!name) return null
  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute -left-1 -top-3 select-none whitespace-nowrap font-display font-extrabold leading-none tracking-display text-accent opacity-[0.16]',
        size === 'lg' ? 'text-6xl md:text-7xl' : 'text-5xl md:text-6xl',
      )}
    >
      {name}
    </span>
  )
}

function Channels({ member }: { member: FkTeamMember }) {
  if (!member.phone && !member.email) return null
  return (
    <div className="mt-3 flex flex-col font-semibold">
      {member.phone && <ContactAnchor link={member.phone} action="call" id={`team-phone-${member.id}`} label="Telefon" />}
      {member.email && <ContactAnchor link={member.email} action="email" id={`team-email-${member.id}`} label="E-mail" />}
    </div>
  )
}

export function FkTeam({ id, title, intro, lead, members, more, joinedWithNext, tone, image }: FkTeamData) {
  const photoRef = useRef<HTMLElement>(null)
  // Slanted left edge with rounded corners (measured path); the class-based polygon is the first-paint fallback.
  // Same shape on every screen size (mobile included).
  const photoClip = useSlantedLeftClip(photoRef, { slant: 0.08, radius: 28, minWidth: 0 })

  if (!lead && members.length === 0) return null

  return (
    <section
      id={id}
      data-ui-id={`section-${id}`}
      data-ui-component="fk-team"
      data-ui-role="team"
      aria-labelledby={`${id}-title`}
      className={cn(sectionSpacing, toneClassName(tone), joinedWithNext && 'pb-6 md:pb-8')}
    >
      {image ? (
        /* Split layout: text on the left, the photo fills the right half up to the viewport edge, with a slightly slanted, rounded left edge. */
        <div className="relative">
          <div className={contentWidth}>
            <div className="flex flex-col justify-center lg:min-h-[34rem] lg:w-1/2 lg:pr-16">
              <SectionIntro id={id} title={title} intro={intro} />
            </div>
          </div>
          <figure
            ref={photoRef}
            style={photoClip ? { clipPath: photoClip } : undefined}
            data-ui-id={`${id}-photo`}
            data-ui-role="media"
            className="group relative mt-10 overflow-hidden lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:w-1/2 [clip-path:polygon(8%_0,100%_0,100%_100%,0_100%)]"
          >
            <img
              src={image.src}
              srcSet={image.srcSet}
              sizes="(min-width: 1024px) 50vw, 100vw"
              alt={image.alt}
              width={image.width}
              height={image.height}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover object-[center_45%] transition-transform duration-[1400ms] ease-out sm:aspect-[16/9] lg:aspect-auto lg:h-full motion-safe:group-hover:scale-[1.03]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-strong/70 via-transparent to-transparent"
            />
            {image.caption && (
              <figcaption className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-background/90 px-4 py-2 text-sm font-semibold text-foreground shadow-md backdrop-blur md:bottom-8 md:left-8">
                <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
                {image.caption}
              </figcaption>
            )}
          </figure>
        </div>
      ) : (
        <div className={contentWidth}>
          <SectionIntro id={id} title={title} intro={intro} />
        </div>
      )}

      <div className={contentWidth}>
        {lead && (
          <article
            data-ui-id={`team-lead-${lead.id}`}
            data-ui-type="card"
            className="relative mt-10 grid gap-8 overflow-hidden rounded-2xl border border-border bg-surface p-7 pt-20 md:p-10 md:pt-24 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-14"
          >
            <CornerName name={lead.name} size="lg" />
            <header className="relative">
              <div>
                <h3 data-ui-role="item-title" className="text-3xl md:text-4xl">
                  {lead.name ?? lead.role}
                </h3>
                {lead.name && <p className="mt-1 font-semibold text-accent-text">{lead.role}</p>}
                {lead.credentials && lead.credentials.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {lead.credentials.map((credential) => (
                      <li key={credential}>{credential}</li>
                    ))}
                  </ul>
                )}
                <Channels member={lead} />
              </div>
            </header>

            {lead.paragraphs.length > 0 && (
              <div data-ui-role="item-description" className="relative max-w-prose space-y-4 text-lg leading-relaxed">
                {lead.paragraphs.map((paragraph, index) => (
                  <p
                    key={paragraph}
                    className={cn(lead.paragraphs.length > 2 && index === lead.paragraphs.length - 1 && 'font-semibold')}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </article>
        )}

        {members.length > 0 && (
          <ul className={cn('grid gap-5 md:grid-cols-2', lead ? 'mt-5' : 'mt-10')}>
            {members.map((member) => (
              <li
                key={member.id}
                data-ui-id={`team-member-${member.id}`}
                data-ui-type="card"
                className="relative overflow-hidden rounded-xl border border-border bg-surface p-6 pt-16"
              >
                <CornerName name={member.name} size="md" />
                <div className="relative min-w-0">
                  <h3 data-ui-role="item-title" className="text-xl">
                    {member.name ?? member.role}
                  </h3>
                  {member.name && (
                    <p className="text-sm font-semibold text-accent-text">
                      {member.role}
                    </p>
                  )}
                  {member.credentials && member.credentials.length > 0 && (
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {member.credentials.map((credential) => (
                        <li key={credential}>{credential}</li>
                      ))}
                    </ul>
                  )}
                  {member.bio && (
                    <p data-ui-role="item-description" className="mt-2 text-muted-foreground">
                      {member.bio}
                    </p>
                  )}
                  <Channels member={member} />
                </div>
              </li>
            ))}
          </ul>
        )}

        {more && (
          <div className="mt-8">
            <CtaLink cta={more} />
          </div>
        )}
      </div>
    </section>
  )
}
