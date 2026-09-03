// A finished design the visitor can open. Written by the pipeline, read by the done page.
type DesignLink = Readonly<{ id: string; title: string; url: string }>

// What the server knows about a brief's designs: still building, ready with links, or a brief
// it has never heard of.
export type DesignsStatus =
  | Readonly<{ status: 'building' }>
  | Readonly<{ status: 'ready'; designs: readonly DesignLink[] }>
  | Readonly<{ status: 'missing' }>
