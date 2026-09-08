// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Responsive layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page never scrolls horizontally', async ({ page }) => {
    const overflow = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(overflow.scroll).toBeLessThanOrEqual(overflow.client);
  });

  test('hero and portrait are visible on load', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('.portrait')).toBeVisible();
  });

  test('menu toggle is shown only on narrow viewports', async ({ page, isMobile }) => {
    const toggle = page.locator('.nav-toggle');
    if (isMobile) await expect(toggle).toBeVisible();
    else await expect(toggle).toBeHidden();
  });

  test('mobile menu opens, closes on Escape, and closes after a link click', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile menu only exists on narrow viewports');
    const toggle = page.locator('.nav-toggle');
    const links = page.locator('#nav-links');

    await expect(links).toBeHidden();
    await toggle.click();
    await expect(links).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(links).toBeHidden();

    await toggle.click();
    await links.getByRole('link', { name: 'Expertise' }).click();
    await expect(links).toBeHidden();
    await expect(page.locator('#expertise')).toBeInViewport();
  });

  test('expertise cards stack in one column on mobile and four on desktop', async ({ page, isMobile }) => {
    const columns = await page.locator('#expertise .card-grid').evaluate((el) =>
      getComputedStyle(el).gridTemplateColumns.split(' ').length
    );
    expect(columns).toBe(isMobile ? 1 : 4);
  });

  test('timeline entries stay readable on every viewport', async ({ page }) => {
    const items = page.locator('.timeline-item');
    await expect(items).toHaveCount(3);
    await items.last().scrollIntoViewIfNeeded();
    for (let i = 0; i < 3; i++) {
      const box = await items.nth(i).boundingBox();
      expect(box && box.width).toBeGreaterThan(200);
    }
  });

  test('sticky header stays at the top after scrolling', async ({ page }) => {
    await page.locator('#work').scrollIntoViewIfNeeded();
    const top = await page.locator('.site-header').evaluate((el) => el.getBoundingClientRect().top);
    expect(Math.round(top)).toBe(0);
  });
});
