import { SITE } from '@/lib/site'

// Town and contact email join this section once the owner supplies them.
export function About() {
  return (
    <section id="about" className="scroll-mt-16">
      <div className="grid divide-border md:grid-cols-6 md:divide-x">
        <div className="p-8 md:col-span-2 md:p-14">
          <h2 className="text-3xl font-medium tracking-tighter text-balance md:text-4xl">
            About the studio
          </h2>
        </div>
        <div className="flex flex-col gap-4 p-8 leading-relaxed text-on-surface-muted md:col-span-4 md:p-14">
          <p className="max-w-2xl">
            <span className="font-medium text-on-surface">{SITE.legalName}</span> is a UK web design
            studio. Most agencies ask you to commit before you have seen anything. A quote, a
            deposit, a six-week wait, then a first draft you might not like.
          </p>
          <p className="max-w-2xl">
            We would rather show you first. Answer five questions and look at three designs in your
            own brand. Only then decide whether to talk to us. If you do, you talk to the people who
            will build your site.
          </p>
        </div>
      </div>
    </section>
  )
}
