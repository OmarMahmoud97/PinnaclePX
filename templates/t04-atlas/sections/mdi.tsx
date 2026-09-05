// The Material Design Icons the source draws through vue-material-design-icons, by path, at the
// pixel size it passes each one, in the current colour.
const PATHS = {
  chevronDown: 'M7.41,8.58L12,13.17L16.59,8.58L18,10L12,15.41L6,10L7.41,8.58Z',
  chevronUp: 'M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z',
  chevronRight: 'M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z',
  plusThick: 'M20 14H14V20H10V14H4V10H10V4H14V10H20V14Z',
  minusThick: 'M20 14H4V10H20V14Z',
  arrowUp: 'M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z',
  arrowRight: 'M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z',
  checkCircle:
    'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z',
  segment: 'M9,9H21V11H9V9M3,13H21V15H3V13M3,17H15V19H3V17M3,5H21V7H3V5Z',
  close:
    'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z',
} as const

type Props = { name: keyof typeof PATHS; size: number; className?: string }

export function Mdi({ name, size, className }: Props) {
  return (
    <span aria-hidden="true" className={`inline-flex ${className ?? ''}`}>
      <svg fill="currentColor" width={size} height={size} viewBox="0 0 24 24">
        <path d={PATHS[name]} />
      </svg>
    </span>
  )
}
