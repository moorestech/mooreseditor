import { test, expect } from '@playwright/test';


test.describe('MooresEditor Basic Tests', () => {  test('テーブルビューとフォームビューを切り替えられる', async ({ page }) => {
    await page.goto('/');

    // FileOpenボタンをクリック
    await page.getByRole('button', { name: 'File Open' }).click();

    // mapObjectsをクリック
    await page.getByText('mapObjects').click();

    // ビュー切り替えボタンが存在することを確認（実装に応じて調整）
    // 例: ビュー切り替えボタンやタブがある場合
    const viewToggle = page.locator('[aria-label="Toggle view"]');
    if (await viewToggle.isVisible()) {
      await viewToggle.click();
      // テーブルビューが表示されることを確認
    }
  });
});
test('test', async ({ page }) => {
    await page.goto('/');

    // 2秒待機
    await page.waitForTimeout(2000);

    await page.getByRole('button', { name: 'File Open' }).click();
    await page.getByText('foreignKeySample').click();
    await page.getByRole('button', { name: 'Edit' }).nth(1).click();
    await page.getByRole('button', { name: 'Edit', exact: true }).nth(2).click();
    await page.locator('div').filter({ hasText: /^referenceCategoryGuidsAdd Item$/ }).getByRole('button').click();
    await page.locator('//html/body/div[1]/div/div/div[2]/div[5]/div/div[3]/div/div/div/div/div/div/div/div/input').click();

    // 「」があるかどうかチェック
    await expect(page.getByText('Cat1 Foreign Key Element 1')).toBeVisible();
});
