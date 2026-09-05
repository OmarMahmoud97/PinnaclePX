import type { MonolithContent } from '../copy-slots'
import {
  button,
  card,
  cardContent,
  cardDescriptionBrand,
  cardFooter,
  cardHeader,
  cardTitle,
  container,
} from '../styles'
import { Avatar } from './avatar'
import { Emphasis } from './emphasis'
import { SocialIcon } from './social-icons'

type Props = { team: NonNullable<MonolithContent['team']> }

// The source's Team: heading and lead, then four muted cards with a round portrait overlapping
// the top edge, the name, the position in the brand colour, a line and the social links as
// small ghost buttons.
export function MonolithTeam({ team }: Props) {
  return (
    <section id="team" className={`${container} py-24 sm:py-32`}>
      <h2 className="text-3xl font-bold md:text-4xl">
        <Emphasis heading={team.heading} />
      </h2>

      <p className="mt-4 mb-10 text-xl text-on-surface-muted">{team.lead}</p>

      <div className="grid gap-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
        {team.members.map((member) => (
          <div
            key={member.name}
            className={`${card} relative mt-8 flex flex-col items-center justify-center bg-surface-muted/50`}
          >
            <div className={`${cardHeader} mt-8 flex items-center justify-center pb-2`}>
              <Avatar
                image={member.image}
                name={member.name}
                className="absolute -top-12 aspect-square h-24 w-24"
                textClass="text-3xl"
              />
              <h3 className={`${cardTitle} text-center`}>{member.name}</h3>
              <p className={cardDescriptionBrand}>{member.position}</p>
            </div>

            <div className={`${cardContent} pb-2 text-center`}>
              <p>{member.body}</p>
            </div>

            <div className={cardFooter}>
              {member.socials.map((social) => (
                <div key={social.network}>
                  <a
                    rel="noreferrer noopener"
                    href={social.href}
                    target="_blank"
                    className={button.ghostSm}
                  >
                    <span className="sr-only">{social.network} icon</span>
                    <SocialIcon network={social.network} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
