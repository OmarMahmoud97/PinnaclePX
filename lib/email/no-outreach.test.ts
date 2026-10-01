import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'

// The promise on every page is that nobody is written to or rung unless they book (claims
// register rows 14, 15, 51 and 66). The owner's pages and the Cal.com webhook record what a
// visitor did; this walks everything they import and holds that none of it can send an email:
// nothing under lib/email, and nothing that imports the email provider's package.
const ROOT = resolve(__dirname, '..', '..')
const ROOTS = ['app/admin', 'app/api/cal']
const EXTENSIONS = ['.ts', '.tsx']

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sources(path)
    return EXTENSIONS.some((ext) => name.endsWith(ext)) && !name.includes('.test.') ? [path] : []
  })
}

function moduleFile(specifier: string, from: string): string | null {
  let base: string
  if (specifier.startsWith('@/')) base = join(ROOT, specifier.slice(2))
  else if (specifier.startsWith('.')) base = resolve(dirname(from), specifier)
  else return null
  for (const ext of ['', ...EXTENSIONS]) {
    const candidate = `${base}${ext}`
    try {
      if (statSync(candidate).isFile()) return candidate
    } catch {
      // not this one
    }
  }
  return null
}

const IMPORT =
  /^\s*(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]|^\s*import\s+['"]([^'"]+)['"]/gm

function imports(file: string): string[] {
  const text = readFileSync(file, 'utf8')
  const found: string[] = []
  for (const match of text.matchAll(IMPORT)) found.push(match[1] ?? match[2] ?? '')
  return found.filter((specifier) => specifier !== '')
}

// Every module reachable from the roots, with the bare packages they import.
function reach(): { modules: Set<string>; packages: Set<string> } {
  const modules = new Set<string>()
  const packages = new Set<string>()
  const queue = ROOTS.flatMap((root) => sources(join(ROOT, root)))
  while (queue.length > 0) {
    const file = queue.pop()
    if (file === undefined || modules.has(file)) continue
    modules.add(file)
    for (const specifier of imports(file)) {
      const target = moduleFile(specifier, file)
      if (target === null) packages.add(specifier)
      else queue.push(target)
    }
  }
  return { modules, packages }
}

describe('the owner pages and the Cal.com webhook', () => {
  const { modules, packages } = reach()
  const relative = [...modules].map((file) =>
    file
      .slice(ROOT.length + 1)
      .split(sep)
      .join('/'),
  )

  it('reach a real set of modules', () => {
    expect(relative.some((file) => file === 'app/admin/page.tsx')).toBe(true)
    expect(relative.some((file) => file.startsWith('lib/db/'))).toBe(true)
  })

  it('reach nothing that can send an email', () => {
    expect(relative.filter((file) => file.startsWith('lib/email/'))).toEqual([])
    expect([...packages].filter((name) => name === 'resend' || name.startsWith('resend/'))).toEqual(
      [],
    )
  })
})
