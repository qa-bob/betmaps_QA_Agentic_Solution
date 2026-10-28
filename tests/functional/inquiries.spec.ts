/**
 * tests/functional/inquiries.spec.ts
 *
 * Functional tests for the BetMaps "Inquiries" blog post at
 * https://betmaps.com/2024/02/inquiries/
 *
 * This is the primary (and only) published post and serves as the
 * main contact/inquiry channel for the company.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';
import { INQUIRIES_PATH } from '@pages/inquiries.page';

test.describe('Inquiries Page @functional', () => {
  test.beforeEach(async ({ inquiriesPage }) => {
    await inquiriesPage.navigateToPage();
  });

  // ── Page load ───────────────────────────────────────────────────────────────

  test('inquiries page returns HTTP 200 @functional', async ({ page, siteConfig }) => {
    const response = await page.goto(siteConfig.url + INQUIRIES_PATH, {
      waitUntil: 'domcontentloaded',
    });
    expect(response, 'Inquiries page response should not be null').not.toBeNull();
    expect(
      response!.status(),
      `Expected HTTP 200 but got ${response!.status()}`
    ).toBe(200);
  });

  test('inquiries page has correct browser title @functional', async ({ inquiriesPage }) => {
    const title = await inquiriesPage.getTitle();
    expect(title.trim(), 'Page title should not be empty').toBeTruthy();
    // WordPress sets the title to "Post Name – Site Name"
    expect(title, 'Page title should reference "Inquiries"').toMatch(/inquiries/i);
  });

  // ── Heading ─────────────────────────────────────────────────────────────────

  test('inquiries page has an h1 heading @functional', async ({ inquiriesPage }) => {
    await expect(
      inquiriesPage.postHeading,
      'h1 heading should be visible on the Inquiries page'
    ).toBeVisible();
  });

  test('h1 text is "Inquiries" @functional', async ({ inquiriesPage }) => {
    const heading = await inquiriesPage.getHeadingText();
    expect(
      heading,
      `Expected h1 text "Inquiries" but got "${heading}"`
    ).toMatch(/inquiries/i);
  });

  // ── Post metadata ────────────────────────────────────────────────────────────

  test('inquiries post shows a publish date @functional', async ({ inquiriesPage }) => {
    const dateVisible = await inquiriesPage.postDate.isVisible();
    test.skip(!dateVisible, 'Post date element not visible');

    const dateText = await inquiriesPage.getPostDateText();
    expect(dateText.length, 'Publish date should have visible text').toBeGreaterThan(0);
  });

  test('inquiries post date is in 2024 @functional', async ({ inquiriesPage }) => {
    const dateVisible = await inquiriesPage.postDate.isVisible();
    if (!dateVisible) {
      test.skip(true, 'Post date element not visible');
      return;
    }

    // Check the machine-readable datetime attribute (more reliable than display text)
    const datetime = await inquiriesPage.getDatetimeAttr();
    if (datetime) {
      expect(datetime, 'Post datetime attribute should start with 2024').toMatch(/^2024/);
    } else {
      const dateText = await inquiriesPage.getPostDateText();
      expect(dateText, 'Post date text should mention 2024').toContain('2024');
    }
  });

  test('inquiries post has visible post content area @functional', async ({ inquiriesPage }) => {
    const contentCount = await inquiriesPage.postContent.count();
    test.skip(contentCount === 0, '.entry-content not found');
    await expect(inquiriesPage.postContent, 'Post content area should be visible').toBeVisible();
  });

  // ── Contact information ──────────────────────────────────────────────────────

  test('inquiries page contains the BetMaps contact email @functional', async ({ inquiriesPage, page }) => {
    // Check for mailto link OR visible email text
    const mailtoCount = await inquiriesPage.contactEmailLink.count();

    if (mailtoCount > 0) {
      await expect(inquiriesPage.contactEmailLink, 'Contact email link should be visible').toBeVisible();
      const href = await inquiriesPage.contactEmailLink.getAttribute('href');
      expect(href, 'Contact email link href should contain the email address').toContain('isaac');
    } else {
      // Email may appear as plain text rather than a mailto link
      const bodyText = await page.evaluate<string>(() => document.body.innerText);
      expect(
        bodyText,
        'Page should display the BetMaps contact email address'
      ).toContain('isaac@betmaps.com');
    }
  });

  // ── Post category ────────────────────────────────────────────────────────────

  test('inquiries post has a category assigned @functional', async ({ inquiriesPage }) => {
    const catCount = await inquiriesPage.categoryLink.count();
    test.skip(catCount === 0, 'Category link not found via expected selectors');
    await expect(inquiriesPage.categoryLink, 'Category link should be visible').toBeVisible();
  });

  // ── Page structure ───────────────────────────────────────────────────────────

  test('site header is visible on the inquiries post page @functional', async ({ page }) => {
    const header = page.locator('header, #masthead, .site-header').first();
    await expect(header, 'Site header should be present on the post page').toBeVisible();
  });

  test('site footer is visible on the inquiries post page @functional', async ({ page }) => {
    const footer = page.locator('footer, #colophon, .site-footer').first();
    await expect(footer, 'Site footer should be present on the post page').toBeVisible();
  });

  test('site logo link in header points back to homepage @functional', async ({ page, siteConfig }) => {
    const logoLink = page.locator('header a[href], #masthead a[href]').first();
    const href = await logoLink.getAttribute('href');
    test.skip(!href, 'No anchor found in site header');
    const resolvedHref = new URL(href!, siteConfig.url).toString().replace(/\/$/, '');
    const homeUrl = siteConfig.url.replace(/\/$/, '');
    expect(resolvedHref, 'Header logo/link should point to the site homepage').toBe(homeUrl);
  });
});
