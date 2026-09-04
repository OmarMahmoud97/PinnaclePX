import { type StageRow, statusOf } from '@/lib/preview/status'

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

  it('is ready with a link when select, tokens, copy and imagery have settled, fallback included', () => {
    const status = statusOf({
      ...ROW,
      templateIds: ['t01-aurora'],
      stageSelect: 'done',
      stageTokens: 'done',
      stageBrief: 'running',
      stageCopy: 'fallback',
      stageImagery: 'fallback',
    })
    expect(status.status).toBe('ready')
    if (status.status === 'ready') {
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
