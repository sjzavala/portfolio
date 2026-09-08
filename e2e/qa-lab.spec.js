// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('QA Lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#qa-lab').scrollIntoViewIfNeeded();
  });

  test('recorded results are loaded on the page', async ({ page }) => {
    const totals = await page.evaluate(() => window.LAB_RESULTS && window.LAB_RESULTS.totals);
    expect(totals).toBeTruthy();
    expect(totals.tests).toBeGreaterThan(0);
  });

  test('stat tiles reflect the recorded totals', async ({ page }) => {
    const data = await page.evaluate(() => window.LAB_RESULTS);
    await expect(page.locator('[data-lab="tests"]')).toHaveText(String(data.totals.tests));
    await expect(page.locator('[data-lab="browsers"]')).toHaveText(String(data.projects.length));
    const ran = data.totals.tests - data.totals.skipped;
    const pct = Math.round((data.totals.passed / ran) * 100);
    await expect(page.locator('[data-lab="passing"]')).toHaveText(`${pct}%`);
  });

  test('one group is rendered per spec file and counts add up', async ({ page }) => {
    const data = await page.evaluate(() => window.LAB_RESULTS);
    const groups = page.locator('.lab-group');
    await expect(groups).toHaveCount(data.groups.length);
    const sum = data.groups.reduce((n, g) => n + g.tests.length, 0);
    expect(sum).toBe(data.totals.tests);
  });

  test('a group expands to list its tests and collapses again', async ({ page }) => {
    const btn = page.locator('.lab-group-btn').first();
    const panelId = await btn.getAttribute('aria-controls');
    const panel = page.locator(`#${panelId}`);

    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();

    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();
    expect(await panel.locator('li').count()).toBeGreaterThan(0);

    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();
  });

  test('replay button streams the recorded run into the terminal', async ({ page }) => {
    const log = page.locator('[data-lab="log"]');
    const btn = page.getByRole('button', { name: /Replay last run/ });

    await expect(log).toContainText('Waiting for replay');
    await btn.click();
    await expect(btn).toBeDisabled();

    await expect(log).toHaveAttribute('data-state', 'done', { timeout: 30_000 });
    await expect(btn).toBeEnabled();

    const data = await page.evaluate(() => window.LAB_RESULTS);
    await expect(log).toContainText(`${data.totals.passed} passed`);
    await expect(log.locator('.log-pass')).toHaveCount(data.totals.passed);
  });

  test('links to the suite on GitHub', async ({ page }) => {
    const link = page.locator('#qa-lab').getByRole('link', { name: /View Playwright suite/ });
    await expect(link).toHaveAttribute('href', 'https://github.com/sjzavala/portfolio/tree/main/e2e');
  });
});
