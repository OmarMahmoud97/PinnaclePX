# Client site speed: what the six live sites measure

Measured 5 September 2026, 21:10 to 21:15 UTC, as evidence for any speed claim on the home page (`docs/copy-review.md`, section 6; `docs/claims-register.md`). Lighthouse 13.4.1, performance category only, mobile form factor, simulated throttling (Lighthouse's default slow 4G and 4x CPU slowdown), one run per site, through Playwright's Chromium 1234 on a Windows 11 desktop. Google's PageSpeed Insights API refused keyless requests (HTTP 429) the same evening, so these are local lab runs, not field data. Raw reports: `lh-<host>.json` in the session scratchpad, not committed (0.5 to 1.2 MB each).

| Site                   | Score | First paint | Largest paint | Blocking time | Layout shift | Speed index | Page weight |
| ---------------------- | ----- | ----------- | ------------- | ------------- | ------------ | ----------- | ----------- |
| gowilddogwalking.co.uk | 27    | 9.6 s       | 12.9 s        | 3,400 ms      | 0            | 9.6 s       | 3,336 KiB   |
| vetpres.com            | 64    | 4.0 s       | 5.4 s         | 210 ms        | 0            | 5.5 s       | 4,586 KiB   |
| trvlwell.co            | 62    | 6.2 s       | 6.7 s         | 0 ms          | 0            | 6.2 s       | 918 KiB     |
| withuapp.com           | 39    | 3.5 s       | 6.6 s         | 3,190 ms      | 0.003        | 4.1 s       | 1,573 KiB   |
| mvmnt.com              | 34    | 3.2 s       | 9.3 s         | 2,170 ms      | 0.022        | 7.1 s       | 24,059 KiB  |
| urunn.com              | 32    | 2.5 s       | 23.4 s        | 9,860 ms      | 0.003        | 14.0 s      | 44,697 KiB  |

Reading the numbers. Lighthouse's "good" thresholds are a largest paint under 2.5 s, blocking time under 200 ms and layout shift under 0.1. Layout shift is excellent on every site. Largest paint and blocking time are not: every site is over the largest-paint line, four are far over, and two pages weigh more than 20 MB on a phone, which is autoplaying hero video. One lab run each, with simulated throttling, overstates what a visitor on a good connection sees; it is also exactly what a sceptical visitor gets when they paste the address into PageSpeed Insights, which the client-voice research says buyers do.

What this supports for the home page copy: a promise about how the studio works (testing on a phone before launch, fixing what is slow) is sayable as the owner's commitment. A promise about how fast the real site will load, or any line that invites comparison with these six, is not sayable until the sites are lighter and re-measured. The work band's lead, "Open any of them on your phone", is unaffected: the sites open and work; they are heavy.

Re-run: `pnpm dlx lighthouse <url> --output=json --only-categories=performance --form-factor=mobile --screenEmulation.mobile --throttling-method=simulate` with `CHROME_PATH` set to Playwright's Chromium. On Windows the launcher fails to delete its temp profile after the report is written (EPERM in `destroyTmp`), so the process exits non-zero with a complete report on disk.
