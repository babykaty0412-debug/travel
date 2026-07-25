import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// 以 reduced-motion 掃描：讓捲動揭示動畫直接呈現最終狀態（不透明），
// 避免在淡入過程中量到半透明文字造成的假性對比失敗
test.use({ reducedMotion: 'reduce' });

// 對兩個版本跑 axe-core 無障礙檢測，serious/critical 違規視為失敗
for (const { name, path } of [
  { name: 'Vanilla', path: './' },
  { name: 'React', path: 'react/' },
]) {
  test(`無障礙檢測（${name}）`, async ({ page }) => {
    await page.goto(path);
    await page.waitForSelector('#navInner a');
    await page.waitForTimeout(400); // 讓版面與揭示狀態穩定，避免掃描時機造成 flaky
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    const summary = serious.map((v) => `${v.id} (${v.nodes.length})`).join(', ');
    expect(serious, `serious/critical 違規：${summary}`).toEqual([]);
  });
}
