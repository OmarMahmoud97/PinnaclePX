// The in-page helpers' types, for TypeScript that runs them in a page
// (e2e/reduced-motion-template-fit.spec.ts); in-page.mjs holds what they do.

export declare function installHelpers(): void

export declare function textItems(args: {
  keys?: readonly string[] | 'all' | null
  scope?: 'page' | 'header' | 'menu'
  menuId?: string | null
}): unknown[]

export declare function logoBoxes(): unknown[]

export declare function loadFonts(): Promise<void>

export declare function settle(): Promise<void>

export declare function isStyled(): boolean
