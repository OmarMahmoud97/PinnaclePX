import type { SocialNetwork } from '../copy-slots'

type Props = { network: SocialNetwork }

const LABELS: Readonly<Record<SocialNetwork, string>> = {
  x: 'X',
  youtube: 'YouTube',
  instagram: 'Instagram',
}

// The source's three social marks, its own drawings: X filled in the text colour with the
// body grey around it, YouTube and Instagram outlined in the body grey.
export function SocialIcon({ network }: Props) {
  switch (network) {
    case 'x':
      return (
        <svg
          width="14"
          height="13"
          viewBox="0 0 14 13"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="m4.179.5 2.909 3.886.372.497.406-.469L11.255.5h.824L8.104 5.09l-.263.305.241.322 4.919 6.571H9.928L6.695 8.016l-.373-.493-.404.467-3.722 4.298h-.825l4.3-4.967.265-.305-.245-.324L1.005.5zm-2.07 1.032 7.765 10.26.15.198h2.437l-.599-.8L4.184.93l-.15-.2H1.501z"
            className="fill-on-surface stroke-on-surface-muted"
          />
        </svg>
      )
    case 'youtube':
      return (
        <svg
          width="15"
          height="11"
          viewBox="0 0 15 11"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M.866 8.299a14.46 14.46 0 0 1 0-6.463 1.27 1.27 0 0 1 .36-.573c.17-.158.384-.273.618-.332a37.4 37.4 0 0 1 11.313 0c.233.059.446.174.618.332s.295.356.36.573c.487 2.13.487 4.332 0 6.463a1.3 1.3 0 0 1-.36.572 1.4 1.4 0 0 1-.619.333 37.4 37.4 0 0 1-11.312 0 1.4 1.4 0 0 1-.619-.333 1.3 1.3 0 0 1-.36-.572"
            className="stroke-on-surface-muted"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m5.5 6.896 4-1.827-4-1.827z"
            className="stroke-on-surface-muted"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'instagram':
      return (
        <svg
          width="15"
          height="14"
          viewBox="0 0 15 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M11 .5H4C2.067.5.5 1.931.5 3.697v6.394c0 1.766 1.567 3.198 3.5 3.198h7c1.933 0 3.5-1.432 3.5-3.198V3.697C14.5 1.931 12.933.5 11 .5"
            className="stroke-on-surface-muted"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.3 6.542a2.37 2.37 0 0 1-.284 1.553 2.7 2.7 0 0 1-1.227 1.107 3.04 3.04 0 0 1-1.703.24 2.9 2.9 0 0 1-1.535-.716 2.5 2.5 0 0 1-.785-1.403 2.36 2.36 0 0 1 .263-1.556c.265-.48.69-.872 1.212-1.12a3.03 3.03 0 0 1 1.7-.26c.594.08 1.145.333 1.57.722.424.388.701.89.79 1.433"
            className="stroke-on-surface-muted"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
  }
}

export function socialLabel(network: SocialNetwork): string {
  return LABELS[network]
}
