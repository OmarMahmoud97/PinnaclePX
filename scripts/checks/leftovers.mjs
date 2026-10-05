// Leftovers on the rendered page (decisions 1 and 9; docs/template-fit-plan.md's fix list).
// A leftover is something of the source's own business that reads wrong for a visitor's.
//
//   drawn     each copy-free leftover decision 1 fixes, found by its element: after its
//             template's pull request, none may be drawn at 390 or at 1440
//   address   each renamed address and form field name: the old one must be gone
//   words     each copy-dependent leftover, by the text patterns of the Phase 1 scorecard
//             (review/outcome/scorecard.cjs), found in the page's visible text, so a leftover
//             a template stops drawing stops counting (Harbor's news field and small print)
//   echo      a guide's "such as" example, or a word of a copy key, found word for word in the
//             stored copy (the brief's line 90: the copy model copies a guide's examples)
//
//   node scripts/checks/leftovers.mjs --base http://localhost:3120 [options in lib/args.mjs]
import { parseArgs } from './lib/args.mjs'
import { contextFor, inPool, launch, open } from './lib/browser.mjs'
import { pagesOf, urlOf } from './lib/pages.mjs'
import { outDir, tally, writeReport } from './lib/report.mjs'

const options = parseArgs(process.argv.slice(2), {
  source: 'corpus',
  kind: 'model',
  widths: '390x844,1440x900',
})

// Decision 1's copy-free leftovers, by the element that draws each. A selector, or the text of
// an element (equals), or a name a screen reader is given (label).
const DRAWN = {
  't01-aurora': [
    // The window's row of three, not the wordmark's single point (sections/logo.tsx).
    [
      't01-L1',
      'window dots',
      'div:has(> span.size-2\\.5.rounded-full + span.size-2\\.5.rounded-full) > span.size-2\\.5.rounded-full',
    ],
    ['t01-L2', 'progress bars', 'span.h-1\\.5.w-12.rounded-full'],
    ['t01-L3', 'row dots, the first in brand colour', 'li > span.size-2.shrink-0.rounded-full'],
    ['t01-L4', 'title bar with its spacer', 'span.w-12:empty'],
    ['t01-L5', 'rail entry styled as selected', 'aside li.rounded-lg'],
    ['t01-L6', 'rows with on and off toggles', 'span.h-5.w-9.rounded-full'],
  ],
  't02-monolith': [
    ['t02-L1', 'panels mark beside the name', 'svg.lucide-panels-top-left'],
    [
      't02-L2',
      'light bulb on the offering card',
      '.drop-shadow-xl .rounded-2xl > svg:not(.lucide)',
    ],
    ['t02-L3', 'radar beside each label', 'svg.lucide-radar'],
    ['t02-L4', 'medal, map, plane and gift on the steps', '#how-it-works h3 svg'],
    [
      't02-L5',
      'chart, wallet and magnifier on the services',
      '#services .rounded-2xl > svg:not(.lucide)',
    ],
    ['t02-L6', '"Free Icons" titles', { selector: 'svg title', equals: 'Free Icons' }],
    ['t02-L7', '"Menu Icon"', { label: 'Menu Icon' }],
  ],
  't03-meridian': [
    [
      't03-L1',
      'crown, vegan, ghost and other label icons',
      'svg.lucide-crown, svg.lucide-vegan, svg.lucide-ghost, svg.lucide-puzzle, svg.lucide-squirrel, svg.lucide-cookie, svg.lucide-drama',
    ],
    [
      't03-L2',
      'benefit icons',
      'svg.lucide-blocks, svg.lucide-chart-line, svg.lucide-wallet, svg.lucide-sparkle',
    ],
    [
      't03-L3',
      'feature icons',
      'svg.lucide-tablet-smartphone, svg.lucide-badge-check, svg.lucide-goal, svg.lucide-picture-in-picture, svg.lucide-mouse-pointer-click, svg.lucide-newspaper',
    ],
    [
      't03-L4',
      'building, phone and envelope on the steps',
      '#contact svg.lucide-building-2, #contact svg.lucide-phone, #contact svg.lucide-mail',
    ],
    [
      't03-L7',
      'a stranger’s name and address as placeholders',
      '[placeholder="Leopoldo"], [placeholder="Miranda"], [placeholder="leomirandadev@gmail.com"]',
    ],
  ],
  't04-atlas': [
    ['t04-L3', '"More" link by a card that holds words', 'a[href="#why"][aria-label*=": "]'],
  ],
  't05-ember': [
    [
      't05-L1',
      'chef’s hat, leaf and heart',
      'svg.lucide-chef-hat, svg.lucide-leaf, svg.lucide-heart',
    ],
  ],
  't06-harbor': [
    [
      't06-L1',
      'dumbbell and other card icons',
      '#services svg.lucide-dumbbell, #services svg.lucide-zap, #services svg.lucide-brain, #services svg.lucide-heart, #services svg.lucide-timer, #services svg.lucide-trophy',
    ],
    ['t06-L2', 'bolt in the hero pill', '#hero svg.lucide-zap'],
    [
      't06-L4',
      'a stranger’s name and address as placeholders',
      '[placeholder="John Doe"], [placeholder="john@example.com"]',
    ],
  ],
  't07-summit': [
    [
      't07-L1',
      'medical icons on the reasons',
      'svg.lucide-stethoscope, svg.lucide-heart-pulse, svg.lucide-hospital, svg.lucide-ambulance',
    ],
    [
      't07-L2',
      'step icons',
      'svg.lucide-search, svg.lucide-calendar, svg.lucide-clipboard-check, svg.lucide-heart-handshake',
    ],
  ],
  't08-vector': [],
}

// Decision 1's renamed addresses and field names: none may remain as an id, a link or a name.
const ADDRESSES = {
  't02-monolith': [['t02-L9', 'cta']],
  't04-atlas': [['t04-L1', 'tools']],
  't05-ember': [
    ['t05-L3', 'dishes'],
    ['t05-L3', 'timing'],
    ['t05-L3', 'booking-process'],
  ],
  't06-harbor': [['t06-L6', 'metrics']],
  't07-summit': [
    ['t07-L3', 'booking-process'],
    ['t07-L3', 'book-appointment'],
    ['t07-L4', 'facilities'],
  ],
  't08-vector': [['t08-L5', 'projects']],
}
const FIELDS = {
  't07-summit': [
    ['t07-L5', 'doctor'],
    ['t07-L6', 'department'],
  ],
}

// The scorecard's copy-dependent leftovers, by their words on the page.
const WORDS = {
  't02-monolith': [['t02-L10', /why we started/i]],
  't04-atlas': [['t04-L1', /our tools|tools we use/i]],
  't05-ember': [
    ['t05-L6', /find us/i],
    ['t05-L7', /made with care/i],
  ],
  't06-harbor': [
    ['t06-L7', /figures/i],
    ['t06-L12', /hear from us/i],
    ['t06-L13', /privacy/i],
  ],
  't08-vector': [
    ['t08-L2', /\bwork\b/i, 'a'],
    [
      't08-L4',
      /\bselected\b|\bwork\b/i,
      '#projects .whitespace-nowrap, #featured .whitespace-nowrap',
    ],
  ],
}

// Copy keys whose words say nothing of a trade, left out of the echo check.
const PLAIN_KEYS = new Set(
  'first last brand name legal nav links link cta hero headline subhead primary secondary stats value label labels about eyebrow heading lines emphasis paragraphs paragraph tags tag services service items item title body more lead description contact faq question answer form email message placeholder button footer newsletter columns column note small print target text action steps step features feature benefits benefit cards card highlights highlight why list menu image badge rows row frame rail status intro reassurance quote watermark name names glance pitch statement subtitle accent kicker caption links span group groups marquee proof social reasons reason count up down detail details more secondary tertiary closing ask top home'.split(
    ' ',
  ),
)

const keyWords = (keys) =>
  [
    ...new Set(
      keys
        .flatMap((k) => k.replace(/\[\]/g, '').split(/[.\s]/))
        .flatMap((k) => k.split(/(?=[A-Z])|-/))
        .map((w) => w.toLowerCase()),
    ),
  ].filter((w) => w.length >= 4 && !PLAIN_KEYS.has(w))

// The copy's strings a visitor may read. A link's target (the id of the block it leads to, such
// as footer.navigation[].target) and a link's address are names the page uses, never words it
// shows, so the echo check leaves them out: a target named after a copy key or a guide example
// ("services") is not the copy model copying it.
const UNREAD = new Set(['target', 'href'])
function stringsIn(value, out = []) {
  if (typeof value === 'string') out.push(value)
  else if (Array.isArray(value)) for (const v of value) stringsIn(v, out)
  else if (value !== null && typeof value === 'object')
    for (const [key, v] of Object.entries(value)) if (!UNREAD.has(key)) stringsIn(v, out)
  return out
}

const escape = (text) => text.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')

// In the page: which of the drawn leftovers, addresses and words are present now.
function find({ drawn, addresses, fields, words }) {
  const visible = (el) =>
    el.getClientRects().length > 0 && getComputedStyle(el).visibility === 'visible'
  const found = []
  for (const [id, what, test] of drawn) {
    let els = []
    if (typeof test === 'string') els = [...document.querySelectorAll(test)]
    else if (test.selector !== undefined)
      els = [...document.querySelectorAll(test.selector)].filter(
        (e) => e.textContent.trim() === test.equals,
      )
    else
      els = [...document.querySelectorAll('[aria-label], .sr-only, title')].filter(
        (e) => (e.getAttribute('aria-label') ?? e.textContent).trim() === test.label,
      )
    if (els.length > 0)
      found.push({ kind: 'drawn', id, what, count: els.length, shown: els.filter(visible).length })
  }
  for (const [id, address] of addresses) {
    const element = document.getElementById(address) !== null
    const links = document.querySelectorAll(`a[href="#${address}"]`).length
    if (element || links > 0)
      found.push({ kind: 'address', id, what: `#${address}`, count: links + (element ? 1 : 0) })
  }
  for (const [id, name] of fields) {
    const named = document.querySelectorAll(`[name="${name}"]`).length
    if (named > 0) found.push({ kind: 'address', id, what: `field ${name}`, count: named })
  }
  for (const [id, source, flags, within] of words) {
    const pattern = new RegExp(source, flags)
    const scopes = within === undefined ? [document.body] : [...document.querySelectorAll(within)]
    const text = scopes.map((s) => s.innerText ?? '').join('\n')
    const m = pattern.exec(text)
    if (m !== null) found.push({ kind: 'words', id, what: m[0] })
  }
  return found
}

const all = pagesOf(options)
const contracts = new Map()
for (const templateId of new Set(all.map((p) => p.templateId))) {
  const response = await fetch(`${options.base}/dev/contract/${templateId}`)
  if (!response.ok) throw new Error(`/dev/contract/${templateId}: ${String(response.status)}`)
  contracts.set(templateId, await response.json())
}
const browser = await launch()
const results = await inPool(all, 3, async (page) => {
  const findings = []
  const args = {
    drawn: DRAWN[page.templateId] ?? [],
    addresses: ADDRESSES[page.templateId] ?? [],
    fields: FIELDS[page.templateId] ?? [],
    words: (WORDS[page.templateId] ?? []).map(([id, re, within]) => [
      id,
      re.source,
      re.flags,
      within,
    ]),
  }
  for (const viewport of options.sizes) {
    const context = await contextFor(browser, viewport)
    try {
      const tab = await context.newPage()
      await open(tab, urlOf(options.base, page, { pictures: 'grey' }))
      for (const f of await tab.evaluate(find, args)) findings.push({ ...f, size: viewport.size })
    } finally {
      await context.close().catch(() => undefined)
    }
  }
  // Vector's name set in lower case where the visitor's is not (t08-L3): the source set its own
  // so, and its guide asks for it.
  const name = page.copy?.brand?.name
  if (
    page.templateId === 't08-vector' &&
    typeof name === 'string' &&
    name === name.toLowerCase() &&
    page.answers.company !== page.answers.company.toLowerCase()
  ) {
    findings.push({ kind: 'words', id: 't08-L3', what: name, size: 'copy' })
  }
  // The guide's examples and the copy keys' words, word for word in the stored copy.
  const contract = contracts.get(page.templateId)
  const copy = stringsIn(page.copy).join('\n')
  const examples = [...contract.guide.matchAll(/such as ([^,;.)\n]+)/gi)].map((m) => m[1].trim())
  for (const example of new Set(examples)) {
    if (new RegExp(`(^|[^\\p{L}])${escape(example)}($|[^\\p{L}])`, 'iu').test(copy)) {
      findings.push({ kind: 'echo', id: 'example', what: example })
    }
  }
  for (const word of keyWords(contract.keys)) {
    if (new RegExp(`\\b${escape(word)}\\b`, 'i').test(copy))
      findings.push({ kind: 'echo', id: 'key', what: word })
  }
  return { templateId: page.templateId, page: page.label, findings }
})
await browser.close()

const lines = [
  `Leftovers: ${String(all.length)} pages (${options.source}), drawn at ${options.sizes.map((s) => s.size).join(' and ')}.`,
]
for (const templateId of [...new Set(results.map((r) => r.templateId))].sort()) {
  const mine = results.filter((r) => r.templateId === templateId)
  const pages = (filter) =>
    new Set(mine.filter((r) => r.findings.some(filter)).map((r) => r.page)).size
  const of = (kind) =>
    mine.flatMap((r) =>
      r.findings.filter((f) => f.kind === kind).map((f) => ({ ...f, page: r.page })),
    )
  const perPage = (list) =>
    tally(list, (f) => `${f.id} ${f.what}`)
      .map(
        ([k]) =>
          `${k} (${String(new Set(list.filter((f) => `${f.id} ${f.what}` === k).map((f) => f.page)).size)})`,
      )
      .slice(0, 8)
      .join('; ')
  const drawn390 = of('drawn').filter((f) => f.size.startsWith('390') && f.shown > 0)
  lines.push(
    `\n${templateId} (${String(mine.length)} pages): ${String(pages((f) => f.kind !== 'echo'))} pages with a leftover`,
  )
  if (of('drawn').length > 0)
    lines.push(
      `  drawn (pages): ${perPage(of('drawn').filter((f) => f.size.startsWith('1440')))}; shown at 390 on ${String(new Set(drawn390.map((f) => f.page)).size)} pages`,
    )
  if (of('address').length > 0)
    lines.push(
      `  address (pages): ${perPage(of('address').filter((f) => f.size.startsWith('1440')))}`,
    )
  if (of('words').length > 0)
    lines.push(`  words (pages): ${perPage(of('words').filter((f) => f.size.startsWith('1440')))}`)
  if (of('echo').length > 0) lines.push(`  echo (pages): ${perPage(of('echo'))}`)
}
writeReport(outDir(options, 'leftovers'), results, lines)
