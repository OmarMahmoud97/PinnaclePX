export type DemoItem = Readonly<{
  id: string
  label: string
  image: Readonly<{ src: string; alt: string }>
}>

// Placeholder imagery until real product screenshots land in public/.
const PLACEHOLDER_SRC =
  'https://images.unsplash.com/photo-1720378042271-60aff1e1c538?w=1600&auto=format&fit=crop&q=60'

export const DEMO_ITEMS = [
  {
    id: 'brief',
    label: 'Answer the brief',
    image: { src: PLACEHOLDER_SRC, alt: 'The five-step brief form' },
  },
  {
    id: 'match',
    label: 'Match a template',
    image: { src: PLACEHOLDER_SRC, alt: 'Three matched template concepts' },
  },
  {
    id: 'copy',
    label: 'Generate copy',
    image: { src: PLACEHOLDER_SRC, alt: 'Generated headline and section copy' },
  },
  {
    id: 'share',
    label: 'Share the preview',
    image: { src: PLACEHOLDER_SRC, alt: 'A finished preview with its share link' },
  },
] as const satisfies readonly [DemoItem, ...DemoItem[]]
