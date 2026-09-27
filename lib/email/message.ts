// One email as the sender takes it: a subject, a text part for every client, and the HTML. An
// email that names `replyTo` sends its replies there instead of to the sender; the notice of a
// message from /contact names the visitor, so the owner answers with one press (ADR 0040).
export type EmailMessage = Readonly<{
  subject: string
  text: string
  html: string
  replyTo?: string
}>

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${String(c.charCodeAt(0))};`)
}
