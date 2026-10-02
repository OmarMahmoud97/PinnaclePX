import { candidatesFrom } from '@/lib/images/candidates'

// The shape Pexels returned on 4 September 2026, cut to what the parser reads.
const PHOTO = {
  id: 20860622,
  width: 4000,
  height: 2667,
  url: 'https://www.pexels.com/photo/physiotherapist-with-exercising-man-20860622/',
  photographer: 'Funkcines Terapijos Centras',
  photographer_url: 'https://www.pexels.com/@funkcines-terapijos-centras-927573878',
  avg_color: '#C6C6C4',
  src: {
    original: 'https://images.pexels.com/photos/20860622/pexels-photo-20860622.jpeg',
    large2x: 'https://images.pexels.com/photos/20860622/pexels-photo-20860622.jpeg?w=940',
    medium: 'https://images.pexels.com/photos/20860622/pexels-photo-20860622.jpeg?h=350',
  },
  alt: 'A physiotherapist assists a patient',
}

describe('candidatesFrom', () => {
  it("keeps what the stage needs and the original's size, and nothing else", () => {
    const [candidate] = candidatesFrom({ page: 1, photos: [PHOTO], total_results: 7082 })
    expect(candidate).toEqual({
      id: 20860622,
      alt: 'A physiotherapist assists a patient',
      photographer: 'Funkcines Terapijos Centras',
      photographerUrl: 'https://www.pexels.com/@funkcines-terapijos-centras-927573878',
      thumbnail: 'https://images.pexels.com/photos/20860622/pexels-photo-20860622.jpeg?h=350',
      source: 'https://images.pexels.com/photos/20860622/pexels-photo-20860622.jpeg?w=940',
      width: 4000,
      height: 2667,
    })
  })

  it('keeps each photograph its own size, a portrait as a portrait', () => {
    const portrait = { ...PHOTO, id: 7, width: 3000, height: 4500 }
    expect(
      candidatesFrom({ photos: [PHOTO, portrait] }).map(({ id, width, height }) => ({
        id,
        width,
        height,
      })),
    ).toEqual([
      { id: 20860622, width: 4000, height: 2667 },
      { id: 7, width: 3000, height: 4500 },
    ])
  })

  it('takes a missing alt as empty and rejects a response of the wrong shape', () => {
    expect(candidatesFrom({ photos: [{ ...PHOTO, alt: null }] })[0]?.alt).toBe('')
    expect(() => candidatesFrom({ photos: [{ id: 'x' }] })).toThrow()
    // A photograph without its size is the wrong shape too.
    const { width: _width, ...sizeless } = PHOTO
    expect(() => candidatesFrom({ photos: [sizeless] })).toThrow()
  })
})
