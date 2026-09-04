import { looksLikeSvg, unsafeSvgReason } from '@/lib/logo/svg'

const svg = (inner: string) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg">${inner}</svg>`)

describe('looksLikeSvg', () => {
  it.each([
    '<svg xmlns="http://www.w3.org/2000/svg"/>',
    '<?xml version="1.0"?><svg/>',
    '\uFEFF  <!-- a mark -->\n<svg/>',
    '<!DOCTYPE svg><svg/>',
  ])('recognises %j', (text) => {
    expect(looksLikeSvg(Buffer.from(text))).toBe(true)
  })

  it('leaves a raster alone', () => {
    expect(looksLikeSvg(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(false)
    expect(looksLikeSvg(Buffer.from('<html><body>not an svg</body></html>'))).toBe(false)
  })
})

describe('unsafeSvgReason', () => {
  it('passes a plain mark, with the namespace and an internal reference', () => {
    expect(
      unsafeSvgReason(
        svg('<defs><linearGradient id="g"/></defs><rect fill="url(#g)"/><use href="#g"/>'),
      ),
    ).toBeNull()
  })

  it.each([
    [svg('<script>alert(1)</script>'), 'a script'],
    [svg('<a href="javascript:alert(1)"><rect/></a>'), 'a script'],
    [svg('<image xlink:href="https://example.com/x.png"/>'), 'an external reference'],
    [svg("<image href='http://example.com/x.png'/>"), 'an external reference'],
    [svg('<image href="file:///etc/passwd"/>'), 'an external reference'],
    [svg('<image href="//example.com/x.png"/>'), 'an external reference'],
    [
      Buffer.from('<!DOCTYPE svg [<!ENTITY x SYSTEM "file:///etc/passwd">]><svg>&x;</svg>'),
      'an entity declaration',
    ],
    [
      Buffer.from('<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://x/svg11.dtd"><svg/>'),
      'an external document type',
    ],
    [svg('<xi:include href="x.svg" xmlns:xi="http://www.w3.org/2001/XInclude"/>'), 'an include'],
  ])('refuses %s', (bytes, reason) => {
    expect(unsafeSvgReason(bytes)).toBe(reason)
  })
})
