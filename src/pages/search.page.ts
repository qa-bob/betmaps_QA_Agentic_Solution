import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import type { SiteConfig } from '@config/site-config.types';

export class SearchPage extends BasePage {
  // The Catch Shop Dark WordPress theme hides the search input behind a toggle;
  // input[name="s"] exists in the DOM but is not visible on the homepage.
  readonly searchInputInDom: Locator;
  readonly searchResults: Locator;
  readonly noResultsBlock: Locator;
  readonly resultsHeading: Locator;

  constructor(page: Page, config: SiteConfig) {
    super(page, config);
    // WordPress always uses input[name="s"] — exists in DOM even when hidden
    this.searchInputInDom = page.locator('input[name="s"], input[type="search"]').first();
    // Results: standard WordPress post articles on the search results page
    this.searchResults = page.locator('article.post, article.hentry, .hentry');
    // WordPress no-results template
    this.noResultsBlock = page.locator('.no-results, .not-found, section.no-results');
    // "Search Results for" heading on results page
    this.resultsHeading = page.locator('.page-title, h1.page-title, .search-title');
  }

  /** True when the search input element exists anywhere in the DOM (even if hidden). */
  async searchInputExistsInDom(): Promise<boolean> {
    return (await this.searchInputInDom.count()) > 0;
  }

  /**
   * Navigate directly to the WordPress search results URL for the given query.
   * This is reliable regardless of whether the search form is visually accessible,
   * since the Catch Shop Dark theme hides the input behind a toggle by default.
   */
  async searchByUrl(query: string): Promise<void> {
    const searchUrl = `${this.url}/?s=${encodeURIComponent(query)}`;
    await this.page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
  }

  async getResultCount(): Promise<number> {
    return this.searchResults.count();
  }

  async isOnSearchResultsPage(): Promise<boolean> {
    const url = this.page.url();
    return url.includes('?s=') || url.includes('/?s=');
  }

  async hasNoResultsMessage(): Promise<boolean> {
    const count = await this.noResultsBlock.count();
    if (count === 0) return false;
    return this.noResultsBlock.isVisible();
  }
}
