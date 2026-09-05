import Image from 'next/image'
import type { AtlasContent } from '../copy-slots'
import { button, paragraph, section } from '../styles'
import { Emphasis } from './emphasis'
import { Mdi } from './mdi'

type Props = Pick<AtlasContent, 'pitch'>

// The source's Buy and trade: the words at the left over two exchange rows and a full-width
// gradient button, the picture at the right (and above the words on phones). An exchange row
// is a bordered box with a label, a value and a unit chooser beside it; without an exchange
// the one box carries a label beside the owner's statement.
export function AtlasPitch({ pitch }: Props) {
  const picture =
    pitch.image === null ? null : (
      <div className="w-full">
        <Image
          src={pitch.image.src}
          alt={pitch.image.alt}
          width={pitch.image.width}
          height={pitch.image.height}
          sizes="(min-width: 1024px) 620px, 100vw"
          className="mt-4 sm:-mt-4"
        />
      </div>
    )
  return (
    <section id="start" className="my-24 w-full">
      <div className={section}>
        {picture !== null && (
          <div className="col-span-12 mb-8 sm:hidden lg:col-span-6">{picture}</div>
        )}
        <div
          data-fade="right"
          className="col-span-12 mt-4 px-4 lg:col-span-6 xl:mt-20 [&>*+*]:mt-6"
        >
          <h2 className="text-4xl font-semibold sm:pr-8 xl:pr-12">
            <Emphasis heading={pitch.heading} />
          </h2>
          <p className={paragraph}>{pitch.lead}</p>
          <div className="lg:pr-12 [&>*+*]:mt-6">
            {pitch.exchange === null ? (
              <div className="flex items-center [&>*+*]:ml-4">
                <div className="relative flex w-full items-center rounded-xl border border-brand-deeper px-5 py-3">
                  <span className="border-r border-brand-deeper py-3 pr-5 text-sm font-medium text-brand-deeper">
                    {pitch.label}
                  </span>
                  <p className="w-full py-3 pl-5 text-lg font-medium">{pitch.statement}</p>
                </div>
              </div>
            ) : (
              pitch.exchange.rows.map((row) => (
                <div key={row.label} className="flex items-center [&>*+*]:ml-4">
                  <div className="relative flex w-full items-center rounded-xl border border-brand-deeper px-5 py-3 lg:max-w-[336px]">
                    <span className="border-r border-brand-deeper py-3 pr-5 text-sm font-medium text-brand-deeper">
                      {row.label}
                    </span>
                    <input
                      type="text"
                      readOnly
                      aria-label={row.label}
                      value={row.value}
                      className="w-full border-none text-right text-lg font-medium ring-0 focus:ring-0 focus:outline-none"
                    />
                  </div>
                  <div className="relative w-full max-w-[106px] sm:max-w-[159px]">
                    <button
                      type="button"
                      className="relative flex w-full items-center justify-center rounded-xl border border-brand-deeper py-[1.35rem] text-sm font-medium sm:px-6 [&>*+*]:ml-1"
                    >
                      {row.icon !== null && (
                        <Image
                          src={row.icon.src}
                          alt=""
                          width={row.icon.width}
                          height={row.icon.height}
                          className="h-6 w-6 shrink-0 rounded-full"
                        />
                      )}
                      <span className="ml-3 block truncate">{row.unit}</span>
                      <Mdi name="chevronDown" size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
            <a
              href={pitch.action.href}
              className={`${button.gradient} w-full px-5 py-4 text-base font-medium`}
            >
              {pitch.exchange === null ? pitch.action.label : pitch.exchange.button}
            </a>
          </div>
        </div>
        {picture !== null && (
          <div data-fade="left" className="col-span-12 hidden sm:block lg:col-span-6">
            {picture}
          </div>
        )}
      </div>
    </section>
  )
}
