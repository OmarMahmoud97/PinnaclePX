// The five questions, in the order the visitor answers them (docs/start-page-journey-plan.md,
// D2). The sentence comes first because it costs nothing to give; the business name follows, so
// their name is on the page before anything is asked of them; the look and the colour make it
// theirs; and the email comes last, framed as where to send the designs. `brand` is the business
// name and its mark, because `name` is the person's own field. The home page's walkthrough keeps
// its own steps (app/_components/walkthrough-steps.ts), which walkthrough-steps.test.ts holds to
// these titles in this order, so the two cannot drift apart.
export const QUESTION_IDS = ['describe', 'brand', 'imagery', 'colours', 'details'] as const

export type QuestionId = (typeof QUESTION_IDS)[number]
