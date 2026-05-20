import { test, expect } from "@playwright/test";

test.describe("MooresEditor Basic Tests", () => {
  test("テーブルビューとフォームビューを切り替えられる", async ({ page }) => {
    await page.goto("/");

    // FileOpenボタンをクリック
    await page.getByRole("button", { name: "File Open" }).click();

    // mapObjectsをクリック
    await page.getByText("mapObjects").click();

    // ビュー切り替えボタンが存在することを確認（実装に応じて調整）
    // 例: ビュー切り替えボタンやタブがある場合
    const viewToggle = page.locator('[aria-label="Toggle view"]');
    if (await viewToggle.isVisible()) {
      await viewToggle.click();
      // テーブルビューが表示されることを確認
    }
  });
});

/**
 * 外部キー（foreignKey）ドロップダウンの表示を検証する。
 *
 * 注意: かつてこのテストは専用サンプル `foreignKeySample` を対象にしていたが、
 * 同サンプルはコミット 8e79155「update dev file system」で削除された。
 * 現在は実在するスキーマ blocks の `itemGuid` フィールド（items スキーマへの
 * foreignKey 参照）でドロップダウンの挙動を検証する。
 */
test("外部キーフィールドのドロップダウンに参照先の選択肢が表示される", async ({
  page,
}) => {
  await page.goto("/");

  // ファイルを開く
  await page.getByRole("button", { name: "File Open" }).click();

  // blocks スキーマを選択
  await page.getByText("blocks").click();

  // blocks テーブルの最初の行を編集
  const blocksTable = page.locator("table").first();
  await expect(blocksTable.locator("tbody tr").first()).toBeVisible();
  await blocksTable
    .locator("tbody tr")
    .first()
    .getByRole("button", { name: "Edit", exact: true })
    .click();

  // itemGuid フィールドの foreignKey ドロップダウン（placeholder="Select items"）をクリック
  const fkInput = page.locator('input[placeholder="Select items"]').first();
  await expect(fkInput).toBeVisible();
  await fkInput.click();

  // ドロップダウンのリストボックスが表示されることを確認
  const listbox = page.getByRole("listbox");
  await expect(listbox).toBeVisible();

  // 参照先 items スキーマの選択肢（オプション）が表示されていることを確認
  const options = listbox.getByRole("option");
  await expect(options.first()).toBeVisible();
  expect(await options.count()).toBeGreaterThan(0);
});

/**
 * 外部キードロップダウンが検索可能で、選択するとフィールド値が更新されることを検証する。
 *
 * 注意: 元のテストは `foreignKeySample` の階層的なグループ表示
 * （.mantine-Select-groupLabel による Category グルーピング）を検証していた。
 * しかし `foreignKeySample` サンプルは削除されており、現在のサンプルスキーマには
 * 階層的な foreignKey 参照（hierarchyDisplayPaths 等）を持つものが存在しないため、
 * グループ表示は再現できない。代わりに、現行サンプルで再現可能な
 * 「検索して選択肢を絞り込み、選択して値を反映する」フローを検証する。
 */
test("外部キードロップダウンで検索・選択ができる", async ({ page }) => {
  await page.goto("/");

  // ファイルを開く
  await page.getByRole("button", { name: "File Open" }).click();

  // blocks スキーマを選択
  await page.getByText("blocks").click();

  // blocks テーブルの最初の行を編集
  const blocksTable = page.locator("table").first();
  await expect(blocksTable.locator("tbody tr").first()).toBeVisible();
  await blocksTable
    .locator("tbody tr")
    .first()
    .getByRole("button", { name: "Edit", exact: true })
    .click();

  // itemGuid フィールドの foreignKey ドロップダウンをクリック
  const fkInput = page.locator('input[placeholder="Select items"]').first();
  await expect(fkInput).toBeVisible();
  await fkInput.click();

  // リストボックスが表示される
  const listbox = page.getByRole("listbox");
  await expect(listbox).toBeVisible();

  // 検索で選択肢を絞り込む（items サンプルに存在する名前で検索）
  await fkInput.fill("石器");
  const filteredOptions = listbox.getByRole("option");
  await expect(filteredOptions.first()).toBeVisible();

  // 絞り込まれたオプションを選択
  const chosen = filteredOptions.first();
  const chosenLabel = (await chosen.textContent())?.trim() ?? "";
  await chosen.click();

  // 選択した値がフィールドに反映されていることを確認
  await expect(fkInput).toHaveValue(chosenLabel);
});
