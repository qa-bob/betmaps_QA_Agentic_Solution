import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import type { SiteConfig } from '@config/site-config.types';

export class BlogPage extends BasePage {
  readonly latestUpdatesHeading: Locator;
  readonly fromOurBlogHeading: Locator;
  readonly postCards: Locator;
  readonly firstPostTitle: Locator;
  readonly firstPostLink: Locator;
  readonly firstPostDate: Locator;
  readonly firstPostAuthorLink: Locator;

  constructor(page: Page, config: SiteConfig) {
    super(page, config);
    // WordPress Catch Shop Dark theme — blog section headings
    this.latestUpdatesHeading = page.locator('h2, h3, .widget-title').filter({ hasText: /latest updates/i });
    this.fromOurBlogHeading = page.locator('h2, h3, .widget-title').filter({ hasText: /from our blog/i });
    // WordPress standard post selectors: article.post / article.hentry / .hentry
    this.postCards = page.locator('article.post, article.hentry, .hentry');
    this.firstPostTitle = page.locator('article .entry-title, .hentry .entry-title').first();
    this.firstPostLink = page.locator('article .entry-title a, .hentry .entry-title a').first();
    this.firstPostDate = page.locator('article time.entry-date, article time, .hentry time').first();
    this.firstPostAuthorLink = page.locator('article .author a, .hentry .author a, .entry-meta a[rel="author"]').first();
  }

  async getPostCount(): Promise<number> {
    return this.postCards.count();
  }

  async getFirstPostTitleText(): Promise<string> {
    return (await this.firstPostTitle.textContent())?.trim() ?? '';
  }

  async clickFirstPost(): Promise<void> {
    await this.firstPostLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getFirstPostUrl(): Promise<string> {
    return (await this.firstPostLink.getAttribute('href')) ?? '';
  }
}
