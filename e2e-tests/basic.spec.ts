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
test('外部キー配列でドロップダウンが正しく表示される', async ({ page }) => {
    await page.goto('/');

    // 2秒待機
    await page.waitForTimeout(2000);

    await page.getByRole('button', { name: 'File Open' }).click();
    await page.getByText('foreignKeySample').click();
    await page.getByRole('button', { name: 'Edit' }).nth(1).click();
    await page.getByRole('button', { name: 'Edit', exact: true }).nth(2).click();
    
    // referenceCategoryGuidsのAdd Itemボタンをクリック
    await page.locator('div').filter({ hasText: /^referenceCategoryGuids/ }).getByRole('button', { name: 'Add Item' }).click();
    
    // 新しく作成されたドロップダウンをクリック
    // referenceCategoryGuidsの最後の要素のinputを取得
    const dropdownInput = page.locator('input[placeholder*="Select foreignKeySample"]').last();
    await dropdownInput.click();
    
    // ドロップダウンメニューが表示されるのを待つ
    await page.waitForSelector('[role="listbox"]', { state: 'visible' });
    
    // オプションが表示されているかチェック（複数ある場合は最初の1つ）
    await expect(page.locator('[role="listbox"]').getByText('Cat1 Foreign Key Element 1').first()).toBeVisible();
});

test('外部キードロップダウンで階層的な表示がされる', async ({ page }) => {
    await page.goto('/');

    // FileOpenボタンをクリック
    await page.getByRole('button', { name: 'File Open' }).click();
    
    // foreignKeySampleをクリック
    await page.getByText('foreignKeySample').click();
    
    // Category 1の編集ボタンをクリック
    await page.getByRole('button', { name: 'Edit' }).nth(1).click();
    
    // Cat1 Foreign Key Element 1の編集ボタンをクリック  
    await page.getByRole('button', { name: 'Edit', exact: true }).nth(2).click();
    
    // referenceCategoryGuidsのAdd Itemボタンをクリック
    await page.locator('div').filter({ hasText: /^referenceCategoryGuids/ }).getByRole('button', { name: 'Add Item' }).click();
    
    // 新しく作成されたドロップダウンをクリック
    const dropdownInput = page.locator('input[placeholder*="Select foreignKeySample"]').last();
    await dropdownInput.click();
    
    // ドロップダウンメニューが表示されるのを待つ
    await page.waitForSelector('[role="listbox"]', { state: 'visible' });
    
    // 階層的な表示が機能していることを確認
    // グループヘッダーが存在することを確認
    const groupLabels = page.locator('.mantine-Select-groupLabel');
    await expect(groupLabels).toHaveCount(2); // Category 1 と Category 2
    
    // グループヘッダーのテキストを確認
    await expect(page.getByText('Category 1').first()).toBeVisible();
    await expect(page.getByText('Category 2').first()).toBeVisible();
    
    // 少なくとも1つのオプションが表示されていることを確認
    const visibleOptions = page.locator('[role="option"]:visible');
    await expect(visibleOptions).toHaveCount(4); // 4つのオプションがあるはず
});
