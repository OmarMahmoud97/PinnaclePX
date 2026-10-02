import type { noteModelCall } from '@/lib/ai/usage'
import { extractJson } from '@/lib/ai/json'
import type { CallRecord, CopyAttempt, JudgedViolation } from './types'

// How the eval keeps what noteModelCall receives: every call's usage, with the answer it
// carried, held in memory until the fixture is written. The harness (pipeline.eval.ts) mocks
// noteModelCall with note(), so every model call the pipeline's own functions make lands here.

type Noted = Parameters<typeof noteModelCall>

// One call as noted: its usage, its parsed answer, and its text when that did not parse.
export type Note = CallRecord & { parsed: unknown; raw: string | null }

// How much of an unreadable answer's text a record keeps: the whole answer, so a defect near its
// end can be read too. l6's sixteen unreadable answers ran 840 to 2,304 output tokens (Harbor's
// six 1,662 to 1,721), and its readable ones set out at up to 3.95 characters a token, so its
// longest unreadable one is about 9,100 characters; 12,000 holds that with room. An answer the
// call's own ceiling cut short (CONFIG.ai.maxTokens.copy, 8,000 tokens) is kept to this length,
// and its stop reason, max_tokens, says why it broke.
export const RAW_TEXT_LIMIT = 12_000

// The violation an answer that did not parse counts as. The pipeline reads it the same way
// (lib/ai/json.ts, parseJsonAnswer) and asks again, so it is never a fit.
export const NOT_JSON: JudgedViolation = {
  path: '',
  reason: 'the answer was not JSON',
  kind: 'shape',
}

// The answer a call carried: the parsed output of a structured call, else the JSON in its text
// by the pipeline's own reader (extractJson), else null with the text kept, cut to
// RAW_TEXT_LIMIT characters. A structured call with no output keeps no text.
export function answerOf(response: Noted[0]): { parsed: unknown; raw: string | null } {
  const structured = (response as { parsed_output?: unknown }).parsed_output
  if (structured !== undefined) return { parsed: structured, raw: null }
  const content = (response as { content?: unknown }).content
  if (!Array.isArray(content)) return { parsed: null, raw: null }
  const text = content
    .map((block: unknown) => {
      const b = block as { type?: unknown; text?: unknown }
      return b.type === 'text' && typeof b.text === 'string' ? b.text : ''
    })
    .join('')
  try {
    return { parsed: extractJson(text), raw: null }
  } catch {
    return { parsed: null, raw: text.slice(0, RAW_TEXT_LIMIT) }
  }
}

// The notes of a run, and the clocks and step numbers that say when and where each call began.
// onNote sees every call as it is noted, which is how the spend stop prices the run so far.
export function notebook(onNote: (note: Note) => void = () => undefined) {
  const notes: Note[] = []
  const started = new Map<string, number>()
  // The step attempt each template's copy is on, so the notes can say which fresh start a call
  // belonged to.
  const steps = new Map<string, number>()

  // noteModelCall's stand-in: the call's usage and answer, timed from the call before it.
  function note(response: Noted[0], call: Noted[1]): Promise<void> {
    const key = `${call.slug}\0${call.stage}\0${call.template ?? ''}`
    const begun = started.get(key)
    const { parsed, raw } = answerOf(response)
    const noted: Note = {
      slug: call.slug,
      stage: call.stage,
      template: call.template ?? null,
      attempt: call.attempt ?? 0,
      step: steps.get(`${call.slug}\0${call.template ?? ''}`) ?? 0,
      model: response.model,
      stop: response.stop_reason ?? 'none',
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
      cacheRead: response.usage.cache_read_input_tokens ?? 0,
      cacheWrite: response.usage.cache_creation_input_tokens ?? 0,
      ms: begun === undefined ? null : Date.now() - begun,
      at: new Date().toISOString(),
      parsed,
      raw,
    }
    notes.push(noted)
    onNote(noted)
    started.set(key, Date.now())
    return Promise.resolve()
  }

  // A stage's clock starts now, for the first call's time.
  function begin(slug: string, stage: CallRecord['stage'], template?: string): void {
    started.set(`${slug}\0${stage}\0${template ?? ''}`, Date.now())
  }

  function step(slug: string, template: string, value: number): void {
    steps.set(`${slug}\0${template}`, value)
  }

  // The notes of one stage, and of one template's copy when given, taken out of the book.
  function take(slug: string, stage: CallRecord['stage'], template?: string): Note[] {
    const mine = notes.filter(
      (n) =>
        n.slug === slug && n.stage === stage && (template === undefined || n.template === template),
    )
    for (const n of mine) notes.splice(notes.indexOf(n), 1)
    return mine
  }

  return { note, begin, step, take }
}

export const usageOf = ({ parsed: _parsed, raw: _raw, ...call }: Note): CallRecord => call

// One copy call as the fixture record keeps it. An answer that did not parse is the NOT_JSON
// violation, with its text kept; any other is judged as the pipeline judges it.
export function copyAttemptOf(
  note: Note,
  judge: (parsed: unknown) => readonly JudgedViolation[],
): CopyAttempt {
  return {
    step: note.step,
    call: note.attempt,
    parsed: note.parsed,
    ...(note.raw === null ? {} : { raw: note.raw }),
    violations: note.parsed === null ? [NOT_JSON] : judge(note.parsed),
    usage: usageOf(note),
  }
}
