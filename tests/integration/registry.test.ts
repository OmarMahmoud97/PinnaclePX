import { fallbackBrief } from '@/lib/copy-slots/brief'
import { CONFIG } from '@/lib/config'
import { contractFor, READY_TEMPLATES, TEMPLATES } from '@/templates/registry'

describe('template registry', () => {
  it('has exactly the configured number of templates', () => {
    expect(TEMPLATES).toHaveLength(CONFIG.templates.count)
  })

  it('has unique ids', () => {
    expect(new Set(TEMPLATES.map((t) => t.id)).size).toBe(TEMPLATES.length)
  })

  it('lists Aurora as ready', () => {
    expect(READY_TEMPLATES.map((t) => t.id)).toContain('t01-aurora')
  })

  it.each(READY_TEMPLATES.map((t) => t.id))('%s has a contract whose fallback fits', (id) => {
    const contract = contractFor(id)
    expect(contract.meta.id).toBe(id)
    expect(contract.imageSlots.length).toBeGreaterThan(0)
    expect(contract.contrastPairs.length).toBeGreaterThan(0)
    const brief = fallbackBrief('Kestrel', 'Job scheduling for trades businesses.')
    const copy = contract.fallbackCopy(brief)
    expect(contract.copyViolations(copy)).toEqual([])
    expect(contract.headlineOf(copy).length).toBeGreaterThan(0)
  })

  it('throws for a template without a contract', () => {
    expect(() => contractFor('t02-monolith')).toThrow(/No contract/)
  })
})
