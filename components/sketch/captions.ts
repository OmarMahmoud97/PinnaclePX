// What the sketch is, said beside it wherever it appears, so a wireframe is never mistaken for a
// design, and a client's brief is never mistaken for the site we designed for them. The closing
// frame shows VetPres's brief, a client of the studio; a caption names the client only once
// their written consent is recorded in docs/claims-register.md (decision 41), so `closingPrefix`
// says "a client's" until then. The How it works walkthrough paints an invented brand
// (app/_components/walkthrough-brand.ts), so its two captions say so and never say "client".
export const SKETCH_CAPTION = {
  yours: 'Live sketch. Not one of your designs, just your answers taking shape.',
  // Each fits two lines under the frame at every size, so the swap never moves the frame.
  walkthrough: 'An example brief. A sketch, not one of the designs.',
  walkthroughBuilt: 'Built as an illustration. Not a client, not one of the designs.',
  // Label shape, not persuasion: the mono register never sells, and the Taster's H2 already says
  // what a conversation starts.
  closing: 'A sketch from one sentence. Not one of the designs.',
  // Before `closing` when the closing frame shows the client's brief rather than the visitor's.
  closingPrefix: "A client's brief. ",
} as const
