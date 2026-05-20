import { test, expect } from "@playwright/test";

test.describe("Nested Data Loss Bug - Simplified Test", () => {
  test("Data loss occurs when switching Edit forms after adding new items", async ({
    page,
  }) => {
    // コンソールログをキャプチャ
    const consoleLogs: string[] = [];
    page.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("DATA") || text.includes("🔴") || text.includes("✅")) {
        console.log("Browser console:", text);
        consoleLogs.push(text);
      }
    });

    console.log("=== Starting Nested Data Loss Test ===");

    // アプリケーションにアクセス
    await page.goto("/");
    await page.waitForTimeout(2000);

    // Step 1: FileOpenボタンをクリック
    await page.getByRole("button", { name: "File Open" }).click();
    console.log("✓ Step 1: Opened file dialog");

    // Step 2: mapObjectsメニューをクリック（earnItemsというネストされた配列を持つ）
    await page.getByText("mapObjects").click();
    await page.waitForTimeout(1000);
    console.log("✓ Step 2: Selected mapObjects");

    // Step 3: 最初のアイテムのEditボタンをクリック
    const firstEditButton = page.getByRole("button", { name: "Edit" }).first();
    await firstEditButton.click();
    await page.waitForTimeout(500);
    console.log("✓ Step 3: Editing first mapObject");

    // Step 4: earnItemsの初期状態を記録（JavaScriptで直接データをチェック）
    const initialState = await page.evaluate(() => {
      const mapObjectsData = (window as any).jsonData?.find(
        (item: any) => item.title === "mapObjects",
      );
      const firstItem = mapObjectsData?.data?.data?.[0];
      const earnItemsData = firstItem?.earnItems;

      // グローバル変数に保存
      (window as any).initialEarnItems = JSON.parse(
        JSON.stringify(earnItemsData || []),
      );

      console.log(
        "DATA CHECK: Initial earnItems count:",
        earnItemsData?.length || 0,
      );
      console.log("DATA CHECK: Initial earnItems data:", earnItemsData);

      return {
        earnItemsCount: earnItemsData?.length || 0,
        hasData: earnItemsData && earnItemsData.length > 0,
      };
    });

    console.log(
      `✓ Step 4: Initial earnItems count: ${initialState.earnItemsCount}`,
    );
    expect(initialState.hasData).toBe(true); // 初期データが存在することを確認

    // Step 5: TableViewに戻る（ESCキーまたは戻るボタン）
    // 左側のデータラベルをクリックしてTableViewに戻る
    const dataLabel = page.locator("p").filter({ hasText: "data" }).first();
    if (await dataLabel.isVisible()) {
      await dataLabel.click();
    }
    await page.waitForTimeout(500);
    console.log("✓ Step 5: Returned to TableView");

    // Step 6: Add Itemボタンをクリックして新しいmapObjectを追加
    const addItemButton = page
      .getByRole("button", { name: "Add Item" })
      .first();
    await addItemButton.click();
    await page.waitForTimeout(1000);
    console.log("✓ Step 6: Added new mapObject");

    // Step 7: 新しく追加されたアイテムのEditボタンをクリック
    // テーブルの最後の行を取得
    const tableRows = page.locator("table").first().locator("tbody tr");
    const rowCount = await tableRows.count();
    console.log(`  Found ${rowCount} rows in table`);

    // 最後の行のEditボタンをクリック
    const lastRowEditButton = tableRows
      .nth(rowCount - 1)
      .getByRole("button", { name: "Edit" });
    await lastRowEditButton.click();
    await page.waitForTimeout(500);
    console.log("✓ Step 7: Editing newly added mapObject");

    // Step 8: 最初のアイテムのEditボタンを再度クリック
    // TableViewの最初の行のEditボタンをクリック
    const firstRowEditAgain = tableRows
      .first()
      .getByRole("button", { name: "Edit" });
    await firstRowEditAgain.click();
    await page.waitForTimeout(500);
    console.log("✓ Step 8: Back to editing first mapObject");

    // Step 9: earnItemsのデータが保持されているか確認
    const finalState = await page.evaluate(() => {
      const mapObjectsData = (window as any).jsonData?.find(
        (item: any) => item.title === "mapObjects",
      );
      const firstItem = mapObjectsData?.data?.data?.[0];
      const currentEarnItems = firstItem?.earnItems;
      const initialEarnItems = (window as any).initialEarnItems;

      // データの比較
      const dataLost =
        !currentEarnItems ||
        currentEarnItems.length === 0 ||
        JSON.stringify(currentEarnItems) !== JSON.stringify(initialEarnItems);

      if (dataLost) {
        console.log("🔴 DATA LOSS DETECTED!");
        console.log("Initial earnItems:", initialEarnItems);
        console.log("Current earnItems:", currentEarnItems);
      } else {
        console.log("✅ Data preserved correctly");
      }

      return {
        initialCount: initialEarnItems?.length || 0,
        currentCount: currentEarnItems?.length || 0,
        dataLost,
        initialData: initialEarnItems,
        currentData: currentEarnItems,
      };
    });

    console.log(`✓ Step 9: Final earnItems count: ${finalState.currentCount}`);
    console.log(`  Initial count: ${finalState.initialCount}`);
    console.log(`  Data lost: ${finalState.dataLost}`);

    // スクリーンショットを保存
    await page.screenshot({
      path: "nested-data-loss-test.png",
      fullPage: true,
    });

    // アサーション：データが失われていないことを確認
    // 注意：この不具合が存在する場合、このテストは失敗します
    expect(finalState.dataLost).toBe(false);
    expect(finalState.currentCount).toBe(finalState.initialCount);

    // テストサマリー
    console.log("\n=== Test Summary ===");
    if (finalState.dataLost) {
      console.log("❌ BUG CONFIRMED: Nested data (earnItems) was lost!");
      console.log(
        `   Data changed from ${finalState.initialCount} items to ${finalState.currentCount} items`,
      );
      console.log(
        "   This happens when switching between Edit forms after adding new items.",
      );
    } else {
      console.log("✅ TEST PASSED: Data integrity maintained");
    }
  });

  test("Quick integrity check for blocks data", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);

    // FileOpenボタンをクリック
    await page.getByRole("button", { name: "File Open" }).click();

    // blocksを選択
    await page.getByText("blocks").click();
    await page.waitForTimeout(1000);

    // データの初期状態を記録
    await page.evaluate(() => {
      const blocksData = (window as any).jsonData?.find(
        (item: any) => item.title === "blocks",
      );
      const blockCount = blocksData?.data?.data?.length || 0;
      console.log(`Initial blocks count: ${blockCount}`);

      // 最初のブロックのblockParamを保存
      const firstBlock = blocksData?.data?.data?.[0];
      (window as any).initialBlockParam = JSON.parse(
        JSON.stringify(firstBlock?.blockParam || {}),
      );
      console.log("Initial blockParam saved:", firstBlock?.blockParam);
    });

    // Add Itemで新しいブロックを追加
    await page.getByRole("button", { name: "Add Item" }).click();
    await page.waitForTimeout(500);

    // データの最終状態を確認
    const result = await page.evaluate(() => {
      const blocksData = (window as any).jsonData?.find(
        (item: any) => item.title === "blocks",
      );
      const firstBlock = blocksData?.data?.data?.[0];
      const currentBlockParam = firstBlock?.blockParam;
      const initialBlockParam = (window as any).initialBlockParam;

      const isIntact =
        JSON.stringify(currentBlockParam) === JSON.stringify(initialBlockParam);

      if (!isIntact) {
        console.log("🔴 Block data changed unexpectedly!");
        console.log("Initial:", initialBlockParam);
        console.log("Current:", currentBlockParam);
      } else {
        console.log("✅ Block data preserved");
      }

      return { isIntact };
    });

    expect(result.isIntact).toBe(true);
  });
});
