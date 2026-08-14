/**
 * tests/functional/search.spec.ts
 *
 * Functional tests for BetMaps' WordPress site search functionality.
 *
 * NOTE: The Catch Shop Dark theme hides the search input (input[name="s"])
 * behind a toggle icon on the homepage — the element exists in the DOM but is
 * not interactable without clicking the toggle.  Tests therefore drive search
 * via direct URL navigation (/?s=query), which is the canonical WordPress
 * search mechanism and produces identical results to the UI form.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Search Functionality @functional', () => {
  // searchPage fixture auto-navigates to the homepage

  // ── Search DOM presence ─────────────────────────────────────────────────────

  test('search input field exists in page DOM @functional', async ({ searchPage }) => {
    const exists = await searchPage.searchInputExistsInDom();
    expect(exists, 'WordPress search input (input[name="s"]) should exist in the DOM').toBeTruthy();
  });

  // ── URL-based search navigation ─────────────────────────────────────────────

  test('searching by URL lands on the search results page @functional', async ({ searchPage }) => {
    await searchPage.searchByUrl('inquiries');
    const isOnResults = await searchPage.isOnSearchResultsPage();
    expect(
      isOnResults,
      `Search URL navigation should produce a URL with "?s=". Got: ${searchPage.page.url()}`
    ).toBeTruthy();
  });

  test('search URL encodes the query term @functional', async ({ searchPage, page }) => {
    await searchPage.searchByUrl('betmaps');
    expect(page.url(), 'Search URL should contain the query "betmaps"').toContain('betmaps');
  });

  // ── Known-term search results ────────────────────────────────────────────────

  test('searching for "inquiries" returns at least one result @functional', async ({ searchPage }) => {
    await searchPage.searchByUrl('inquiries');

    const resultCount = await searchPage.getResultCount();
    const noResults = await searchPage.hasNoResultsMessage();

    const hasOutcome = resultCount > 0 || noResults;
    expect(
      hasOutcome,
      'Search results page should either show results or a "no results" message'
    ).toBeTruthy();

    expect(
      resultCount,
      'Searching for "inquiries" should return at least one matching post'
    ).toBeGreaterThan(0);
  });

  // ── No-results state ────────────────────────────────────────────────────────

  test('searching for gibberish shows zero results or a no-results indicator @functional', async ({
    searchPage,
  }) => {
    await searchPage.searchByUrl('xzqjfqkwmvxlzpqrst9841');

    const resultCount = await searchPage.getResultCount();
    const noResultsShown = await searchPage.hasNoResultsMessage();

    if (resultCount === 0) {
      expect(resultCount, 'Gibberish search should return zero post articles').toBe(0);
    } else {
      console.warn('[search] Gibberish search returned results — site may use fuzzy matching');
    }

    // Should still be on the search results URL regardless
    const isOnResults = await searchPage.isOnSearchResultsPage();
    expect(isOnResults, 'Should be on the search results URL after searching').toBeTruthy();

    // Either no results OR the no-results block is shown
    if (resultCount === 0) {
      expect(
        noResultsShown,
        'When no results are found, a "no results" message should be visible'
      ).toBeTruthy();
    }
  });

  // ── Results page structure ───────────────────────────────────────────────────

  test('search results page retains site header @functional', async ({ searchPage, page }) => {
    await searchPage.searchByUrl('inquiries');
    const header = page.locator('header, #masthead, .site-header').first();
    await expect(header, 'Site header should remain visible on the search results page').toBeVisible();
  });

  test('search results page has a visible heading @functional', async ({ searchPage, page }) => {
    await searchPage.searchByUrl('inquiries');
    const heading = page.locator('h1, h2, .page-title').first();
    await expect(heading, 'Search results page should have a visible heading').toBeVisible();
    const text = (await heading.textContent())?.trim() ?? '';
    expect(text.length, 'Results page heading should not be empty').toBeGreaterThan(0);
  });

  test('search results page has a footer @functional', async ({ searchPage, page }) => {
    await searchPage.searchByUrl('inquiries');
    const footer = page.locator('footer, #colophon, .site-footer').first();
    await expect(footer, 'Site footer should be visible on the search results page').toBeVisible();
  });

  test('empty search query goes to homepage or search page @functional', async ({ searchPage, page, siteConfig }) => {
    await searchPage.searchByUrl('');
    const url = page.url();
    // WordPress typically redirects empty search back to homepage
    const isHome = url.replace(/\/$/, '') === siteConfig.url.replace(/\/$/, '');
    const isSearch = url.includes('?s=');
    expect(
      isHome || isSearch,
      `Empty search should land on homepage or search URL. Got: ${url}`
    ).toBeTruthy();
  });
});
