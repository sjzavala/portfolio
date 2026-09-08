// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Projects and external links', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('selected work shows five project cards', async ({ page }) => {
    await expect(page.locator('#work .work-card')).toHaveCount(5);
  });

  test('every project card links to a sjzavala repository', async ({ page }) => {
    const hrefs = await page.locator('#work .work-card').evaluateAll((els) => els.map((a) => a.getAttribute('href')));
    for (const href of hrefs) expect(href).toMatch(/^https:\/\/github\.com\/sjzavala\/[\w-]+$/);
  });

  test('project cards are numbered in pipeline order', async ({ page }) => {
    const eyebrows = await page.locator('#work .work-card .eyebrow').allTextContents();
    expect(eyebrows.map((t) => t.trim())).toEqual([
      'Project 01 · Produce',
      'Project 02 · Select',
      'Project 03 · Trust',
      'Project 04 · Measure',
      'Project 05 · Practice',
    ]);
  });

  test('personal projects section lists two projects with GitHub links', async ({ page }) => {
    const cards = page.locator('#personal .project-card');
    await expect(cards).toHaveCount(2);
    await expect(cards.locator('a[href*="github.com/sjzavala"]')).toHaveCount(2);
  });

  test('every external link opens in a new tab with rel=noopener', async ({ page }) => {
    const external = page.locator('a[href^="http"]');
    const count = await external.count();
    expect(count).toBeGreaterThan(5);
    for (let i = 0; i < count; i++) {
      const a = external.nth(i);
      await expect(a, `link ${i}`).toHaveAttribute('target', '_blank');
      await expect(a, `link ${i}`).toHaveAttribute('rel', /noopener/);
    }
  });

  test('contact section offers email, LinkedIn and GitHub', async ({ page }) => {
    const contact = page.locator('#contact');
    await expect(contact.getByRole('link', { name: /Email/ })).toHaveAttribute('href', 'mailto:seve.zavala@gmail.com');
    await expect(contact.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute('href', /linkedin\.com\/in\//);
    await expect(contact.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', 'https://github.com/sjzavala');
  });

  test('in-page anchors all resolve to an element', async ({ page }) => {
    const hashes = await page.locator('a[href^="#"]').evaluateAll((els) =>
      [...new Set(els.map((a) => a.getAttribute('href')))].filter((h) => h && h.length > 1)
    );
    for (const hash of hashes) {
      await expect(page.locator(hash), `${hash} should resolve`).toHaveCount(1);
    }
  });
});
