import type { Line } from '@/app/start/_components/start-copy'

// A line of the page's words with one of the visitor's own inside, isolated (<bdi>) so a name in
// another script never turns the sentence around it (docs/start-page-journey-plan.md, 7.7).
export function LineWords({ line, className }: Readonly<{ line: Line; className?: string }>) {
  return (
    <>
      {line.before}
      {line.echo !== '' && <bdi className={className}>{line.echo}</bdi>}
      {line.after}
    </>
  )
}
