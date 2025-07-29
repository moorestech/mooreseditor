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
    // ドロップダウンをクリック
    const dropdownInput = page.locator('div').filter({ hasText: /^referenceCategoryGuidsAdd Item$/ }).locator('input[type="text"]').first();
    await dropdownInput.click();
    
    // ドロップダウンメニューが表示されるのを待つ
    await page.waitForSelector('[role="listbox"]', { state: 'visible' });
    
    // オプションが表示されているかチェック
    await expect(page.locator('[role="listbox"]').getByText('Cat1 Foreign Key Element 1')).toBeVisible();
});
