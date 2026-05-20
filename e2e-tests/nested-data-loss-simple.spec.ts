import { test, expect } from "@playwright/test";

/**
 * ネストされた配列データ（earnItems / blockParam）が、Edit フォームの切り替えや
 * 新規アイテム追加によって失われないことを検証する。
 *
 * 注意: かつてこのテストは `window.jsonData` というグローバル変数を参照していたが、
 * アプリはそのような変数を公開していないため常に undefined となり機能していなかった。
 * 現在は実際の DOM（ネストテーブルの行数）を観測してデータ整合性を検証する。
 */
test.describe("Nested Data Loss Bug - Simplified Test", () => {
  test("Edit フォームを切り替えてもネストされた earnItems データが失われない", async ({
    page,
  }) => {
    await page.goto("/");

    // Step 1: ファイルを開く
    await page.getByRole("button", { name: "File Open" }).click();

    // Step 2: mapObjects を選択（earnItems というネストされた配列を持つ）
    await page.getByText("mapObjects").click();

    // mapObjects テーブルが表示されるのを待つ
    const mapObjectsTable = page.locator("table").first();
    await expect(mapObjectsTable.locator("tbody tr").first()).toBeVisible();

    // Step 3: 最初の mapObject の Edit ボタンをクリック
    await mapObjectsTable
      .locator("tbody tr")
      .first()
      .getByRole("button", { name: "Edit", exact: true })
      .click();

    // Step 4: earnItems の編集フォームを開き、初期の行数を記録
    await page.getByRole("button", { name: "Edit earnItems" }).click();
    const earnItemsTable = page.locator("table").last();
    await expect(earnItemsTable).toBeVisible();
    const initialEarnItemsCount = await earnItemsTable
      .locator("tbody tr")
      .count();
    expect(initialEarnItemsCount).toBeGreaterThan(0); // 初期データが存在することを確認

    // Step 5: TableView に戻る
    await page
      .locator("p")
      .filter({ hasText: /^data$/ })
      .first()
      .click();

    // Step 6: Add Item で新しい mapObject を追加
    await page.getByRole("button", { name: "Add Item" }).first().click();

    // Step 7: 新しく追加されたアイテムの Edit ボタンをクリック
    const rowsAfterAdd = mapObjectsTable.locator("tbody tr");
    await expect
      .poll(() => rowsAfterAdd.count())
      .toBeGreaterThan(initialEarnItemsCount);
    const newRowCount = await rowsAfterAdd.count();
    await rowsAfterAdd
      .nth(newRowCount - 1)
      .getByRole("button", { name: "Edit", exact: true })
      .click();

    // Step 8: 最初のアイテムの Edit ボタンを再度クリック
    await mapObjectsTable
      .locator("tbody tr")
      .first()
      .getByRole("button", { name: "Edit", exact: true })
      .click();

    // Step 9: earnItems を再度開き、データが保持されているか確認
    await page.getByRole("button", { name: "Edit earnItems" }).click();
    const earnItemsTableAfter = page.locator("table").last();
    await expect(earnItemsTableAfter).toBeVisible();

    // アサーション: earnItems の行数が初期状態と一致する（データが失われていない）
    await expect(earnItemsTableAfter.locator("tbody tr")).toHaveCount(
      initialEarnItemsCount,
    );
  });

  test("新規アイテム追加時に既存の blocks データが保持される", async ({
    page,
  }) => {
    await page.goto("/");

    // ファイルを開く
    await page.getByRole("button", { name: "File Open" }).click();

    // blocks を選択
    await page.getByText("blocks").click();

    // blocks テーブルが表示されるのを待ち、初期行数を記録
    const blocksTable = page.locator("table").first();
    await expect(blocksTable.locator("tbody tr").first()).toBeVisible();
    const initialRowCount = await blocksTable.locator("tbody tr").count();
    expect(initialRowCount).toBeGreaterThan(0);

    // 最初のブロックを識別するためにテキストを記録
    const firstRowText = await blocksTable
      .locator("tbody tr")
      .first()
      .textContent();

    // Add Item で新しいブロックを追加
    await page.getByRole("button", { name: "Add Item" }).first().click();

    // 行が 1 つ増えることを確認
    await expect(blocksTable.locator("tbody tr")).toHaveCount(
      initialRowCount + 1,
    );

    // 既存の最初の行のデータが変化していないことを確認（データ保持）
    await expect(blocksTable.locator("tbody tr").first()).toHaveText(
      firstRowText ?? "",
    );
  });
});
