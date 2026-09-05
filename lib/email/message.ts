// One email as the sender takes it: a subject, a text part for every client, and the HTML.
export type EmailMessage = Readonly<{ subject: string; text: string; html: string }>

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${String(c.charCodeAt(0))};`)
}
