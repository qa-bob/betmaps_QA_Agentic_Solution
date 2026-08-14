import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import type { SiteConfig } from '@config/site-config.types';

export const INQUIRIES_PATH = '/2024/02/inquiries/';

export class InquiriesPage extends BasePage {
  readonly postHeading: Locator;
  readonly postMeta: Locator;
  readonly postDate: Locator;
  readonly postContent: Locator;
  readonly categoryLink: Locator;
  readonly contactEmailLink: Locator;
  readonly backToHomeLink: Locator;

  constructor(page: Page, config: SiteConfig) {
    super(page, config);
    // WordPress single post selectors (Catch Shop Dark theme)
    this.postHeading = page.locator('h1.entry-title, h1').first();
    this.postMeta = page.locator('.entry-meta, .post-meta').first();
    this.postDate = page.locator('time.entry-date, time[datetime], .entry-meta time').first();
    this.postContent = page.locator('.entry-content, .post-content').first();
    this.categoryLink = page.locator('.cat-links a, .entry-meta .cat-links a, a[rel="category tag"]').first();
    this.contactEmailLink = page.locator('a[href*="mailto:isaac"], a[href*="isaac@betmaps.com"]').first();
    this.backToHomeLink = page.locator('a[href="' + config.url + '"], .site-branding a').first();
  }

  async navigateToPage(): Promise<void> {
    await this.page.goto(this.url + INQUIRIES_PATH, { waitUntil: 'domcontentloaded' });
  }

  async getHeadingText(): Promise<string> {
    return (await this.postHeading.textContent())?.trim() ?? '';
  }

  async getPostDateText(): Promise<string> {
    return (await this.postDate.textContent())?.trim() ?? '';
  }

  async getDatetimeAttr(): Promise<string | null> {
    return this.postDate.getAttribute('datetime');
  }
}
