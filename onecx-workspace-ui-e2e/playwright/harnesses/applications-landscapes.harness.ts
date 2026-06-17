import { Locator, Page } from '@playwright/test';

export class ApplicationsLandscapesHarness {
  readonly page: Page;

  readonly host: Locator;
  readonly portalPage: Locator;
  readonly pageHeader: Locator;
  readonly pageTitle: Locator;
  readonly searchInput: Locator;
  readonly dataTable: Locator;

  constructor(page: Page) {
    this.page = page;

    this.host = page.locator('app-applications-landscapes');
    this.portalPage = page.locator('ocx-portal-page');
    this.pageHeader = page.locator('ocx-page-header');
    this.pageTitle = page.locator('#page-header');
    this.searchInput = page.locator('input.search-input');
    this.dataTable = page.locator('ocx-data-table[name="applicationsTable"]');
  }

  async waitForPage(): Promise<void> {
    await this.host.waitFor({ state: 'visible', timeout: 150000 });
    await this.pageHeader.waitFor({ state: 'visible', timeout: 150000 });
  }

  async getPageTitleText(): Promise<string> {
    return (await this.pageTitle.innerText()).trim();
  }

  async getSearchPlaceholder(): Promise<string> {
    return (await this.searchInput.getAttribute('placeholder')) ?? '';
  }

  async getPortalAriaLabel(): Promise<string> {
    return (await this.portalPage.getAttribute('aria-label')) ?? '';
  }
}
