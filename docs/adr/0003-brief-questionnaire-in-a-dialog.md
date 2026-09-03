# Ask the five questions in a dialog on the home page

- Status: superseded by 0004
- Date: 2026-09-03

## Context

`docs/home-page-plan.md` (section 8) proposed a route per step under `app/(form)`: `/start` for the
first question, `/start/details` for the second, then a client page for the rest, with a signed
cookie carrying the first answer between the first two Server Actions.

The owner asked instead for the primary call to action to open a modal questionnaire in place, one
question at a time, on the grounds that a visitor who has to leave the page is a visitor who may
not come back.

## Decision

The five questions live in a native `<dialog>` opened from every call to action on the home page.

1. **Native `<dialog>` with `showModal()`.** The focus trap, Escape to close, the inert background
   and the `::backdrop` element all come from the platform. No dialog library, no focus-trap
   library. The entry transition uses `@starting-style` and `allow-discrete`, in `globals.css`
   because no utility class can reach `::backdrop`.
2. **One `useReducer`, one discriminated-union action type**, as the standards require for the five
   step form. It lives in `app/_components/brief/brief-reducer.ts` with unit tests.
3. **Validation is zod, in `lib/brief/schema.ts`, one schema per question.** The dialog validates
   the current question before advancing; the Server Action re-validates the whole brief, because
   a browser is not a trust boundary. The form carries `noValidate` so the browser's own bubbles
   never pre-empt our messages.
4. **The question order is the sentence first, identity second**, matching the hero copy already
   shipped and the plan's recommendation. This deviates from the build guide, which asks for
   identity first. Nothing is persisted yet, so the deviation costs nothing today; when the
   pipeline lands, the lead is created on the second answer instead of the first.
5. **The provider wraps the page, the sections stay server components.** `BriefProvider` is a
   client component that renders `{children}`, so only the trigger and the dialog ship JavaScript.
6. **The trigger is an anchor, not a button.** Without JavaScript it still takes the visitor to the
   section that explains the questions; with JavaScript it opens the dialog. It carries
   `aria-haspopup="dialog"`.

## Consequences

- No `/start` route, no draft cookie, no route-per-step. If a shareable resume link is ever needed,
  the route form comes back and the dialog becomes its entry point; the reducer and schemas are
  already independent of both.
- `submitBrief` in `app/_components/brief/actions.ts` validates and logs, and stores nothing. The
  seam is commented in that file. **The primary call to action must not be pointed at real traffic
  until the pipeline exists**, because a visitor who completes the questionnaire today receives no
  designs and no email.
- Logo and photo files are collected by name only. Client-direct upload to Vercel Blob lands with
  the pipeline.

## Also decided here

The brand ramp gained `--brand-deepest`, and every fill or foreground that carries text or a
meaningful graphic moved off `--brand`. `--brand` (#0ea5e9) is 2.77:1 against white, so white text
on it failed WCAG AA on every primary button. `--brand-deeper` is 5.93:1. A site whose product
promises AA contrast cannot fail it on its own buttons.
