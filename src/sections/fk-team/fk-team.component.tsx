import { cn } from '@spektra/components'
import { contentWidth, sectionSpacing, toneClassName } from '../../theme/layout'
import { ContactAnchor } from '../shared/ContactAnchor'
import { CtaLink } from '../shared/CtaLink'
import { SectionIntro } from '../shared/SectionIntro'
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

export function FkTeam({ id, title, intro, lead, members, more, joinedWithNext, tone }: FkTeamData) {
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
      <div className={contentWidth}>
        <SectionIntro id={id} title={title} intro={intro} />

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
