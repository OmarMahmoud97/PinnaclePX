// The behaviour check (decisions 9 and 15; the check standard's behaviour list in
// docs/template-fit-decisions.md, Part 3), one line per decided behaviour:
//
//   autofill   every form field carries its autocomplete token: email, tel and a person's name
//              their own, any other field a token of some kind (off included)
//   asks       every ask leads to the template's closing block, and the closing button mails the
//              page's address with its label as the subject, or with no email leads to the top
//              or to its own block (Aurora, Monolith, Atlas and Ember decided; the others
//              reported). Each ask is found by the copy path that labels it: the page is drawn
//              with that text replaced by a marker (the dev route's ?probe=), so an ask whose
//              words match another link's is never mistaken for it
//   priority   no picture hidden on a phone is loaded with priority there (Summit's closing one)
//   upright    Ember's grid picture rests upright once the pointer has left it
//   caption    Summit's photo captions' links can be seen when the keyboard reaches them
//   cursor     Vector's cursor disc has opacity 0 under reduced motion
//
// Started from review/verify-templates/a11y-check.cjs and menu-focus.cjs and
// review2/verify-critic-states/vector-cursor.mjs.
//
//   node scripts/checks/behaviour.mjs --base http://localhost:3120 [options in lib/args.mjs]
import { parseArgs } from './lib/args.mjs'
import { inPool, launch, open, withTab } from './lib/browser.mjs'
import { installHelpers } from './lib/in-page.mjs'
import { pagesOf, urlOf } from './lib/pages.mjs'
import { outDir, writeReport } from './lib/report.mjs'

const options = parseArgs(process.argv.slice(2), {
  source: 'corpus',
  kind: 'model',
})
const EMAIL = 'owner@example.com'
const DESKTOP = { width: 1440, height: 900, phone: false }
const PHONE = { width: 390, height: 844, phone: true }

// Each template's asks, by the copy path that labels them, and its closing block and button,
// from its contract's link plan and decision 15. "decided" marks the templates whose asks
// decision 15 changes; the others are reported as they stand. Monolith's block is #cta until its
// pull request renames it #contact (decision 1), so either is its closing block. Atlas's is the
// note at the foot of the page, headed "Get in touch", at a new #contact: its pitch (#start) is
// its third section, so it cannot close the page, and the pitch's button is one more ask.
const ASKS = {
  't01-aurora': {
    decided: true,
    closing: ['start'],
    button: 'cta.action',
    asks: ['nav.cta', 'hero.primary'],
  },
  't02-monolith': {
    decided: true,
    closing: ['contact', 'cta'],
    button: 'cta.primary',
    asks: ['nav.cta', 'hero.primary', 'hero.cards.plan.action', 'faq.link'],
  },
  't03-meridian': {
    decided: false,
    closing: ['community'],
    button: 'community.action',
    asks: ['nav.cta', 'hero.primary'],
  },
  't04-atlas': {
    decided: true,
    closing: ['contact'],
    button: 'footer.action',
    asks: ['nav.cta', 'hero.primary', 'pitch.action', 'offer.action', 'tools.primary'],
  },
  't05-ember': {
    decided: true,
    closing: ['cta'],
    button: 'cta.button',
    asks: ['nav.cta', 'hero.cta', 'timing.cta'],
  },
  't06-harbor': {
    decided: false,
    closing: ['cta'],
    button: 'cta.primary',
    asks: ['nav.cta', 'hero.primary'],
  },
  't07-summit': {
    decided: false,
    closing: ['cta'],
    button: 'cta.button',
    asks: ['nav.cta', 'hero.primary', 'facilities.link'],
  },
  't08-vector': { decided: false, closing: ['contact'], button: 'footer.cta', asks: ['about.cta'] },
}

// The marker the dev route puts in place of the nth probed path's text
// (app/dev/_render/concept.tsx).
const markerOf = (index) => `Probe ${String(index + 1).padStart(2, '0')}`
// Whether a link's words are that marker alone, once or more (a label drawn twice, as a button
// that rolls its label keeps it), with nothing else but marks and arrows.
const carries = (text, marker) =>
  text.includes(marker) && !/[\p{L}\p{N}]/u.test(text.split(marker).join(''))

// In the page: every form field's autocomplete, and every link's text and address.
function readForms() {
  const fields = [...document.querySelectorAll('input, textarea, select')]
    .filter((f) => !['hidden', 'submit', 'button', 'reset'].includes(f.type))
    .map((f) => ({
      field: `${f.tagName.toLowerCase()}${f.name === '' ? '' : `[name=${f.name}]`}${f.type === undefined ? '' : `[type=${f.type}]`}`,
      type: f.type ?? '',
      hint: `${f.name} ${f.id} ${f.getAttribute('aria-label') ?? ''} ${f.labels?.[0]?.textContent ?? ''}`.toLowerCase(),
      autocomplete: f.getAttribute('autocomplete'),
    }))
  // Each link's words, its address, and the ids of the blocks it sits in.
  const links = [...document.querySelectorAll('a[href]')].map((a) => {
    const blocks = []
    for (let n = a.parentElement; n !== null; n = n.parentElement) {
      if (n.id !== '') blocks.push(n.id)
    }
    return {
      text: (a.textContent ?? '').replace(/\s+/g, ' ').trim(),
      href: a.getAttribute('href'),
      blocks,
    }
  })
  return { fields, links }
}

function autofillFindings(fields) {
  return fields.flatMap((f) => {
    const want =
      f.type === 'email' || /e-?mail/.test(f.hint)
        ? ['email']
        : f.type === 'tel' || /phone|tel\b/.test(f.hint)
          ? ['tel']
          : /\bname\b/.test(f.hint) && f.type !== 'textarea'
            ? ['name', 'given-name', 'family-name']
            : null
    if (f.autocomplete === null || f.autocomplete === '')
      return [{ field: f.field, problem: 'no autocomplete' }]
    if (want !== null && !want.includes(f.autocomplete)) {
      return [
        { field: f.field, problem: `autocomplete "${f.autocomplete}", wants ${want.join(' or ')}` },
      ]
    }
    return []
  })
}

// The asks of a page drawn with every ask's text and the button's probed (plan.asks, then
// plan.button, in that order): each ask must lead to the closing block; the button must sit in
// that block and mail the page's address with its label as the subject, or with no email lead
// to the top or to its own block.
function askFindings(page, links, email) {
  const plan = ASKS[page.templateId]
  if (plan === undefined) return []
  const findings = []
  const targets = plan.closing.map((id) => `#${id}`)
  const add = (path, link, problem) =>
    findings.push({ ask: path, href: link?.href ?? null, problem })
  plan.asks.forEach((path, index) => {
    const found = links.filter((l) => carries(l.text, markerOf(index)))
    if (found.length === 0) add(path, null, 'ask not drawn')
    for (const link of found) {
      if (!targets.includes(link.href)) {
        add(path, link, `leads to ${String(link.href)}, not ${targets.join(' or ')}`)
      }
    }
  })
  const marker = markerOf(plan.asks.length)
  const buttons = links.filter((l) => carries(l.text, marker))
  if (buttons.length === 0) add(plan.button, null, 'closing button not drawn')
  for (const link of buttons) {
    if (!plan.closing.some((id) => link.blocks.includes(id))) {
      add(plan.button, link, `closing button outside ${targets.join(' or ')}`)
    }
    if (email === null) {
      if (![...targets, '#top', '#'].includes(link.href)) {
        add(
          plan.button,
          link,
          'with no email, the closing button leads neither to the top nor to its own block',
        )
      }
      continue
    }
    // The subject as encodeURIComponent writes the label (decision 15). A mail link reads no
    // plus sign as a space (RFC 6068), so a label written with plus signs arrives with them.
    const mail = /^mailto:([^?]+)\?subject=(.*)$/.exec(link.href ?? '')
    if (mail === null || mail[1] !== email || mail[2] !== encodeURIComponent(marker)) {
      add(
        plan.button,
        link,
        'the closing button is not a mail to the page with its label as the subject',
      )
    }
  }
  return findings.map((f) => ({ ...f, decided: plan.decided }))
}

// In the page, at a phone's width: pictures loaded with priority that a phone does not show.
function hiddenPriority() {
  const preloads = [...document.querySelectorAll('link[rel="preload"][as="image"]')].map(
    (l) => `${l.getAttribute('href') ?? ''} ${l.getAttribute('imagesrcset') ?? ''}`,
  )
  return [...document.querySelectorAll('img')]
    .filter((img) => {
      const shown =
        img.getClientRects().length > 0 && getComputedStyle(img).visibility === 'visible'
      const r = img.getBoundingClientRect()
      return !shown || r.width < 1 || r.height < 1
    })
    .filter((img) => {
      const source = img.getAttribute('src') ?? ''
      return (
        img.getAttribute('fetchpriority') === 'high' ||
        preloads.some((p) => source !== '' && p.includes(source.split('&')[0]))
      )
    })
    .map((img) => decodeURIComponent(img.getAttribute('src') ?? '').slice(0, 90))
}

// Ember: the angle each grid picture rests at once the pointer has been over it and left.
async function upright(tab) {
  const spins = tab.locator('.ember-spin')
  const count = await spins.count()
  const angles = []
  for (let i = 0; i < count; i += 1) {
    const spin = spins.nth(i)
    await spin.scrollIntoViewIfNeeded()
    const box = await spin.boundingBox()
    if (box === null) continue
    await tab.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await tab.waitForTimeout(150)
    await tab.mouse.move(1, 1)
    await tab.waitForTimeout(1500)
    // The turn may be a transform or the rotate property (Ember's is rotate, ember.css).
    const angle = await spin.evaluate((el) => {
      const cs = getComputedStyle(el)
      const m = new DOMMatrixReadOnly(cs.transform === 'none' ? undefined : cs.transform)
      const byMatrix = (Math.atan2(m.b, m.a) * 180) / Math.PI
      const last = cs.rotate === 'none' ? '0deg' : cs.rotate.split(' ').at(-1)
      const value = parseFloat(last)
      const byRotate = last.endsWith('turn')
        ? value * 360
        : last.endsWith('rad')
          ? (value * 180) / Math.PI
          : value
      return Math.round((((byMatrix + byRotate) % 360) + 360) % 360)
    })
    angles.push(angle)
  }
  return angles
}

// Summit: each photo caption's link, reached by the keyboard, and how visible it is then.
async function captions(tab) {
  const reached = []
  for (let i = 0; i < 120; i += 1) {
    await tab.keyboard.press('Tab')
    const here = await tab.evaluate(() => {
      const a = document.activeElement
      if (a === null || a.tagName !== 'A' || a.hasAttribute('data-check-reached')) return null
      // The photo cell the link's caption sits in: its nearest box holding a photo.
      let cell = a.parentElement
      while (cell !== null && cell.querySelector('img[src*="-facility-"]') === null) {
        cell = cell.parentElement
      }
      if (cell === null || cell === document.body) return null
      a.setAttribute('data-check-reached', '')
      return {
        text: (a.textContent ?? '').trim().slice(0, 30),
        opacity: window.__checks.opacityOf(a),
      }
    })
    if (here !== null) reached.push(here)
  }
  return reached
}

async function check(browser, page) {
  const findings = []
  const add = (kind, detail) =>
    findings.push({ templateId: page.templateId, page: page.label, kind, ...detail })
  // The desktop page with the page's email, then without one, every ask's text probed.
  const plan = ASKS[page.templateId]
  const probe = plan === undefined ? null : [...plan.asks, plan.button].join(',')
  for (const email of [EMAIL, null]) {
    await withTab(browser, DESKTOP, async (tab) => {
      await open(tab, urlOf(options.base, page, { pictures: 'grey', email, probe }))
      const { fields, links } = await tab.evaluate(readForms)
      if (email !== null) for (const f of autofillFindings(fields)) add('autofill', f)
      for (const f of askFindings(page, links, email)) add('asks', { email: email !== null, ...f })
    })
  }
  // At a phone's width: priority pictures it does not show, and Vector's disc.
  await withTab(browser, PHONE, async (tab) => {
    await open(tab, urlOf(options.base, page, { pictures: 'grey' }))
    for (const source of await tab.evaluate(hiddenPriority)) add('priority', { picture: source })
    if (page.templateId === 't08-vector') {
      const opacity = await tab.evaluate(() => {
        const disc = document.querySelector('.vector-cursor')
        return disc === null ? null : Number(getComputedStyle(disc).opacity)
      })
      if (opacity !== 0) add('cursor', { size: '390x844', opacity })
    }
  })
  if (page.templateId === 't08-vector') {
    await withTab(browser, DESKTOP, async (desk) => {
      await open(desk, urlOf(options.base, page, {}))
      const opacity = await desk.evaluate(() => {
        const disc = document.querySelector('.vector-cursor')
        return disc === null ? null : Number(getComputedStyle(disc).opacity)
      })
      if (opacity !== 0) add('cursor', { size: '1440x900', opacity })
    })
  }
  if (page.templateId === 't05-ember') {
    // The turn runs only with motion allowed, as a visitor with a pointer gets it.
    await withTab(
      browser,
      DESKTOP,
      async (desk) => {
        await open(desk, urlOf(options.base, page, { pictures: 'grey' }))
        const angles = await upright(desk)
        if (angles.length === 0) {
          add('upright', { problem: 'no turning picture found (.ember-spin)' })
        }
        for (const angle of angles.filter((a) => a % 360 !== 0)) add('upright', { angle })
      },
      { reducedMotion: 'no-preference' },
    )
  }
  if (page.templateId === 't07-summit') {
    await withTab(browser, DESKTOP, async (desk) => {
      await open(desk, urlOf(options.base, page, { pictures: 'grey' }))
      await desk.evaluate(installHelpers)
      const reached = await captions(desk)
      if (reached.length === 0) {
        add('caption', { problem: 'no caption link reached by the keyboard' })
      }
      for (const link of reached.filter((r) => r.opacity < 0.9)) add('caption', link)
    })
  }
  return findings
}

const pages = pagesOf(options)
const browser = await launch()
const results = (
  await inPool(pages, Number(options.rest.jobs ?? 3), (page) => check(browser, page))
).flat()
await browser.close()

const lines = [`Behaviour: ${String(pages.length)} pages (${options.source}).`]
for (const templateId of [...new Set(pages.map((p) => p.templateId))].sort()) {
  const total = pages.filter((p) => p.templateId === templateId).length
  const mine = results.filter((r) => r.templateId === templateId)
  const parts = ['autofill', 'asks', 'priority', 'upright', 'caption', 'cursor'].map((kind) => {
    const of = mine.filter((r) => r.kind === kind)
    if (of.length === 0) return null
    const examples = [
      ...new Set(
        of.map((r) =>
          kind === 'asks'
            ? `${r.ask}${r.email ? '' : ' (no email)'}: ${r.problem}`
            : (r.problem ?? r.field ?? r.picture ?? `${String(r.angle ?? r.opacity)}`),
        ),
      ),
    ].slice(0, kind === 'asks' ? 4 : 2)
    return `${kind}: ${String(new Set(of.map((r) => r.page)).size)}/${String(total)} pages (${examples.join('; ')})`
  })
  const said = parts.filter((p) => p !== null)
  lines.push(
    `${templateId} (${String(total)} pages): ${said.length === 0 ? 'all pass' : said.join(' | ')}${ASKS[templateId]?.decided === false ? ' [asks reported, not decided]' : ''}`,
  )
}
writeReport(outDir(options, 'behaviour'), results, lines)
