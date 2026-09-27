import { Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import { tabLabelFrom } from '@/lib/brief/sketch'

type Props = Readonly<{ company: string; desktop: ReactNode; phone: ReactNode }>

// The Work tile's one device (ADR 0039): a browser window at rest when Desktop is checked and a
// phone when Phone is, both drawn by CSS from the radios alone (app/_styles/work.css), so the
// switch works without script. The script (app/_components/work-morph-controller.ts) only
// animates between them, and it makes the parts a flight draws (the shade, the lit front, the
// size readout and the landing's light) when a tile is first reached for, so none of them is in
// the page's HTML, which holds only what the two rest states need. The chrome is decoration; the
// two captures carry the alt text, and at rest only the shown one is laid out, so the
// accessibility tree holds exactly one image per tile. BrowserFrame and PhoneFrame stay as they
// are for /start and the sketch.
export function WorkDevice({ company, desktop, phone }: Props) {
  return (
    <div className="work-stage">
      <div className="work-device">
        <div aria-hidden className="work-chrome">
          <span className="work-chrome-dots">
            <span />
            <span />
            <span />
          </span>
          <span className="work-tab">
            <span className="work-tab-label">
              <Lock className="size-2.5 shrink-0" />
              {tabLabelFrom(company)}
            </span>
          </span>
        </div>
        <div data-frame="browser">{desktop}</div>
        <div data-frame="phone">{phone}</div>
      </div>
    </div>
  )
}
