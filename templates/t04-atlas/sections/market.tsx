import Image from 'next/image'
import type { AtlasContent } from '../copy-slots'
import { paragraph } from '../styles'
import { Mdi } from './mdi'

type Props = Pick<AtlasContent, 'market' | 'glance'>

// The source's LineChart: Chart.js drew a curve through the row's points with a soft fill
// beneath, green for a rise and red for a fall, in a 112 by 48 box. The same numbers become a
// path here, curved through each point the way Chart.js's default tension does.
function curve(points: readonly (readonly [number, number])[]): string {
  const [first] = points
  if (first === undefined) return ''
  let d = `M${first[0].toFixed(1)} ${first[1].toFixed(1)}`
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(i - 1, 0)] ?? first
    const p1 = points[i] ?? first
    const p2 = points[i + 1] ?? first
    const p3 = points[Math.min(i + 2, points.length - 1)] ?? p2
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d
}

function Sparkline({ data, up, id }: { data: readonly number[]; up: boolean; id: string }) {
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const span = Math.max(max - min, 1)
  const points = data.map((value, index): readonly [number, number] => [
    (index / Math.max(data.length - 1, 1)) * 112,
    46 - ((value - min) / span) * 42,
  ])
  const line = curve(points)
  const tone = up ? 'text-success' : 'text-danger'
  return (
    <svg aria-hidden="true" viewBox="0 0 112 48" className={`-mx-2 h-12 w-28 ${tone}`} fill="none">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0.11" stopColor="currentColor" stopOpacity="0.5" />
          <stop offset="0.93" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L112 48 L0 48 Z`} fill={`url(#${id})`} />
      <path d={line} stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

// The source's card of three market tables, overlapping the hero's foot on a shadow, each with
// a title and a More link over rows of a coin, its price with a thick plus or minus, and its
// chart from sm up; a rule between the tables from xl. Without tables the card carries three
// columns of words with the same title row and rule.
export function AtlasMarket({ market, glance }: Props) {
  const columns = market === null ? glance.columns : market.groups
  const more = market === null ? glance.more : { label: market.more, href: glance.more.href }
  return (
    <section className="mx-2 max-w-(--breakpoint-xl) transform rounded-[2.25rem] bg-surface px-4 py-6 pb-20 shadow-lg sm:mx-auto sm:rounded-xl sm:px-6 sm:py-8 sm:shadow-md lg:-translate-y-12 lg:px-0">
      <div className="flex w-full flex-col items-center justify-center lg:flex-row">
        {columns.map((column, index) => (
          <div
            key={column.title}
            data-fade="up"
            data-delay={String(index)}
            className={`mt-6 w-full overflow-hidden lg:mt-0 lg:w-1/3 lg:px-8 [&>*+*]:mt-6 ${index < 2 ? 'border-border xl:border-r' : ''}`}
          >
            <div className="flex w-full items-center justify-between">
              <span className="font-medium">{column.title}</span>
              <a
                href={more.href}
                aria-label={`${more.label}: ${column.title}`}
                className="flex items-center rounded-md px-3 py-1 text-sm font-medium text-brand-deeper transition duration-300 hover:bg-brand-deeper/10 [&>*+*]:ml-1"
              >
                <span>{more.label}</span>
                <Mdi name="chevronRight" size={16} />
              </a>
            </div>
            {'rows' in column ? (
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full overflow-hidden px-2 py-2 align-middle sm:px-6">
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th className="text-left text-sm font-medium text-on-surface-muted/80">
                            Name
                          </th>
                          <th className="text-left text-sm font-medium text-on-surface-muted/80">
                            Price
                          </th>
                          <th className="hidden text-left text-sm font-medium text-on-surface-muted/80 sm:block">
                            Chart
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {column.rows.map((row, r) => (
                          <tr key={row.name} className="border-b border-border">
                            <td className="py-4 whitespace-nowrap">
                              <div className="flex items-center [&>*+*]:ml-2">
                                {row.icon !== null && (
                                  <Image
                                    src={row.icon.src}
                                    alt=""
                                    width={row.icon.width}
                                    height={row.icon.height}
                                    className="h-auto w-auto"
                                  />
                                )}
                                <span>{row.name}</span>
                              </div>
                            </td>
                            <td className="py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Mdi
                                  name={row.up ? 'plusThick' : 'minusThick'}
                                  size={14}
                                  className={row.up ? 'text-success' : 'text-danger'}
                                />
                                <span>{row.price}</span>
                              </div>
                            </td>
                            <td className="hidden whitespace-nowrap sm:block">
                              <div>
                                <Sparkline
                                  data={row.data}
                                  up={row.up}
                                  id={`atlas-spark-${String(index)}-${String(r)}`}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <p className={`${paragraph} border-b border-border pb-4 text-sm`}>{column.body}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
