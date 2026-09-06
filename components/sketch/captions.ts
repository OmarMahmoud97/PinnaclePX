// What the sketch is, said beside it wherever it appears, so a wireframe is never mistaken for a
// design, and a client's brief is never mistaken for the site we designed for them. The brief the
// hero paints is VetPres's, a client of the studio; the captions name the client only once
// their written consent is recorded in docs/claims-register.md (decision 41), so `built` is the
// unnamed form until then and becomes "VetPres, a client of ours. Their one sentence, drawn as a
// page. Their real site is further down." with the consent and the journey section. The How it
// works walkthrough paints an invented brand (app/_components/walkthrough-brand.ts), so its two
// captions say so and never say "client".
export const SKETCH_CAPTION = {
  yours: 'Live sketch. Not one of your designs, just your answers taking shape.',
  example: "Sketch of a client's brief. A first look, not one of the designs.",
  built: 'The same sentence, drawn as a page. Not one of the designs.',
  // Each fits two lines under the frame at every size, so the swap never moves the frame.
  walkthrough: 'An example brief. A sketch, not one of the designs.',
  walkthroughBuilt: 'Built as an illustration. Not a client, not one of the designs.',
  // Label shape, not persuasion: the mono register never sells, and the Taster's H2 already says
  // what a conversation starts.
  closing: 'A sketch from one sentence. Not one of the designs.',
  // Before `closing` when the closing frame shows the client's brief rather than the visitor's.
  closingPrefix: "A client's brief. ",
} as const
