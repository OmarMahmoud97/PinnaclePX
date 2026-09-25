import { describe, expect, it } from 'vitest'
import {
  DESCRIPTORS,
  descriptorOf,
  designLinkName,
  designName,
  layoutOf,
} from '@/lib/preview/descriptors'
import { READY_TEMPLATES, TEMPLATES } from '@/templates/registry'

describe('descriptorOf', () => {
  it('describes every ready template', () => {
    for (const template of READY_TEMPLATES) expect(descriptorOf(template.id)).not.toBeNull()
  })

  it('describes only templates that exist, and never by a code name', () => {
    const ids = new Set<string>(TEMPLATES.map((template) => template.id))
    for (const [id, descriptor] of Object.entries(DESCRIPTORS)) {
      expect(ids.has(id)).toBe(true)
      for (const template of TEMPLATES) expect(descriptor).not.toContain(template.name)
    }
  })

  it('has nothing to say before a template is chosen, or for one without a descriptor', () => {
    expect(descriptorOf(null)).toBeNull()
    expect(descriptorOf('t99-unnamed')).toBeNull()
  })
})

describe('layoutOf', () => {
  it('gives every ready template a layout of its own', () => {
    const layouts = READY_TEMPLATES.map((template) => layoutOf(template.id))
    for (const layout of layouts) expect(layout).not.toBeNull()
    expect(new Set(layouts).size).toBe(layouts.length)
  })

  it('draws a layout only for a template that exists, alongside its words', () => {
    const ids = new Set<string>(TEMPLATES.map((template) => template.id))
    for (const id of Object.keys(DESCRIPTORS)) {
      expect(ids.has(id)).toBe(true)
      expect(layoutOf(id)).not.toBeNull()
    }
    for (const template of TEMPLATES) {
      expect(layoutOf(template.id) === null).toBe(descriptorOf(template.id) === null)
    }
  })

  it('draws nothing before a template is chosen, or for one without an entry', () => {
    expect(layoutOf(null)).toBeNull()
    expect(layoutOf('t99-unnamed')).toBeNull()
  })
})

describe('designName', () => {
  it('names a design by its place in the list, counted from zero', () => {
    expect(designName(0)).toBe('Design one')
    expect(designName(2)).toBe('Design three')
  })
})

describe('designLinkName', () => {
  it('says which design opens, how it looks and that it opens in a new tab', () => {
    expect(designLinkName(0, 't01-aurora')).toBe(
      'Open design one: Glowing centre (opens in a new tab)',
    )
  })

  it('falls back to the place alone', () => {
    expect(designLinkName(1, 't99-unnamed')).toBe('Open design two (opens in a new tab)')
    expect(designLinkName(2, null)).toBe('Open design three (opens in a new tab)')
  })
})
