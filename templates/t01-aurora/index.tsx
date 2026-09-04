import './aurora.css'
import type { AuroraContent } from './copy-slots'
import { AuroraCta } from './sections/cta'
import { AuroraFeatures } from './sections/features'
import { AuroraFooter } from './sections/footer'
import { AuroraHero } from './sections/hero'
import { AuroraHowItWorks } from './sections/how-it-works'
import { AuroraNav } from './sections/nav'
import { AuroraStatement } from './sections/statement'

type Props = { content: AuroraContent }

// Aurora: light on a field. Seven sections, one content object, tokens only. The root carries
// the template's class for aurora.css and the two type families, which the preview root sets.
export function Aurora({ content }: Props) {
  const { brand, nav, hero, features, steps, statement, cta, footer } = content
  const credits = [hero.image, statement.image].flatMap((image) =>
    image?.credit ? [image.credit] : [],
  )
  return (
    <div id="top" className="aurora bg-surface font-body text-on-surface antialiased">
      <AuroraNav brand={brand} nav={nav} />
      <main id="main">
        <AuroraHero brand={brand} hero={hero} features={features} />
        <AuroraFeatures features={features} />
        <AuroraHowItWorks steps={steps} />
        <AuroraStatement statement={statement} />
        <AuroraCta cta={cta} />
      </main>
      <AuroraFooter brand={brand} footer={footer} credits={credits} />
    </div>
  )
}
