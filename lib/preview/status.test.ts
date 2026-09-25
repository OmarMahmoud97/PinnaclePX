import type { SlotImage } from '@/lib/copy-slots/assets'
import { fallbackBrief } from '@/lib/copy-slots/brief'
import { type StageRow, statusOf, type ViewRow, viewOf } from '@/lib/preview/status'
import { contractFor } from '@/templates/registry'

const ROW: StageRow = {
  slug: 'abcdefghjkmn',
  deadlineAt: new Date('2026-09-04T12:05:00Z'),
  conceptCount: 1,
  templateIds: null,
  stageSelect: 'pending',
  stageTokens: 'pending',
  stageBrief: 'pending',
  stageCopy: 'pending',
  stageImagery: 'pending',
}

describe('statusOf', () => {
  it('is building with unnamed slots before select lands', () => {
    const status = statusOf(ROW)
    expect(status.status).toBe('building')
    if (status.status === 'building') {
      expect(status.deadlineAt).toBe('2026-09-04T12:05:00.000Z')
      expect(status.concepts).toEqual([{ templateId: null, name: null, ready: false, href: null }])
    }
  })

  it('names the template once select lands and stays building until the rest settle', () => {
    const status = statusOf({ ...ROW, templateIds: ['t01-aurora'], stageSelect: 'done' })
    expect(status.status).toBe('building')
    if (status.status === 'building') {
      expect(status.concepts[0]).toEqual({
        templateId: 't01-aurora',
        name: 'Aurora',
        ready: false,
        href: null,
      })
    }
  })

  it('is ready with a link only when select, tokens, copy and imagery all finished', () => {
    const status = statusOf({
      ...ROW,
      templateIds: ['t01-aurora'],
      stageSelect: 'done',
      stageTokens: 'done',
      stageBrief: 'running',
      stageCopy: 'done',
      stageImagery: 'done',
    })
    expect(status.status).toBe('ready')
    if (status.status === 'ready') {
      expect(status.concepts[0]?.href).toBe('/preview/abcdefghjkmn/t01-aurora')
    }
  })

  it('is partial, still with a link, when the sweeper settled a stage with the fallback', () => {
    const status = statusOf({
      ...ROW,
      templateIds: ['t01-aurora'],
      stageSelect: 'done',
      stageTokens: 'done',
      stageBrief: 'fallback',
      stageCopy: 'fallback',
      stageImagery: 'done',
    })
    expect(status.status).toBe('partial')
    if (status.status === 'partial') {
      expect(status.concepts[0]?.href).toBe('/preview/abcdefghjkmn/t01-aurora')
    }
  })

  it('is exhausted when select chose nothing', () => {
    expect(statusOf({ ...ROW, templateIds: [], stageSelect: 'done' }).status).toBe('exhausted')
  })

  it('is failed when a stage with no fallback failed', () => {
    expect(statusOf({ ...ROW, stageSelect: 'failed' }).status).toBe('failed')
    expect(statusOf({ ...ROW, stageTokens: 'failed' }).status).toBe('failed')
  })
})

// A row as the poll reads it, the brief two minutes in, every stage settled.
const CREATED = new Date('2026-09-04T12:00:00Z')
const seconds = (count: number) => new Date(CREATED.getTime() + count * 1000)
const AURORA_COPY = contractFor('t01-aurora').fallbackCopy(
  fallbackBrief('Ashgrove Physio', 'Physiotherapy clinic in Sheffield. Sports injuries and rehab.'),
)
const PHOTO: SlotImage = {
  src: 'https://store.public.blob.vercel-storage.com/photos/clinic.jpg',
  alt: 'A treatment room',
  width: 1920,
  height: 1280,
  credit: { photographer: 'Ana Ruiz', url: 'https://www.pexels.com/@ana-ruiz' },
}
const VIEW_ROW: ViewRow = {
  ...ROW,
  createdAt: CREATED,
  templateIds: ['t01-aurora'],
  stageSelect: 'done',
  stageTokens: 'done',
  stageBrief: 'done',
  stageCopy: 'done',
  stageImagery: 'done',
  stageSelectAt: seconds(6.9),
  stageTokensAt: seconds(7),
  stageBriefAt: seconds(21),
  stageCopyAt: seconds(58),
  stageImageryAt: seconds(64),
  settledAt: seconds(64.5),
  paletteId: 'forest',
  fill: '#2f6f4e',
  copy: { 't01-aurora': AURORA_COPY },
  posterPhotos: { 't01-aurora': PHOTO },
}

describe('viewOf', () => {
  it('stamps each settled stage in whole seconds from the brief, and the build as a whole', () => {
    const view = viewOf(VIEW_ROW)
    expect(view.stages.select).toEqual({ state: 'done', atS: 6 })
    expect(view.stages.imagery).toEqual({ state: 'done', atS: 64 })
    expect(view.settledS).toBe(64)
  })

  it('shows no time for a stage still open, nor for a row older than the stage times', () => {
    const open = viewOf({ ...VIEW_ROW, stageCopy: 'running', stageCopyAt: null, settledAt: null })
    expect(open.stages.copy).toEqual({ state: 'running', atS: null })
    expect(open.settledS).toBeNull()
    const old = viewOf({ ...VIEW_ROW, stageSelectAt: null, settledAt: null })
    expect(old.stages.select).toEqual({ state: 'done', atS: null })
  })

  it('names the palette and carries the fill the designs are painted in', () => {
    expect(viewOf(VIEW_ROW).palette).toEqual({ label: 'Forest', hex: '#2f6f4e' })
    expect(viewOf({ ...VIEW_ROW, paletteId: null }).palette).toEqual({
      label: null,
      hex: '#2f6f4e',
    })
    expect(viewOf({ ...VIEW_ROW, fill: null }).palette).toBeNull()
  })

  it('gives each design its headline and photo once their stages have settled', () => {
    const [concept] = viewOf(VIEW_ROW).concepts
    expect(concept?.headline).toBe(contractFor('t01-aurora').headlineOf(AURORA_COPY))
    expect(concept?.photo).toEqual({ src: PHOTO.src, credit: PHOTO.credit })
    const fellBack = viewOf({ ...VIEW_ROW, stageCopy: 'fallback', stageImagery: 'fallback' })
    expect(fellBack.concepts[0]?.headline).not.toBeNull()
    expect(fellBack.concepts[0]?.photo).not.toBeNull()
  })

  // The imagery stage keeps what it has filled on the row while it tries again for the rest, and
  // a spot the pipeline has not yet judged must never be drawn.
  it('holds a headline or a photo back while its stage is still running', () => {
    const running = viewOf({ ...VIEW_ROW, stageCopy: 'running', stageImagery: 'running' })
    expect(running.concepts[0]).toMatchObject({ headline: null, photo: null })
  })

  it('leaves a plain slot plain, and never fails over copy its template cannot read', () => {
    const plain = viewOf({ ...VIEW_ROW, posterPhotos: { 't01-aurora': null } })
    expect(plain.concepts[0]?.photo).toBeNull()
    const unreadable = viewOf({ ...VIEW_ROW, copy: { 't01-aurora': { hero: {} } } })
    expect(unreadable.concepts[0]?.headline).toBeNull()
  })

  it('reports a failed build with its stages and no designs', () => {
    const view = viewOf({ ...VIEW_ROW, stageSelect: 'failed', templateIds: null })
    expect(view.status).toBe('failed')
    expect(view.concepts).toEqual([])
    expect(view.stages.select.state).toBe('failed')
  })

  // The poll is asked every few seconds by every open done page and hub (plan 8.2).
  it('stays under 2 KB with three designs at their longest', () => {
    const ids = ['t01-aurora', 't02-monolith', 't03-meridian']
    const headline = 'H'.repeat(72)
    const long: SlotImage = {
      ...PHOTO,
      src: `https://abcdefghijklmnop.public.blob.vercel-storage.com/photos/${'p'.repeat(96)}.jpg`,
      credit: { photographer: 'P'.repeat(48), url: `https://www.pexels.com/@${'u'.repeat(48)}` },
    }
    const view = viewOf({
      ...VIEW_ROW,
      conceptCount: 3,
      templateIds: ids,
      paletteId: null,
      copy: Object.fromEntries(ids.map((id) => [id, {}])),
      posterPhotos: Object.fromEntries(ids.map((id) => [id, long])),
    })
    const longest = {
      ...view,
      concepts: view.concepts.map((concept) => ({ ...concept, headline })),
    }
    expect(new TextEncoder().encode(JSON.stringify(longest)).length).toBeLessThan(2048)
  })
})
