/**
 * tests/functional/blog.spec.ts
 *
 * Functional tests for BetMaps' blog/news listing on the homepage.
 * Covers the "Latest Updates" / "From Our Blog" section, post cards,
 * metadata, and navigation to individual posts.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Blog Listing @functional', () => {
  // blogPage fixture auto-navigates to homepage

  // ── Section visibility ──────────────────────────────────────────────────────

  test('homepage displays a blog or updates section @functional', async ({ blogPage, page }) => {
    const latestCount = await blogPage.latestUpdatesHeading.count();
    const fromBlogCount = await blogPage.fromOurBlogHeading.count();

    // At least one of the section headings should exist
    const hasSection = latestCount > 0 || fromBlogCount > 0;

    if (!hasSection) {
      // Fallback: check for any article/post element on the page
      const postCount = await blogPage.postCards.count();
      expect(
        postCount,
        'Homepage should show either a blog section heading or at least one post card'
      ).toBeGreaterThan(0);
      return;
    }

    expect(hasSection, 'Homepage should display a "Latest Updates" or "From Our Blog" section').toBeTruthy();
  });

  // ── Post listing ────────────────────────────────────────────────────────────

  test('at least one blog post is listed on the homepage @functional', async ({ blogPage }) => {
    const count = await blogPage.getPostCount();
    expect(count, 'Homepage should list at least one blog post').toBeGreaterThan(0);
  });

  test('first blog post has a non-empty title @functional', async ({ blogPage }) => {
    const count = await blogPage.getPostCount();
    if (count === 0) {
      test.skip(true, 'No blog posts found on homepage');
      return;
    }

    const title = await blogPage.getFirstPostTitleText();
    expect(title.length, 'First blog post title should not be empty').toBeGreaterThan(0);
  });

  test('first blog post title link has a valid href @functional', async ({ blogPage }) => {
    const count = await blogPage.getPostCount();
    if (count === 0) {
      test.skip(true, 'No blog posts found on homepage');
      return;
    }

    const href = await blogPage.getFirstPostUrl();
    expect(href, 'First post title should be a link with an href').toBeTruthy();
    expect(href, 'Post link should point to the betmaps.com domain').toContain('betmaps.com');
  });

  // ── Post date metadata ──────────────────────────────────────────────────────

  test('first blog post shows a publish date @functional', async ({ blogPage }) => {
    const count = await blogPage.getPostCount();
    if (count === 0) {
      test.skip(true, 'No blog posts found on homepage');
      return;
    }

    const dateVisible = await blogPage.firstPostDate.isVisible();
    test.skip(!dateVisible, 'Post date element not visible');

    const dateText = (await blogPage.firstPostDate.textContent())?.trim() ?? '';
    expect(dateText.length, 'Post date should have visible text').toBeGreaterThan(0);
  });

  // ── Post navigation ─────────────────────────────────────────────────────────

  test('clicking a blog post navigates to the post page @functional', async ({ blogPage, page, siteConfig }) => {
    const count = await blogPage.getPostCount();
    if (count === 0) {
      test.skip(true, 'No blog posts found on homepage');
      return;
    }

    const postUrl = await blogPage.getFirstPostUrl();
    await blogPage.clickFirstPost();

    // Should be on a post-specific URL, not still on the homepage root
    const currentUrl = page.url();
    expect(
      currentUrl,
      `Clicking the post should navigate away from the homepage. Current URL: ${currentUrl}`
    ).not.toBe(siteConfig.url + '/');
    expect(
      currentUrl,
      'Post URL should be under the betmaps.com domain'
    ).toContain('betmaps.com');

    if (postUrl) {
      // Resolve possible trailing-slash differences
      const normalizedPost = postUrl.replace(/\/$/, '');
      const normalizedCurrent = currentUrl.replace(/\/$/, '');
      expect(normalizedCurrent, `Should land on the expected post URL: ${postUrl}`).toBe(normalizedPost);
    }
  });

  test('individual post page has an h1 heading @functional', async ({ blogPage, page }) => {
    const count = await blogPage.getPostCount();
    if (count === 0) {
      test.skip(true, 'No blog posts found on homepage');
      return;
    }

    await blogPage.clickFirstPost();

    const h1 = page.locator('h1').first();
    await expect(h1, 'Post page should have an h1 heading').toBeVisible();

    const headingText = (await h1.textContent())?.trim() ?? '';
    expect(headingText.length, 'Post page h1 should have visible text').toBeGreaterThan(0);
  });

  // ── Author page reachability ─────────────────────────────────────────────────

  test('author archive page is reachable @functional', async ({ page, siteConfig }) => {
    const response = await page.request.get(`${siteConfig.url}/author/betmaps/`, { timeout: 15_000 });
    expect(
      response.status(),
      `Author archive page should return HTTP 200, got ${response.status()}`
    ).toBe(200);
  });
});
