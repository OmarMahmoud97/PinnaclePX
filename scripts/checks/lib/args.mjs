// The options every check takes, from the command line:
//
//   --base <url>           the dev server to measure (required); never the owner's port 3000
//   --source <list>        where the copy comes from: corpus (tests/fixtures/template-copy) or
//                          eval:<run> (test-results/eval/<run>), comma separated
//   --templates <list>     only these template ids
//   --names <list>         only these pages: a corpus name, or a run's fixture id
//   --kind <kind>          model (stored model answers), synthetic (the corpus's synthetic
//                          answers) or all; each check sets its own default
//   --looks <list>         all (the four looks' fonts), own (each answer's own look), or names
//   --widths <list>        standard, seams, all, or sizes such as 390x844,1024
//   --limit <n>            at most n pages per template, the longest copy first
//   --out <dir>            where results go (default test-results/checks/<check>)
//
// A check may take more of its own; those are documented in its file.

// The check standard's widths, 390 first, and a phone held sideways (decision 19).
const STANDARD = [
  '390x844',
  '320x568',
  '360x800',
  '768x1024',
  '1024x768',
  '1280x800',
  '1440x900',
  '1920x1080',
  '844x390',
]
// Each Tailwind breakpoint the templates use, a pixel either side.
const SEAMS = ['639x900', '640x900', '767x1024', '1023x768', '1279x800', '1535x900', '1536x900']

function sizesOf(value) {
  if (value === 'standard') return STANDARD
  if (value === 'seams') return SEAMS
  if (value === 'all') return [...STANDARD, ...SEAMS]
  return value.split(',').map((size) => (size.includes('x') ? size : `${size}x900`))
}

// A size such as 390x844 as a viewport. A phone is emulated as one, with touch and its meta
// viewport, below 640 px and when held sideways; anything wider is a window.
function viewportOf(size) {
  const [width, height] = size.split('x').map(Number)
  const phone = width < 640 || (width > height && height < 500)
  return { size, width, height, phone }
}

export function parseArgs(argv, defaults = {}) {
  const options = {
    base: null,
    source: defaults.source ?? 'corpus',
    templates: null,
    names: null,
    looks: defaults.looks ?? 'all',
    kind: defaults.kind ?? 'all',
    widths: defaults.widths ?? 'standard',
    limit: null,
    out: null,
    rest: {},
  }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    const next = () => {
      i += 1
      if (argv[i] === undefined) throw new Error(`${arg} needs a value`)
      return argv[i]
    }
    if (arg === '--base') options.base = next()
    else if (arg === '--source') options.source = next()
    else if (arg === '--templates') options.templates = next().split(',')
    else if (arg === '--names') options.names = next().split(',')
    else if (arg === '--looks') options.looks = next()
    else if (arg === '--kind') options.kind = next()
    else if (arg === '--widths') options.widths = next()
    else if (arg === '--limit') options.limit = Number(next())
    else if (arg === '--out') options.out = next()
    else if (arg.startsWith('--'))
      options.rest[arg.slice(2)] = argv[i + 1]?.startsWith('--') === false ? next() : true
    else throw new Error(`Unknown argument ${arg}`)
  }
  if (options.base === null) throw new Error('--base <url> of your own dev server is required')
  const port = new URL(options.base).port
  if (port === '3000') throw new Error('Port 3000 is the owner’s dev server; start your own.')
  options.base = options.base.replace(/\/$/, '')
  options.sizes = sizesOf(options.widths).map(viewportOf)
  return options
}

const LOOKS = ['warm', 'minimal', 'bold', 'dark']

// The looks to set a page in: its own, the four, or a list.
export function looksFor(option, own) {
  if (option === 'own') return [own]
  if (option === 'all') return LOOKS
  return option.split(',')
}
