import { PARTNERS } from '@/app/_components/partners'

export function LogoCloud() {
  return (
    <section id="customers">
      <div className="grid divide-y divide-border lg:grid-cols-6 lg:divide-y-0">
        <p className="flex min-h-20 items-center justify-center font-medium text-on-surface-muted lg:col-span-2">
          Trusted by <span className="px-1 text-brand">fast-growing</span> startups
        </p>
        {/* Every cell draws its top and left edge; the overflow clip hides the outer ones. */}
        <ul className="grid grid-cols-2 overflow-hidden border-border md:grid-cols-4 lg:col-span-4 lg:border-l">
          {PARTNERS.map(({ name, Logo }) => (
            <li
              key={name}
              className="-mt-px -ml-px flex h-32 items-center justify-center border-t border-l border-border p-6"
            >
              <Logo className="fill-on-surface" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
