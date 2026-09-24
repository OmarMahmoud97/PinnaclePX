// A link in the header: text in the current colour, dimmed on hover rather than recoloured,
// because over the hero the header is drawn inverted (header-chrome.tsx) and any colour set in
// here would show as its opposite. The focus outline follows the text for the same reason. On a
// touch screen it is 40px tall, inside the 48px island: from md, tablets included, this row is
// the menu, so a thumb reaches a section in one tap. The questionnaire's way out shares it
// (app/start/_components/start-chrome.tsx). It lives in a leaf module with no imports so that
// the questionnaire's client chrome can share it without pulling SiteHeader and MobileNav, about
// 1.5 KB gzipped, into /start's scripts.
export const headerLink =
  'inline-flex h-8 pointer-coarse:h-10 items-center px-2 text-sm font-medium transition-opacity lg:px-3 duration-(--motion-tap) hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current'
