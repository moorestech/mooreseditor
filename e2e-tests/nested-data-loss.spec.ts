import { test, expect } from "@playwright/test";

/**
 * blocks の深くネストされた配列（blockParam.gear.gearConnects）が、
 * Edit フォームの切り替えや新規アイテム追加で失われないことを検証する。
 *
 * 注意: かつてこのテストは `window.jsonData` というグローバル変数を参照していたが、
 * アプリはそのような変数を公開していないため常に undefined となり機能していなかった。
 * 現在は実際の DOM（ネストテーブルの行数）を観測してデータ整合性を検証する。
 *
 * また、サンプルデータの更新により blocks の並び順が変わり、gear ブロック
 * 「小さな歯車」は先頭ではなくインデックス 1 の行になっている。
 */
test.describe("Nested Data Loss Bug - TableView Edit Button Issue", () => {
  test("Edit フォーム切り替え後もネストされた gearConnects データが失われない", async ({
    page,
  }) => {
    await page.goto("/");

    // Step 1: ファイルを開く
    await page.getByRole("button", { name: "File Open" }).click();

    // Step 2: blocks を選択
    await page.getByText("blocks").click();

    // blocks テーブルが表示されるのを待つ
    const blocksTable = page.locator("table").first();
    await expect(blocksTable.locator("tbody tr").first()).toBeVisible();

    // Step 3: gear ブロック「小さな歯車」の行を特定する
    //   （サンプルデータの先頭行は gear を持たないブロックのため、行を名前で検索）
    const gearRow = blocksTable.locator("tbody tr", {
      hasText: "小さな歯車",
    });
    await expect(gearRow).toHaveCount(1);

    // Step 4: 「小さな歯車」の Edit ボタンをクリック
    await gearRow.getByRole("button", { name: "Edit", exact: true }).click();

    // Step 5: Edit gearConnects ボタンをクリック
    await page.getByRole("button", { name: "Edit gearConnects" }).click();

    // Step 6: gearConnects テーブルの初期行数を確認（2 要素あるはず）
    const gearConnectsTable = page.locator("table").last();
    await expect(gearConnectsTable).toBeVisible();
    const initialRowCount = await gearConnectsTable.locator("tbody tr").count();
    expect(initialRowCount).toBe(2); // 初期状態で 2 要素あることを確認

    // Step 7: blocks テーブルに戻る
    await page
      .locator("p")
      .filter({ hasText: /^data$/ })
      .first()
      .click();

    // Step 8: Add Item で新しいブロックを追加
    const blocksRowCountBefore = await blocksTable.locator("tbody tr").count();
    await page.getByRole("button", { name: "Add Item" }).first().click();
    await expect(blocksTable.locator("tbody tr")).toHaveCount(
      blocksRowCountBefore + 1,
    );

    // Step 9: 新しく追加されたブロックの Edit ボタンをクリック
    await blocksTable
      .locator("tbody tr")
      .last()
      .getByRole("button", { name: "Edit", exact: true })
      .click();

    // Step 10: 再度「小さな歯車」の Edit ボタンをクリック
    await blocksTable
      .locator("tbody tr", { hasText: "小さな歯車" })
      .getByRole("button", { name: "Edit", exact: true })
      .click();

    // Step 11: Edit gearConnects ボタンをもう一度クリック
    await page.getByRole("button", { name: "Edit gearConnects" }).click();

    // Step 12: gearConnects のデータが保持されているか確認
    const gearConnectsTableAfter = page.locator("table").last();
    await expect(gearConnectsTableAfter).toBeVisible();

    // アサーション: gearConnects の行数が初期状態と一致する（データが失われていない）
    await expect(gearConnectsTableAfter.locator("tbody tr")).toHaveCount(
      initialRowCount,
    );
  });

  test("複数階層ネスト: earnItems のデータ整合性チェック", async ({ page }) => {
    await page.goto("/");

    // ファイルを開く
    await page.getByRole("button", { name: "File Open" }).click();

    // mapObjects を選択（earnItems というネストされた配列を持つ）
    await page.getByText("mapObjects").click();

    // mapObjects テーブルが表示されるのを待つ
    const mapObjectsTable = page.locator("table").first();
    await expect(mapObjectsTable.locator("tbody tr").first()).toBeVisible();

    // 最初のアイテムの Edit ボタンをクリック
    await mapObjectsTable
      .locator("tbody tr")
      .first()
      .getByRole("button", { name: "Edit", exact: true })
      .click();

    // earnItems の編集フォームを開き、初期行数を記録
    await page.getByRole("button", { name: "Edit earnItems" }).click();
    const earnItemsTable = page.locator("table").last();
    await expect(earnItemsTable).toBeVisible();
    const initialCount = await earnItemsTable.locator("tbody tr").count();
    expect(initialCount).toBeGreaterThan(0);

    // TableView に戻る
    await page
      .locator("p")
      .filter({ hasText: /^data$/ })
      .first()
      .click();

    // Add Item で新しい mapObject を追加
    const rowsBefore = await mapObjectsTable.locator("tbody tr").count();
    await page.getByRole("button", { name: "Add Item" }).first().click();
    await expect(mapObjectsTable.locator("tbody tr")).toHaveCount(
      rowsBefore + 1,
    );

    // 新しいアイテムの Edit ボタンをクリック
    await mapObjectsTable
      .locator("tbody tr")
      .last()
      .getByRole("button", { name: "Edit", exact: true })
      .click();

    // 最初のアイテムに戻る
    await mapObjectsTable
      .locator("tbody tr")
      .first()
      .getByRole("button", { name: "Edit", exact: true })
      .click();

    // earnItems を再度開き、データが保持されているか確認
    await page.getByRole("button", { name: "Edit earnItems" }).click();
    const earnItemsTableAfter = page.locator("table").last();
    await expect(earnItemsTableAfter).toBeVisible();

    // アサーション: earnItems の行数が初期状態と一致する（データが失われていない）
    await expect(earnItemsTableAfter.locator("tbody tr")).toHaveCount(
      initialCount,
    );
  });
});
