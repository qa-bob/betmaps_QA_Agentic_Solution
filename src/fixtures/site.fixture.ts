/**
 * src/fixtures/site.fixture.ts
 *
 * Extends Playwright's base `test` with pre-constructed page objects and the
 * loaded site config.  All test files should import {test, expect} from here
 * instead of from '@playwright/test' directly.
 *
 * Usage in test files:
 *   import { test, expect } from '@fixtures/site.fixture';
 */

import { test as base, expect } from '@playwright/test';
import { loadSiteConfig, type SiteConfig } from '@config/site-config.types';
import { HomePage } from '@pages/home.page';
import { NavigationPage } from '@pages/navigation.page';
import { ContactFormPage } from '@pages/contact.page';
import { BlogPage } from '@pages/blog.page';
import { SearchPage } from '@pages/search.page';
import { InquiriesPage } from '@pages/inquiries.page';

// ── Fixture type definitions ─────────────────────────────────────────────────

export interface Fixtures {
  /** Fully resolved site configuration loaded from site.config.json */
  siteConfig: SiteConfig;
  /** Pre-navigated HomePage page object */
  homePage: HomePage;
  /** NavigationPage page object (does not auto-navigate) */
  navigationPage: NavigationPage;
  /** ContactFormPage page object (does not auto-navigate) */
  contactPage: ContactFormPage;
  /** BlogPage page object — models the homepage blog listing section */
  blogPage: BlogPage;
  /** SearchPage page object — models the WordPress search functionality */
  searchPage: SearchPage;
  /** InquiriesPage page object — models the /2024/02/inquiries/ post */
  inquiriesPage: InquiriesPage;
}

// ── Extended test object ─────────────────────────────────────────────────────

export const test = base.extend<Fixtures>({
  /**
   * siteConfig — loaded once per worker from site.config.json.
   * Shared across all fixtures in the same test.
   */
  siteConfig: async ({}, use) => {
    const config = loadSiteConfig();
    await use(config);
  },

  /**
   * homePage — constructs HomePage and navigates to the site root.
   * Waits for domcontentloaded before handing control to the test.
   */
  homePage: async ({ page, siteConfig }, use) => {
    const homePage = new HomePage(page, siteConfig);
    await homePage.navigate();
    await use(homePage);
  },

  /**
   * navigationPage — constructs NavigationPage without navigating.
   * Tests that need to be on a specific page should call navigate() themselves.
   */
  navigationPage: async ({ page, siteConfig }, use) => {
    const navigationPage = new NavigationPage(page, siteConfig);
    await use(navigationPage);
  },

  /**
   * contactPage — constructs ContactFormPage without navigating.
   * Tests should navigate to the appropriate page first.
   */
  contactPage: async ({ page, siteConfig }, use) => {
    const contactPage = new ContactFormPage(page, siteConfig);
    await use(contactPage);
  },

  /**
   * blogPage — constructs BlogPage and navigates to the homepage.
   * Homepage contains the "From Our Blog" / "Latest Updates" sections.
   */
  blogPage: async ({ page, siteConfig }, use) => {
    const blogPage = new BlogPage(page, siteConfig);
    await blogPage.navigate();
    await use(blogPage);
  },

  /**
   * searchPage — constructs SearchPage and navigates to the homepage.
   * The search form is available on all pages; homepage is the entry point.
   */
  searchPage: async ({ page, siteConfig }, use) => {
    const searchPage = new SearchPage(page, siteConfig);
    await searchPage.navigate();
    await use(searchPage);
  },

  /**
   * inquiriesPage — constructs InquiriesPage without navigating.
   * Tests should call inquiriesPage.navigateToPage() to load the post.
   */
  inquiriesPage: async ({ page, siteConfig }, use) => {
    const inquiriesPage = new InquiriesPage(page, siteConfig);
    await use(inquiriesPage);
  },
});

// Re-export expect so tests only need one import source
export { expect };
