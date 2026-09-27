import { describe, expect, it } from 'vitest'
import { oneLine, subjectLine } from '@/lib/contact/subject'

// Every C0 control character, U+0000 to U+001F, and DEL.
const CONTROLS = [...Array.from({ length: 32 }, (_, code) => code), 0x7f].map((code) =>
  String.fromCharCode(code),
)

// Every direction override and isolate: U+202A to U+202E, then U+2066 to U+2069.
const DIRECTIONS = [0x202a, 0x202b, 0x202c, 0x202d, 0x202e, 0x2066, 0x2067, 0x2068, 0x2069].map(
  (code) => String.fromCharCode(code),
)

describe('oneLine', () => {
  it('makes a line break a space, so the text cannot start a line of its own', () => {
    expect(oneLine('Sam\r\nPatel')).toBe('Sam Patel')
    expect(oneLine(' Sam\n\nPatel ')).toBe('Sam Patel')
  })

  // U+202E would show "Sam ftp.exe" as "Sam exe.ptf", and the owner would read the wrong words.
  it('makes every direction override or isolate a space', () => {
    expect(oneLine('Sam ‮exe.ptf')).toBe('Sam exe.ptf')
    for (const direction of DIRECTIONS) {
      expect(oneLine(`Sam${direction}Patel`)).toBe('Sam Patel')
    }
  })

  it('leaves the letters of any script as they are', () => {
    expect(oneLine('سام پاتل')).toBe('سام پاتل')
    expect(oneLine('Zoë Ōkubo')).toBe('Zoë Ōkubo')
  })
})

describe('subjectLine', () => {
  it('names the sender', () => {
    expect(subjectLine('Sam Patel')).toBe('Message from Sam Patel')
  })

  it('trims the name and closes up the space inside it', () => {
    expect(subjectLine('  Sam    Patel ')).toBe('Message from Sam Patel')
  })

  it('turns a line break into a space, so a name cannot add a header of its own', () => {
    expect(subjectLine('Sam\r\nBcc: someone@example.com')).toBe(
      'Message from Sam Bcc: someone@example.com',
    )
    expect(subjectLine('Sam\nPatel')).toBe('Message from Sam Patel')
    expect(subjectLine('Sam\tPatel')).toBe('Message from Sam Patel')
  })

  it('turns every other control character into a space', () => {
    for (const control of CONTROLS) {
      expect(subjectLine(`Sam${control}Patel`)).toBe('Message from Sam Patel')
    }
  })

  it('turns a direction override into a space', () => {
    expect(subjectLine('Sam‮Patel')).toBe('Message from Sam Patel')
  })

  it('reads as "you" for a name left empty', () => {
    expect(subjectLine('')).toBe('Message from you')
    expect(subjectLine('  ')).toBe('Message from you')
    expect(subjectLine('\r\n\t\u0000')).toBe('Message from you')
  })
})
