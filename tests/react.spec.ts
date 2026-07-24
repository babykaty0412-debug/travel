import { test, expect } from '@playwright/test';

test.describe('React 版', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('react/');
    await page.waitForSelector('#navInner a');
  });

  test('由 trip.json 渲染出所有區塊', async ({ page }) => {
    await expect(page).toHaveTitle(/React/);
    const ids = await page.$$eval('section[id]', (els) => els.map((e) => e.id));
    expect(ids).toEqual(['map-sec', 'stays', 'day1', 'day2', 'day3', 'food', 'pack', 'tips', 'wish']);
    await expect(page.locator('.stop')).toHaveCount(12);
    await expect(page.locator('#checklist li')).toHaveCount(16);
  });

  test('放天燈與打包（hooks + localStorage）', async ({ page }) => {
    await page.fill('#wishText', 'React 測試願望');
    await page.click('#wishBtn');
    await expect(page.locator('.wish-chip')).toHaveCount(1);
    await page.locator('.wish-x').first().click();
    await expect(page.locator('.wish-chip')).toHaveCount(0);

    await page.locator('#checklist li input').first().check();
    await expect(page.locator('#ckCount')).toHaveText('1 / 16');
  });
});
