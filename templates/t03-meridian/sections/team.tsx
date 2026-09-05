import Image from 'next/image'
import type { MeridianContent } from '../copy-slots'
import {
  card,
  cardContent,
  cardFooter,
  cardHeaderBare,
  cardTitle,
  container,
  eyebrow,
} from '../styles'
import { SocialIcon } from './icons'

type Props = { team: NonNullable<MeridianContent['team']> }

// The source's TeamSection: centred words over a grid of cards on the card surface, up to four
// across, each a square portrait in greyscale that colours and grows a touch under the pointer,
// the first name with the last name in the brand colour, the positions, and the social marks.
export function MeridianTeam({ team }: Props) {
  return (
    <section id="team" className={`${container} py-24 sm:py-32 lg:w-[75%]`}>
      <div className="mb-8 text-center">
        <h2 className={`${eyebrow} text-center`}>{team.eyebrow}</h2>

        <h2 className="text-center text-3xl font-bold md:text-4xl">{team.heading}</h2>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {team.members.map((member) => (
          <div
            key={`${member.firstName} ${member.lastName}`}
            className={`${card} group/hoverimg flex h-full flex-col overflow-hidden bg-accent`}
          >
            <div className={cardHeaderBare}>
              <div className="h-full overflow-hidden">
                {member.image === null ? (
                  <div aria-hidden="true" className="aspect-square w-full bg-surface-muted" />
                ) : (
                  <Image
                    src={member.image.src}
                    alt={member.image.alt}
                    width={300}
                    height={300}
                    className="aspect-square size-full w-full object-cover saturate-0 transition-all duration-200 ease-linear group-hover/hoverimg:scale-[1.01] group-hover/hoverimg:saturate-100"
                  />
                )}
              </div>
              <h3 className={`${cardTitle} px-6 py-6 pb-4`}>
                {member.firstName}
                <span className="ml-2 text-brand-deeper">{member.lastName}</span>
              </h3>
            </div>
            {member.positions.map((position, index) => (
              <div
                key={position}
                className={`${cardContent} pb-0 text-on-surface-muted ${index === member.positions.length - 1 ? 'pb-6' : ''}`}
              >
                {position}
                {index < member.positions.length - 1 && <span>,</span>}
              </div>
            ))}

            <div className={`${cardFooter} mt-auto [&>*+*]:ml-4`}>
              {member.socials.map((social) => (
                <a
                  key={social.network}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="transition-all hover:opacity-80"
                >
                  <span className="sr-only">{social.network}</span>
                  <SocialIcon network={social.network} />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
