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

  test('résumé is requested by email rather than served as a file', async ({ page }) => {
    await openMenuIfCollapsed(page);
    const link = page.locator('.nav-links').getByRole('link', { name: /Request résumé/ });
    await expect(link).toHaveAttribute('href', /^mailto:seve\.zavala@gmail\.com\?subject=/);
    // Nothing on the site should link to a résumé file.
    await expect(page.locator('a[href$=".pdf"]')).toHaveCount(0);
  });
});
