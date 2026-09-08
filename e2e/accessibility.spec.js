// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Accessibility basics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('document declares a language', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('page exposes banner, main and contentinfo landmarks', async ({ page }) => {
    await expect(page.getByRole('banner')).toHaveCount(1);
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('contentinfo')).toHaveCount(1);
  });

  test('skip link is the first link and becomes visible on focus', async ({ page, isMobile }) => {
    const first = page.locator('a').first();
    await expect(first).toHaveText('Skip to main content');
    await expect(first).toHaveAttribute('href', '#main');
    await expect(first).not.toBeInViewport();

    // Desktop: reach it the way a keyboard user would. WebKit's touch emulation has no
    // Tab key, so on mobile we focus it directly and check the same visible result.
    if (isMobile) await first.focus();
    else await page.keyboard.press('Tab');

    await expect(first).toBeFocused();
    await expect(first).toBeInViewport();
  });

  test('every image has alt text', async ({ page }) => {
    const missing = await page.locator('img').evaluateAll((imgs) =>
      imgs.filter((img) => !img.hasAttribute('alt')).map((img) => img.getAttribute('src'))
    );
    expect(missing).toEqual([]);
  });

  test('heading levels never skip', async ({ page }) => {
    const levels = await page.locator('h1, h2, h3, h4').evaluateAll((els) =>
      els.map((el) => Number(el.tagName[1]))
    );
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i] - levels[i - 1], `heading ${i} jumps from h${levels[i - 1]} to h${levels[i]}`).toBeLessThanOrEqual(1);
    }
  });

  test('every button has an accessible name', async ({ page }) => {
    const unnamed = await page.getByRole('button').evaluateAll((btns) =>
      btns.filter((b) => !(b.textContent || '').trim() && !b.getAttribute('aria-label')).length
    );
    expect(unnamed).toBe(0);
  });

  test('every section reachable from the nav has a labelled heading', async ({ page }) => {
    const sections = await page.locator('main section[id]').evaluateAll((els) =>
      els.map((s) => ({
        id: s.id,
        labelled: s.hasAttribute('aria-labelledby') || s.hasAttribute('aria-label'),
      }))
    );
    for (const s of sections) expect(s.labelled, `#${s.id} should be labelled`).toBe(true);
  });

  test('nav marks the section in view with aria-current', async ({ page }) => {
    await page.locator('#experience').scrollIntoViewIfNeeded();
    await expect(page.locator('.nav-links > a[aria-current="true"]')).toHaveAttribute('href', '#experience');
  });
});
