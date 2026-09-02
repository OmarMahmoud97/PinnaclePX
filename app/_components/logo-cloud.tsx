import { PARTNERS } from '@/app/_components/partners'

export function LogoCloud() {
  return (
    <section id="customers" className="flex w-full items-center justify-center">
      <div className="grid w-full grid-cols-1 items-center divide-y divide-border lg:grid-cols-6 lg:divide-y-0">
        <p className="inline-flex min-h-20 items-center justify-center text-center font-medium text-on-surface-muted lg:col-span-2">
          Trusted by&nbsp;<span className="text-brand">fast-growing</span>&nbsp;startups
        </p>
        {/* Every cell draws its top and left edge; the overflow clip hides the outer ones. */}
        <ul className="grid grid-cols-2 overflow-hidden border-border md:grid-cols-4 lg:col-span-4 lg:border-l">
          {PARTNERS.map(({ name, Logo }) => (
            <li
              key={name}
              className="-mt-px -ml-px flex h-32 items-center justify-center border-t border-l border-border p-6"
            >
              <Logo className="h-auto max-h-8 max-w-full fill-on-surface" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
