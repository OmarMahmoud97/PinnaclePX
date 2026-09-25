import { expect, type Page, test } from '@playwright/test'
import { CARRIED_KEY, DRAFT_KEY } from '@/lib/brief/draft'
import { ANSWERED, refuseSends, withDraft } from './helpers/start'

// The hero's hand-off (docs/start-page-journey-plan.md, D4 and 8.1): the hero writes its
// sentence to a key of its own and never reads or overwrites a draft, so / never loads the
// schema that reads one; /start merges the sentence into this tab's draft on arrival, keeping
// every other answer, and lands on the name question when the sentence is long enough, or on the
// sentence question, filled in, when it is not. Nothing here sends a brief.

const SENTENCE = 'Mobile bike repair in Leeds. Servicing, wheel builds and same-day puncture fixes.'

const read = (page: Page, key: string) => page.evaluate((name) => sessionStorage.getItem(name), key)

async function carryFromHero(page: Page, sentence: string) {
  await page.goto('/')
  const hero = page.locator('#hero')
  await hero.getByRole('textbox').fill(sentence)
  await hero.locator('#hero-cta').click()
}

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
})

test('the hero hands its sentence over in its own key and leaves the draft alone', async ({
  page,
}) => {
  await withDraft(page, { reached: 4 })
  await page.goto('/')
  const seeded = await read(page, DRAFT_KEY)
  await page.locator('#hero').getByRole('textbox').fill(SENTENCE)
  expect(await read(page, DRAFT_KEY)).toBe(seeded)
  expect(await read(page, CARRIED_KEY)).toBeNull()

  // The click writes the hand-off and nothing else; /start takes it once and forgets it.
  await page.locator('#hero-cta').click()
  await expect(page).toHaveURL(/\/start\?q=2$/)
  await expect.poll(() => read(page, CARRIED_KEY)).toBeNull()
})

test('a returning draft keeps its other answers when the hero sentence lands', async ({ page }) => {
  await withDraft(page, { reached: 4 })
  await carryFromHero(page, SENTENCE)
  await expect(page).toHaveURL(/\/start\?q=2$/)
  await expect(page.getByLabel(/^(Company|Business name)$/)).toHaveValue(ANSWERED.company)

  await page.goto('/start?q=1')
  await expect(page.locator('main#main textarea')).toHaveValue(SENTENCE)
})

test('a short hero sentence opens the first question with it filled in', async ({ page }) => {
  await carryFromHero(page, 'Bike repair')
  await expect(page).toHaveURL(/\/start\?q=1$/)
  await expect(page.locator('main#main textarea')).toHaveValue('Bike repair')
})

test('a hero sentence lands in a fresh tab too', async ({ page }) => {
  await carryFromHero(page, SENTENCE)
  await expect(page).toHaveURL(/\/start\?q=2$/)
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page).toHaveURL(/\/start\?q=1$/)
  await expect(page.locator('main#main textarea')).toHaveValue(SENTENCE)
})
