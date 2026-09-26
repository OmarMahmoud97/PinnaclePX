import type { SubmissionAnswers } from '@/lib/brief/submission'
import { type EmailMessage, escapeHtml } from '@/lib/email/message'
import { SITE } from '@/lib/site'

// One model call as the notice counts it: the shape of a model_call row, without the row.
export type ModelCallUsage = Readonly<{
  stage: string
  model: string
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
}>

type StageUsage = Readonly<{
  stage: string
  model: string
  calls: number
  input: number
  output: number
}>

type UsageSummary = Readonly<{
  calls: number
  // Tokens the model read, in three kinds: sent fresh, read from the cache, written to it.
  input: number
  cacheRead: number
  cacheWrite: number
  output: number
  total: number
  byStage: readonly StageUsage[]
}>

// Sums what a submission's model calls cost, in all and by stage and model, in call order.
export function summariseUsage(calls: readonly ModelCallUsage[]): UsageSummary {
  const byStage = new Map<string, StageUsage>()
  let input = 0
  let cacheRead = 0
  let cacheWrite = 0
  let output = 0
  for (const call of calls) {
    input += call.inputTokens
    cacheRead += call.cacheReadTokens
    cacheWrite += call.cacheWriteTokens
    output += call.outputTokens
    const key = `${call.stage}\0${call.model}`
    const read = call.inputTokens + call.cacheReadTokens + call.cacheWriteTokens
    const soFar = byStage.get(key)
    byStage.set(key, {
      stage: call.stage,
      model: call.model,
      calls: (soFar?.calls ?? 0) + 1,
      input: (soFar?.input ?? 0) + read,
      output: (soFar?.output ?? 0) + call.outputTokens,
    })
  }
  return {
    calls: calls.length,
    input,
    cacheRead,
    cacheWrite,
    output,
    total: input + cacheRead + cacheWrite + output,
    byStage: [...byStage.values()],
  }
}

type Concept = Readonly<{ templateId: string; name: string }>

type Input = Readonly<{
  lead: Readonly<{ name: string; email: string; company: string }>
  answers: SubmissionAnswers
  slug: string
  // The site's absolute address, without a trailing slash.
  appUrl: string
  // Ready when every stage finished; partial when any settled with its fallback.
  status: 'ready' | 'partial'
  // The stages that settled with the fallback, in pipeline order.
  fallbackStages: readonly string[]
  concepts: readonly Concept[]
  submittedAt: Date
  calls: readonly ModelCallUsage[]
}>

const number = new Intl.NumberFormat('en-GB')
const n = (value: number) => number.format(value)

const when = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Europe/London',
})

type Line = Readonly<{ label: string; value: string; url?: string }>

function logoLine(answers: SubmissionAnswers): Line {
  return answers.logo.kind === 'wordmark'
    ? { label: 'Logo', value: 'None uploaded; the name is set as a wordmark' }
    : { label: 'Logo', value: answers.logo.fileName, url: answers.logo.url }
}

function coloursLine(answers: SubmissionAnswers): Line {
  return answers.colours.kind === 'palette'
    ? { label: 'Colours', value: `The ${answers.colours.paletteId} palette` }
    : { label: 'Colours', value: `Their own colour, ${answers.colours.hex}` }
}

// What the owner sees of every build: the links to open, the details the client filled in, how
// the build ended, and what the model calls cost in tokens. Sent to the owner alone, so the
// client's details may appear here in full; the log still never carries them.
export function ownerNoticeEmail(input: Input): EmailMessage {
  const { lead, answers, concepts } = input
  const usage = summariseUsage(input.calls)
  const count = concepts.length
  const noun = count === 1 ? 'design' : 'designs'
  const subject = `${String(count)} ${noun} built for ${lead.company}${input.status === 'partial' ? ' (partial)' : ''}`

  const hubUrl = `${input.appUrl}/preview/${input.slug}`
  const links: Line[] = [
    { label: 'All designs', value: hubUrl, url: hubUrl },
    ...concepts.map((concept) => {
      const url = `${hubUrl}/${concept.templateId}`
      return { label: concept.name, value: url, url }
    }),
  ]

  const photos = answers.imagery.photos
  const client: Line[] = [
    { label: 'Name', value: lead.name },
    { label: 'Email', value: lead.email, url: `mailto:${lead.email}` },
    { label: 'Company', value: lead.company },
    { label: 'About the business', value: answers.description },
    logoLine(answers),
    coloursLine(answers),
    { label: 'Look', value: answers.imagery.style },
    ...(photos.length === 0
      ? [{ label: 'Photos', value: 'None uploaded' }]
      : photos.map((photo, index) => ({
          label: `Photo ${String(index + 1)}`,
          value: photo.fileName,
          url: photo.url,
        }))),
  ]

  const ending =
    input.status === 'ready'
      ? 'Ready: every stage finished.'
      : `Partial: ${input.fallbackStages.join(', ')} settled with the fallback.`
  const build: Line[] = [
    { label: 'Submitted', value: `${when.format(input.submittedAt)} (London)` },
    { label: 'Outcome', value: ending },
    { label: 'Slug', value: input.slug },
  ]

  const cacheNote =
    usage.cacheRead + usage.cacheWrite === 0
      ? ''
      : `, of which ${n(usage.cacheRead)} read from the cache and ${n(usage.cacheWrite)} written to it`
  const tokens: Line[] = [
    {
      label: 'Total',
      value: `${n(usage.total)} tokens over ${String(usage.calls)} ${usage.calls === 1 ? 'call' : 'calls'}`,
    },
    { label: 'Input', value: `${n(usage.input + usage.cacheRead + usage.cacheWrite)}${cacheNote}` },
    { label: 'Output', value: n(usage.output) },
    ...usage.byStage.map((stage) => ({
      label: `${stage.stage} (${stage.model})`,
      value: `${String(stage.calls)} ${stage.calls === 1 ? 'call' : 'calls'}, ${n(stage.input)} in, ${n(stage.output)} out`,
    })),
  ]
  if (usage.calls === 0) {
    tokens.push({
      label: 'Note',
      value: 'No model call was recorded; every stage used its fallback.',
    })
  }

  const sections: readonly Readonly<{ heading: string; lines: readonly Line[] }>[] = [
    { heading: 'Links', lines: links },
    { heading: 'Client', lines: client },
    { heading: 'Build', lines: build },
    { heading: 'Claude tokens', lines: tokens },
  ]

  const text = [
    `${subject}.`,
    ...sections.flatMap((section) => [
      '',
      section.heading,
      ...section.lines.map((line) =>
        line.url === undefined || line.url === line.value
          ? `${line.label}: ${line.value}`
          : `${line.label}: ${line.value} (${line.url})`,
      ),
    ]),
    '',
    SITE.name,
  ].join('\n')

  const cell = (line: Line) => {
    const value = escapeHtml(line.value)
    return line.url === undefined ? value : `<a href="${escapeHtml(line.url)}">${value}</a>`
  }
  const html = [
    `<p>${escapeHtml(subject)}.</p>`,
    ...sections.map(
      (section) =>
        `<h2>${escapeHtml(section.heading)}</h2>\n<table>\n${section.lines
          .map(
            (line) =>
              `<tr><th align="left">${escapeHtml(line.label)}</th><td>${cell(line)}</td></tr>`,
          )
          .join('\n')}\n</table>`,
    ),
    `<p>${escapeHtml(SITE.name)}</p>`,
  ].join('\n')

  return { subject, text, html }
}
