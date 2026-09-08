// @ts-check
const { test, expect } = require('@playwright/test');

const SECTIONS = ['about', 'expertise', 'qa-lab', 'experience', 'work', 'approach', 'contact'];

/** Opens the mobile menu when the toggle is visible; no-op on desktop. */
async function openMenuIfCollapsed(page) {
  const toggle = page.locator('.nav-toggle');
  if (await toggle.isVisible()) {
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  }
}

test.describe('Main navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('navigation landmark is labelled', async ({ page }) => {
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  });

  test('every nav link targets a section that exists', async ({ page }) => {
    const hrefs = await page.locator('.nav-links > a[href^="#"]').evaluateAll((els) =>
      els.map((a) => a.getAttribute('href'))
    );
    expect(hrefs).toEqual(SECTIONS.map((id) => `#${id}`));
    for (const href of hrefs) {
      await expect(page.locator(href), `${href} should exist`).toHaveCount(1);
    }
  });

  for (const id of SECTIONS) {
    test(`clicking "${id}" scrolls that section into view`, async ({ page }) => {
      await openMenuIfCollapsed(page);
      await page.locator(`.nav-links > a[href="#${id}"]`).click();
      await expect(page.locator(`#${id}`)).toBeInViewport();
    });
  }

  test('brand link returns to the top of the page', async ({ page }) => {
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.locator('.brand').click();
    await expect(page.locator('.hero')).toBeInViewport();
  });

  test('résumé link opens a PDF in a new tab', async ({ page }) => {
    await openMenuIfCollapsed(page);
    const link = page.locator('.nav-links').getByRole('link', { name: /Résumé/ });
    await expect(link).toHaveAttribute('href', /\.pdf$/);
    await expect(link).toHaveAttribute('target', '_blank');
    const href = await link.getAttribute('href');
    const res = await page.request.get(href);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('pdf');
  });
});
