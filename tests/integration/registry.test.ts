import { CONFIG } from '@/lib/config'
import { TEMPLATES } from '@/templates/registry'

describe('template registry', () => {
  it('has exactly the configured number of templates', () => {
    expect(TEMPLATES).toHaveLength(CONFIG.templates.count)
  })

  it('has unique ids', () => {
    expect(new Set(TEMPLATES.map((t) => t.id)).size).toBe(TEMPLATES.length)
  })
})
