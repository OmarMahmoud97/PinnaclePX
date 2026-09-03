// The five questions, in the order the visitor answers them. The sentence comes first because it
// costs nothing to give; the email is asked second, framed as where to send the link. The home
// page reads the count from here too, so it cannot drift from the form.
export const QUESTION_IDS = ['describe', 'details', 'logo', 'imagery', 'colours'] as const

export type QuestionId = (typeof QUESTION_IDS)[number]
