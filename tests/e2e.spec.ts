import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.waitForSelector('#navInner a');
});

test('由 trip.json 渲染出所有區塊', async ({ page }) => {
  await expect(page).toHaveTitle(/平溪/);
  const ids = await page.$$eval('section[id]', (els) => els.map((e) => e.id));
  expect(ids).toEqual(['map-sec', 'stays', 'day1', 'day2', 'day3', 'food', 'pack', 'tips', 'wish']);
  await expect(page.locator('.stop')).toHaveCount(12);
  await expect(page.locator('#checklist li')).toHaveCount(16);
  await expect(page.locator('.stay')).toHaveCount(2);
});

test('出發倒數會顯示狀態', async ({ page }) => {
  await expect(page.locator('#countdown')).not.toBeEmpty();
});

test('主題切換會套用 data-theme', async ({ page }) => {
  await page.click('#themeBtn');
  // View Transitions 會在下一個影格才套用屬性，故用 poll 等待
  await expect
    .poll(() => page.evaluate(() => document.documentElement.getAttribute('data-theme')))
    .toMatch(/^(dark|light)$/);
});

test('放天燈：加入許願牆、可刪除', async ({ page }) => {
  await page.fill('#wishText', '測試願望');
  await page.click('#wishBtn');
  await expect(page.locator('.wish-chip')).toHaveCount(1);
  await expect(page.locator('.wall-clear')).toBeVisible();
  await page.locator('.wish-x').first().click();
  await expect(page.locator('.wish-chip')).toHaveCount(0);
});

test('打包清單勾選會更新計數', async ({ page }) => {
  await page.locator('#checklist li input').first().check();
  await expect(page.locator('#ckCount')).toHaveText('1 / 16');
});

test('提示詞可複選組合成願望', async ({ page }) => {
  const chips = page.locator('#wishSuggests .sug:not(.dice)');
  await chips.nth(0).click();
  await chips.nth(1).click();
  const value = await page.inputValue('#wishText');
  expect(value.split('、').length).toBe(2);
});
