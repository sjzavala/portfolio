// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Homepage smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has the right title', async ({ page }) => {
    await expect(page).toHaveTitle(/Seve Zavala/);
  });

  test('renders exactly one h1 with the name', async ({ page }) => {
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText('Seve Zavala');
  });

  test('shows the role eyebrow above the name', async ({ page }) => {
    await expect(page.locator('.hero .eyebrow')).toContainText(/Senior SDET/i);
  });

  test('hero tagline is visible', async ({ page }) => {
    await expect(page.locator('.hero-tagline')).toContainText(/actually trust/);
  });

  test('"About me" call to action points at the about section', async ({ page }) => {
    const cta = page.locator('.hero').getByRole('link', { name: /About me/ });
    await expect(cta).toHaveAttribute('href', '#about');
    await cta.click();
    await expect(page.locator('#about')).toBeInViewport();
  });

  test('GitHub call to action opens the sjzavala profile in a new tab', async ({ page }) => {
    const cta = page.locator('.hero').getByRole('link', { name: /GitHub/ });
    await expect(cta).toHaveAttribute('href', 'https://github.com/sjzavala');
    await expect(cta).toHaveAttribute('target', '_blank');
  });

  test('experience timeline leads with the current role', async ({ page }) => {
    const first = page.locator('.timeline-item').first();
    await expect(first.locator('.timeline-date')).toContainText('Now');
    await expect(first.getByRole('heading', { level: 3 })).toHaveText('Qualia');
    await expect(first.locator('.role')).toContainText('Senior SDET');
  });

  test('portrait loads with descriptive alt text', async ({ page }) => {
    const img = page.locator('.portrait');
    await expect(img).toHaveAttribute('alt', /Seve Zavala/);
    const naturalWidth = await img.evaluate((el) => /** @type {HTMLImageElement} */ (el).naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  });
});
