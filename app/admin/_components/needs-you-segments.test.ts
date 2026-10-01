import { segments } from '@/app/admin/_components/needs-you-segments'

const fern = { label: 'Fernbrook Gardens', slug: 'k7m2p9x4w3hd' }
const ash = { label: 'Ashgrove Physio', slug: 'bq4x9w2k7m3p' }

describe('segments', () => {
  it('draws each named company once, as its link, in the sentence', () => {
    expect(segments('Next call: Fernbrook Gardens, Tomorrow 15:00', [fern])).toEqual([
      { text: 'Next call: ' },
      { link: fern },
      { text: ', Tomorrow 15:00' },
    ])
    expect(
      segments('2 calls need an outcome: Fernbrook Gardens, Ashgrove Physio', [fern, ash]),
    ).toEqual([
      { text: '2 calls need an outcome: ' },
      { link: fern },
      { text: ', ' },
      { link: ash },
    ])
  })

  it('leaves a sentence with no links whole, and appends a link the words do not carry', () => {
    expect(segments('Nothing waiting for you.', [])).toEqual([{ text: 'Nothing waiting for you.' }])
    expect(segments('Open theirs.', [fern])).toEqual([
      { text: 'Open theirs.' },
      { text: ' ' },
      { link: fern },
    ])
  })
})
