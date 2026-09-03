import { STRAIGHT_ANSWER_ITEMS } from '@/app/_components/straight-answer-items'

export function StraightAnswers() {
  return (
    <section id="straight-answers" className="scroll-mt-16">
      <div className="grid divide-border md:grid-cols-6 md:divide-x">
        <div className="flex flex-col gap-4 p-8 md:sticky md:top-16 md:col-span-2 md:self-start md:p-14">
          <h2 className="text-3xl font-medium tracking-tighter text-balance md:text-4xl">
            Straight answers.
          </h2>
          <p className="text-balance text-on-surface-muted">
            The things people ask before they type anything.
          </p>
        </div>

        {/* gap-px over a border-coloured background draws the hairlines between cells. */}
        <ul className="grid gap-px bg-border md:col-span-4 md:grid-cols-2">
          {STRAIGHT_ANSWER_ITEMS.map(({ question, answer, Icon }) => (
            <li key={question} className="flex flex-col gap-3 bg-surface p-6 md:p-8">
              <Icon aria-hidden="true" className="size-5 text-brand-deeper" />
              <h3 className="font-medium">{question}</h3>
              <p className="text-sm leading-relaxed text-on-surface-muted">{answer}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
