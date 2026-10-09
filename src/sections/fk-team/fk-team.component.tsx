import { cn } from '@spektra/components'
import { contentWidth, sectionSpacing, toneClassName } from '../../theme/layout'
import { ContactAnchor } from '../shared/ContactAnchor'
import { monogramOf } from '../shared/monogram'
import { SectionIntro } from '../shared/SectionIntro'
import type { FkTeamData } from './fk-team.schema'

export function FkTeam({ id, title, intro, members, primaryBadge, tone }: FkTeamData) {
  if (members.length === 0) return null

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

        <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <li
              key={member.id}
              data-ui-id={`team-member-${member.id}`}
              data-ui-type="card"
              className="flex flex-col rounded-xl border border-border bg-surface p-7 md:p-8"
            >
              {member.photo ? (
                <img
                  src={member.photo}
                  alt=""
                  data-ui-type="image"
                  className="size-20 rounded-full object-cover"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="flex size-20 items-center justify-center rounded-full bg-muted font-display text-2xl font-bold tracking-heading text-foreground"
                >
                  {monogramOf(member.name)}
                </span>
              )}

              <h3 data-ui-role="item-title" className="mt-6 text-2xl">
                {member.name}
              </h3>
              <p data-ui-role="meta" className="mt-1 text-muted-foreground">
                {member.role}
              </p>

              {member.isPrimaryContact && (
                <p
                  data-ui-type="badge"
                  className="mt-4 w-fit rounded-full bg-muted px-3 py-1 text-sm font-semibold text-accent-text"
                >
                  {primaryBadge}
                </p>
              )}

              {member.credentials && member.credentials.length > 0 && (
                <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                  {member.credentials.map((credential) => (
                    <li key={credential}>{credential}</li>
                  ))}
                </ul>
              )}

              {member.bio && (
                <p data-ui-role="item-description" className="mt-4">
                  {member.bio}
                </p>
              )}

              {(member.phone || member.email) && (
                <div className="mt-auto flex flex-col pt-6 font-semibold">
                  {member.phone && (
                    <ContactAnchor link={member.phone} action="call" id={`team-phone-${member.id}`} label="Telefon" />
                  )}
                  {member.email && (
                    <ContactAnchor link={member.email} action="email" id={`team-email-${member.id}`} label="E-mail" />
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
