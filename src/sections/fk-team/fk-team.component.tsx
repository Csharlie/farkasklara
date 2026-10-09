import { cn } from '@spektra/components'
import { contentWidth, sectionSpacing, toneClassName } from '../../theme/layout'
import { ContactAnchor } from '../shared/ContactAnchor'
import { CtaLink } from '../shared/CtaLink'
import { monogramOf } from '../shared/monogram'
import { SectionIntro } from '../shared/SectionIntro'
import type { FkTeamData, FkTeamMember } from './fk-team.schema'

function Avatar({ member, size }: { member: FkTeamMember; size: 'lg' | 'md' }) {
  const sizeClass = size === 'lg' ? 'size-24 text-3xl' : 'size-14 text-xl'
  if (member.photo) {
    return <img src={member.photo} alt="" data-ui-type="image" className={cn(sizeClass, 'rounded-full object-cover')} />
  }
  // No portrait, no invented face: monogram for a known name, nothing otherwise.
  if (!member.name) return null
  return (
    <span
      aria-hidden="true"
      className={cn(
        sizeClass,
        'flex shrink-0 items-center justify-center rounded-full bg-muted font-display font-bold tracking-heading text-foreground',
      )}
    >
      {monogramOf(member.name)}
    </span>
  )
}

function Channels({ member }: { member: FkTeamMember }) {
  if (!member.phone && !member.email) return null
  return (
    <div className="mt-4 flex flex-col font-semibold">
      {member.phone && <ContactAnchor link={member.phone} action="call" id={`team-phone-${member.id}`} label="Telefon" />}
      {member.email && <ContactAnchor link={member.email} action="email" id={`team-email-${member.id}`} label="E-mail" />}
    </div>
  )
}

export function FkTeam({ id, title, intro, lead, facts, members, primaryBadge, more, tone }: FkTeamData) {
  if (!lead && members.length === 0) return null

  return (
    <section
      id={id}
      data-ui-id={`section-${id}`}
      data-ui-component="fk-team"
      data-ui-role="team"
      aria-labelledby={`${id}-title`}
      className={cn(sectionSpacing, toneClassName(tone))}
    >
      <div className={contentWidth}>
        <SectionIntro id={id} title={title} intro={intro} />

        {lead && (
          <article
            data-ui-id={`team-lead-${lead.id}`}
            data-ui-type="card"
            className="mt-12 grid gap-8 rounded-2xl border border-border bg-surface p-7 md:p-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12"
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <Avatar member={lead} size="lg" />
              <div>
                <p
                  data-ui-type="badge"
                  className="w-fit rounded-full bg-muted px-3 py-1 text-sm font-semibold text-accent-text"
                >
                  {lead.badge}
                </p>
                <h3 data-ui-role="item-title" className="mt-4 text-3xl md:text-4xl">
                  {lead.name ?? lead.role}
                </h3>
                {lead.name && lead.role !== lead.badge && <p className="mt-1 text-muted-foreground">{lead.role}</p>}
                {lead.bio && (
                  <p data-ui-role="item-description" className="mt-4 max-w-prose text-lg">
                    {lead.bio}
                  </p>
                )}
                {lead.credentials && lead.credentials.length > 0 && (
                  <ul className="mt-4 space-y-1 text-muted-foreground">
                    {lead.credentials.map((credential) => (
                      <li key={credential}>{credential}</li>
                    ))}
                  </ul>
                )}
                <Channels member={lead} />
              </div>
            </div>

            {facts && facts.length > 0 && (
              <dl className="grid grid-cols-2 content-start gap-x-6 gap-y-6 border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex flex-col-reverse gap-1">
                    <dt className="text-sm text-muted-foreground">{fact.label}</dt>
                    <dd className="font-display text-3xl font-bold tracking-heading tabular-nums">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </article>
        )}

        {members.length > 0 && (
          <ul className={cn('grid gap-5 md:grid-cols-2', lead ? 'mt-5' : 'mt-12')}>
            {members.map((member) => (
              <li
                key={member.id}
                data-ui-id={`team-member-${member.id}`}
                data-ui-type="card"
                className="flex gap-5 rounded-xl border border-border bg-surface p-6"
              >
                <Avatar member={member} size="md" />
                <div className="min-w-0">
                  <h3 data-ui-role="item-title" className="text-xl">
                    {member.name ?? member.role}
                  </h3>
                  {member.name && <p className="text-muted-foreground">{member.role}</p>}
                  {member.isPrimaryContact && (
                    <p
                      data-ui-type="badge"
                      className="mt-3 w-fit rounded-full bg-muted px-3 py-1 text-sm font-semibold text-accent-text"
                    >
                      {primaryBadge}
                    </p>
                  )}
                  {member.credentials && member.credentials.length > 0 && (
                    <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                      {member.credentials.map((credential) => (
                        <li key={credential}>{credential}</li>
                      ))}
                    </ul>
                  )}
                  {member.bio && (
                    <p data-ui-role="item-description" className="mt-3 text-muted-foreground">
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
