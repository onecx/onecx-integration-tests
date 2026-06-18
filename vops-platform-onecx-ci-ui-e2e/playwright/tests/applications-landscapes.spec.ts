import { expect, test } from '@playwright/test'
import { ApplicationsLandscapesHarness } from '../harnesses/applications-landscapes.harness'

test.describe('Applications Landscapes', () => {
  let harness: ApplicationsLandscapesHarness

  test.beforeEach(async ({ page }) => {
    harness = new ApplicationsLandscapesHarness(page)

    // Use the configured baseURL and let app routing land on /applications.
    await page.goto('')
    await page.waitForLoadState('domcontentloaded')

    if (page.url().includes('/realms/')) {
      throw new Error(`Auth failed - redirected to Keycloak: ${page.url()}`)
    }

    await harness.waitForPage()
  })

  test('shows expected static texts', async () => {
    const title = await harness.getPageTitleText()
    expect(title).toMatch(/My Applications|APPLICATIONS_LANDSCAPES\.HEADER/)

    const searchPlaceholder = await harness.getSearchPlaceholder()
    expect(searchPlaceholder).toMatch(/Search|TABLE\.TOOLBAR\.SEARCH/)

    const portalAriaLabel = await harness.getPortalAriaLabel()
    expect(portalAriaLabel).toMatch(/APPLICATIONS_LANDSCAPES Header|APPLICATIONS_LANDSCAPES Seitenkopf/)
  })
})
