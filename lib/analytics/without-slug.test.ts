import { describe, expect, it } from 'vitest'
import { withoutSlug } from '@/lib/analytics/without-slug'

describe('withoutSlug', () => {
  it('takes the slug off the done page and keeps the question', () => {
    expect(
      withoutSlug({
        type: 'pageview',
        url: 'https://pinnaclepx.example/start?q=done&s=k7m2p9x4w3hd',
      }),
    ).toEqual({ type: 'pageview', url: 'https://pinnaclepx.example/start?q=done' })
  })

  it('cleans custom events and web vitals the same way', () => {
    expect(
      withoutSlug({ type: 'event', url: 'https://pinnaclepx.example/start?s=abc&q=done' }),
    ).toEqual({ type: 'event', url: 'https://pinnaclepx.example/start?q=done' })
    expect(
      withoutSlug({
        type: 'vital',
        url: 'https://pinnaclepx.example/start?s=abc',
        route: '/start',
      }),
    ).toEqual({ type: 'vital', url: 'https://pinnaclepx.example/start', route: '/start' })
  })

  it('removes every copy of the slug, and keeps the fragment', () => {
    expect(
      withoutSlug({
        type: 'pageview',
        url: 'https://pinnaclepx.example/start?s=a&q=done&s=b#main',
      }),
    ).toEqual({ type: 'pageview', url: 'https://pinnaclepx.example/start?q=done#main' })
  })

  it('puts the route in place of the slug on the hub and on a design', () => {
    expect(
      withoutSlug({ type: 'pageview', url: 'https://pinnaclepx.example/preview/k7m2p9x4w3hd' }),
    ).toEqual({ type: 'pageview', url: 'https://pinnaclepx.example/preview/[slug]' })
    expect(
      withoutSlug({
        type: 'event',
        url: 'https://pinnaclepx.example/preview/k7m2p9x4w3hd/t01-aurora?utm_source=email#top',
      }),
    ).toEqual({
      type: 'event',
      url: 'https://pinnaclepx.example/preview/[slug]/t01-aurora?utm_source=email#top',
    })
  })

  it('cleans a preview path without an origin and keeps it a path', () => {
    expect(
      withoutSlug({
        type: 'vital',
        url: '/preview/k7m2p9x4w3hd/t01-aurora',
        route: '/preview/[slug]/[templateId]',
      }),
    ).toEqual({
      type: 'vital',
      url: '/preview/[slug]/t01-aurora',
      route: '/preview/[slug]/[templateId]',
    })
  })

  it('passes an address without a slug through untouched', () => {
    for (const url of [
      'https://pinnaclepx.example/start?q=2&sort=s',
      'https://pinnaclepx.example/preview',
      'https://pinnaclepx.example/previews/k7m2p9x4w3hd',
    ]) {
      const event = { type: 'pageview', url }
      expect(withoutSlug(event)).toBe(event)
    }
  })

  it('cleans a path without an origin and keeps it a path', () => {
    expect(withoutSlug({ type: 'pageview', url: '/start?q=done&s=abc' })).toEqual({
      type: 'pageview',
      url: '/start?q=done',
    })
  })

  it('drops an event whose address cannot be read', () => {
    expect(withoutSlug({ type: 'pageview', url: 'https://[pinnaclepx/start?s=abc' })).toBeNull()
  })
})
