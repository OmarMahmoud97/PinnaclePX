// @ts-check
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

const PALETTE_CLASS =
  '\\b(bg|text|border|from|via|to|ring|fill|stroke)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}\\b'
const HEX_LITERAL = '#[0-9a-fA-F]{3,8}\\b'
const THIRD_PARTY_HOST = '(api\\.anthropic\\.com|api\\.pexels\\.com)'

// ESLint replaces (not merges) a rule's options when a later block configures the same rule, so
// every no-restricted-imports and no-restricted-syntax block below lists the full set of
// patterns that apply to its files.
const NO_BARREL = {
  regex: '^@/(lib|templates|components)/.*/index$',
  message: 'No barrel files; import the module directly.',
}
const NO_ANTHROPIC_SDK = {
  regex: '^@anthropic-ai/',
  message: 'Only lib/ai may talk to Anthropic.',
}
const NO_PEXELS_SDK = {
  regex: '^pexels(/|$)',
  message: 'Only lib/images may talk to Pexels.',
}
const TEMPLATES_NO_APP = {
  regex: '^@/app(/|$)',
  message: 'Templates must not import from app.',
}
const TEMPLATES_ONLY_PURE = {
  regex: '^@/lib/(?!tokens/|copy-slots/)',
  message: 'Templates may import only @/lib/tokens/* and @/lib/copy-slots/*.',
}
const LIB_NO_APP_OR_TEMPLATES = {
  regex: '^@/(app|templates)(/|$)',
  message: 'lib must not depend on app or templates.',
}
const PURE_NO_IO = {
  regex: '^@/lib/(ai|images|db|inngest)(/|$)',
  message: 'Pure modules must not import IO modules.',
}

const EVERYWHERE = [NO_BARREL, NO_ANTHROPIC_SDK, NO_PEXELS_SDK]

const NO_THIRD_PARTY_HOSTS = [
  {
    selector: `Literal[value=/${THIRD_PARTY_HOST}/]`,
    message: 'Call Anthropic only from lib/ai and Pexels only from lib/images.',
  },
  {
    selector: `TemplateElement[value.raw=/${THIRD_PARTY_HOST}/]`,
    message: 'Call Anthropic only from lib/ai and Pexels only from lib/images.',
  },
]

const NO_HEX_OR_PALETTE = [
  {
    selector: `Literal[value=/${HEX_LITERAL}/]`,
    message: 'No hex colour literals in templates; use semantic CSS-variable classes.',
  },
  {
    selector: `TemplateElement[value.raw=/${HEX_LITERAL}/]`,
    message: 'No hex colour literals in templates; use semantic CSS-variable classes.',
  },
  {
    selector: `Literal[value=/${PALETTE_CLASS}/]`,
    message: 'No Tailwind palette classes in templates; use semantic classes.',
  },
  {
    selector: `TemplateElement[value.raw=/${PALETTE_CLASS}/]`,
    message: 'No Tailwind palette classes in templates; use semantic classes.',
  },
]

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  // Type-aware strict rules for our own code.
  {
    files: ['**/*.{ts,tsx,mts}'],
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      // Underscore marks a binding that exists only to be omitted, such as a rest-sibling drop.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      // The standards doc prefers type aliases; the stylistic preset defaults to interface.
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-non-null-assertion': 'error',
      'no-console': 'error', // only lib/log.ts may console; see override
      'no-empty': ['error', { allowEmptyCatch: false }],
    },
  },

  // The logging wrapper is the only place console is allowed.
  { files: ['lib/log.ts'], rules: { 'no-console': 'off' } },

  // process.env only inside lib/env.ts (and the config files that run before env exists).
  {
    files: ['**/*.{ts,tsx,mts}'],
    ignores: ['lib/env.ts', 'next.config.ts', 'drizzle.config.ts', 'playwright.config.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        { object: 'process', property: 'env', message: 'Read env only from lib/env.ts.' },
      ],
    },
  },

  // Everywhere: no barrel imports, and third-party SDKs and hosts stay inside their IO module.
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: EVERYWHERE }],
      'no-restricted-syntax': ['error', ...NO_THIRD_PARTY_HOSTS],
    },
  },

  // BOUNDARY 1: templates may import only lib/tokens and lib/copy-slots.
  // BOUNDARY 4: no hex literals or Tailwind palette classes in templates.
  {
    files: ['templates/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [...EVERYWHERE, TEMPLATES_NO_APP, TEMPLATES_ONLY_PURE] },
      ],
      'no-restricted-syntax': ['error', ...NO_THIRD_PARTY_HOSTS, ...NO_HEX_OR_PALETTE],
    },
  },

  // BOUNDARY 2: lib must not import app or templates.
  {
    files: ['lib/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [...EVERYWHERE, LIB_NO_APP_OR_TEMPLATES] }],
    },
  },

  // BOUNDARY 3: pure modules must not import IO modules.
  {
    files: ['lib/select/**/*.ts', 'lib/tokens/**/*.ts', 'lib/copy-slots/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [...EVERYWHERE, LIB_NO_APP_OR_TEMPLATES, PURE_NO_IO] },
      ],
    },
  },

  // IO modules: lib/ai may use the Anthropic SDK and host; lib/images may use Pexels.
  {
    files: ['lib/ai/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [NO_BARREL, NO_PEXELS_SDK, LIB_NO_APP_OR_TEMPLATES] },
      ],
      'no-restricted-syntax': 'off',
    },
  },
  {
    files: ['lib/images/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [NO_BARREL, NO_ANTHROPIC_SDK, LIB_NO_APP_OR_TEMPLATES] },
      ],
      'no-restricted-syntax': 'off',
    },
  },

  // No default exports except Next file conventions and tool config files.
  {
    files: ['**/*.{ts,tsx}'],
    ignores: [
      'app/**/page.tsx',
      'app/**/layout.tsx',
      'app/**/template.tsx',
      'app/**/default.tsx',
      'app/**/loading.tsx',
      'app/**/error.tsx',
      'app/**/not-found.tsx',
      'app/**/global-error.tsx',
      'app/**/route.ts',
      'app/**/opengraph-image.tsx',
      'app/**/twitter-image.tsx',
      'app/**/icon.tsx',
      'app/**/apple-icon.tsx',
      'app/**/sitemap.ts',
      'app/**/robots.ts',
      'app/**/manifest.ts',
      'next.config.ts',
      'drizzle.config.ts',
      'playwright.config.ts',
    ],
    rules: { 'import/no-default-export': 'error' },
  },

  prettier,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'next-env.d.ts',
    'db/**',
  ]),
])
