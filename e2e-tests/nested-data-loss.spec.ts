import { test, expect } from "@playwright/test";

test.describe("Nested Data Loss Bug - TableView Edit Button Issue", () => {
  test("Should not lose nested data when switching between Edit forms after adding new items", async ({
    page,
  }) => {
    // コンソールログをキャプチャ
    const consoleLogs: string[] = [];
    page.on("console", (msg) => {
      const text = msg.text();
      consoleLogs.push(text);
      // テスト中のログを出力
      if (text.includes("gearConnects") || text.includes("DATA LOSS")) {
        console.log("Browser console:", text);
      }
    });

    // アプリケーションにアクセス
    await page.goto("/");

    // ページのロードを待機
    await page.waitForTimeout(2000);

    // Step 1: FileOpenボタンをクリック
    await page.getByRole("button", { name: "File Open" }).click();
    console.log("Step 1: Clicked File Open button");

    // Step 2: blocksメニューをクリック
    await page.getByText("blocks").click();
    await page.waitForTimeout(1000);
    console.log("Step 2: Clicked blocks menu");

    // Step 3: Edit dataボタンをクリック
    await page.getByRole("button", { name: "Edit data" }).click();
    await page.waitForTimeout(500);
    console.log("Step 3: Clicked Edit data button");

    // Step 4: 小さな歯車のEditボタンをクリック（最初のEditボタン）
    const firstEditButton = page.getByRole("button", { name: "Edit" }).first();
    await firstEditButton.click();
    await page.waitForTimeout(500);
    console.log("Step 4: Clicked Edit button for 小さな歯車");

    // Step 5: Edit gearConnectsボタンをクリック
    // blockParamセクションを展開する必要があるかもしれない
    const expandButton = page
      .locator("button")
      .filter({ hasText: "blockParam" })
      .first();
    if (await expandButton.isVisible()) {
      await expandButton.click();
      await page.waitForTimeout(300);
    }

    // gearセクションを展開
    const gearExpandButton = page
      .locator("button")
      .filter({ hasText: "gear" })
      .first();
    if (await gearExpandButton.isVisible()) {
      await gearExpandButton.click();
      await page.waitForTimeout(300);
    }

    // Edit gearConnectsボタンを探してクリック
    const editGearConnectsButton = page.getByRole("button", {
      name: "Edit gearConnects",
    });
    if (await editGearConnectsButton.isVisible()) {
      await editGearConnectsButton.click();
      await page.waitForTimeout(500);
      console.log("Step 5: Clicked Edit gearConnects button");
    } else {
      console.log(
        "Step 5: Edit gearConnects button not visible, skipping nested data check",
      );
      // 代替のテストパスに進む
    }

    // Step 6: gearConnectsのテーブルで初期データを確認（2つの要素があるはず）
    const initialRows = page.locator("table").last().locator("tbody tr");
    const initialRowCount = await initialRows.count();
    console.log(`Step 6: Initial gearConnects row count: ${initialRowCount}`);
    expect(initialRowCount).toBe(2); // 初期状態で2要素あることを確認

    // JavaScriptでグローバル変数に初期状態を保存
    await page.evaluate(() => {
      const blocksData = (window as any).jsonData?.find(
        (item: any) => item.title === "blocks",
      );
      const gearConnectsData =
        blocksData?.data?.data?.[0]?.blockParam?.gear?.gearConnects;
      (window as any).initialGearConnects = JSON.parse(
        JSON.stringify(gearConnectsData || []),
      );
      console.log("Initial gearConnects data saved:", gearConnectsData);
    });

    // Step 7: blocksテーブルに戻る（左側の最初のパネルをクリック）
    // TableViewを含むパネルをクリックして戻る
    await page
      .locator("div")
      .filter({ hasText: /^data$/ })
      .first()
      .click();
    await page.waitForTimeout(500);
    console.log("Step 7: Returned to blocks table");

    // Step 8: Add Itemボタンをクリックして新しいブロックを追加
    const addItemButton = page
      .getByRole("button", { name: "Add Item" })
      .first();
    await addItemButton.click();
    await page.waitForTimeout(1000);
    console.log("Step 8: Added new block item");

    // Step 9: 新しく追加されたブロックのEditボタンをクリック
    // テーブルの最後の行のEditボタンを取得
    const newItemEditButton = page
      .locator("table")
      .first()
      .locator("tbody tr")
      .last()
      .getByRole("button", { name: "Edit" });
    await newItemEditButton.click();
    await page.waitForTimeout(500);
    console.log("Step 9: Clicked Edit button for new block");

    // Step 10: 再度小さな歯車（最初のブロック）のEditボタンをクリック
    // TableViewの最初の行のEditボタンをクリック
    const firstBlockEditAgain = page
      .locator("table")
      .first()
      .locator("tbody tr")
      .first()
      .getByRole("button", { name: "Edit" });
    await firstBlockEditAgain.click();
    await page.waitForTimeout(500);
    console.log("Step 10: Clicked Edit button for 小さな歯車 again");

    // Step 11: Edit gearConnectsボタンをもう一度クリック
    // blockParamセクションを展開する必要があるかもしれない
    const expandButtonAgain = page
      .locator("button")
      .filter({ hasText: "blockParam" })
      .first();
    if (await expandButtonAgain.isVisible()) {
      await expandButtonAgain.click();
      await page.waitForTimeout(300);
    }

    // gearセクションを展開
    const gearExpandButtonAgain = page
      .locator("button")
      .filter({ hasText: "gear" })
      .first();
    if (await gearExpandButtonAgain.isVisible()) {
      await gearExpandButtonAgain.click();
      await page.waitForTimeout(300);
    }

    // Edit gearConnectsボタンを探してクリック
    const editGearConnectsButtonAgain = page.getByRole("button", {
      name: "Edit gearConnects",
    });
    if (await editGearConnectsButtonAgain.isVisible()) {
      await editGearConnectsButtonAgain.click();
      await page.waitForTimeout(500);
      console.log("Step 11: Clicked Edit gearConnects button again");
    } else {
      console.log("Step 11: Edit gearConnects button not visible again");
    }

    // Step 12: gearConnectsのデータが保持されているか確認
    const afterRows = page.locator("table").last().locator("tbody tr");
    const afterRowCount = await afterRows.count();
    console.log(`Step 12: After manipulation row count: ${afterRowCount}`);

    // JavaScriptでデータの状態を確認
    const dataCheck = await page.evaluate(() => {
      const blocksData = (window as any).jsonData?.find(
        (item: any) => item.title === "blocks",
      );
      const currentGearConnects =
        blocksData?.data?.data?.[0]?.blockParam?.gear?.gearConnects;
      const initialGearConnects = (window as any).initialGearConnects;

      console.log("Current gearConnects:", currentGearConnects);
      console.log("Initial gearConnects:", initialGearConnects);

      const dataLost =
        !currentGearConnects ||
        currentGearConnects.length === 0 ||
        currentGearConnects.length !== initialGearConnects?.length;

      if (dataLost) {
        console.log("🔴 DATA LOSS DETECTED!");
        console.log("Initial count:", initialGearConnects?.length || 0);
        console.log("Current count:", currentGearConnects?.length || 0);
      }

      return {
        initialCount: initialGearConnects?.length || 0,
        currentCount: currentGearConnects?.length || 0,
        dataLost,
      };
    });

    // アサーション：データが失われていないことを確認
    console.log(
      `Data check result: Initial=${dataCheck.initialCount}, Current=${dataCheck.currentCount}, DataLost=${dataCheck.dataLost}`,
    );

    // 問題：データが失われる（currentCountが0になる）
    expect(dataCheck.dataLost).toBe(false); // このテストは失敗するはず
    expect(dataCheck.currentCount).toBe(dataCheck.initialCount); // データが保持されているべき

    // スクリーンショットを保存（デバッグ用）
    await page.screenshot({
      path: "nested-data-loss-final-state.png",
      fullPage: true,
    });

    // テストレポート
    console.log("\n=== Nested Data Loss Test Report ===");
    console.log(`Initial gearConnects count: ${dataCheck.initialCount}`);
    console.log(`Final gearConnects count: ${dataCheck.currentCount}`);
    console.log(`Data lost: ${dataCheck.dataLost}`);
    if (dataCheck.dataLost) {
      console.log(
        "❌ BUG CONFIRMED: Nested data was lost when switching between Edit forms after adding new items",
      );
    } else {
      console.log("✅ No data loss detected");
    }
  });

  test("Alternative test: Check data integrity with multiple nested levels", async ({
    page,
  }) => {
    // コンソールログをキャプチャ
    page.on("console", (msg) => {
      if (msg.text().includes("DATA CHECK") || msg.text().includes("🔴")) {
        console.log("Browser:", msg.text());
      }
    });

    await page.goto("/");
    await page.waitForTimeout(2000);

    // FileOpenボタンをクリック
    await page.getByRole("button", { name: "File Open" }).click();

    // mapObjectsを選択（earnItemsというネストされた配列を持つ）
    await page.getByText("mapObjects").click();
    await page.waitForTimeout(1000);

    // 最初のアイテムのEditボタンをクリック
    const firstEdit = page.getByRole("button", { name: "Edit" }).first();
    await firstEdit.click();
    await page.waitForTimeout(500);

    // earnItemsの初期状態を記録
    await page.evaluate(() => {
      const mapObjectsData = (window as any).jsonData?.find(
        (item: any) => item.title === "mapObjects",
      );
      const firstItem = mapObjectsData?.data?.data?.[0];
      const earnItemsData = firstItem?.earnItems;
      (window as any).initialEarnItems = JSON.parse(
        JSON.stringify(earnItemsData || []),
      );
      console.log("DATA CHECK: Initial earnItems:", earnItemsData);
    });

    // TableViewに戻る
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);

    // Add Itemで新しいmapObjectを追加
    await page.getByRole("button", { name: "Add Item" }).click();
    await page.waitForTimeout(500);

    // 新しいアイテムのEditボタンをクリック
    const newItemEdit = page
      .locator("table")
      .locator("tbody tr")
      .last()
      .getByRole("button", { name: "Edit" });
    await newItemEdit.click();
    await page.waitForTimeout(500);

    // 最初のアイテムに戻る
    const backToFirst = page
      .locator("table")
      .locator("tbody tr")
      .first()
      .getByRole("button", { name: "Edit" });
    await backToFirst.click();
    await page.waitForTimeout(500);

    // earnItemsのデータを確認
    const dataIntegrity = await page.evaluate(() => {
      const mapObjectsData = (window as any).jsonData?.find(
        (item: any) => item.title === "mapObjects",
      );
      const firstItem = mapObjectsData?.data?.data?.[0];
      const currentEarnItems = firstItem?.earnItems;
      const initialEarnItems = (window as any).initialEarnItems;

      const isIntact =
        JSON.stringify(currentEarnItems) === JSON.stringify(initialEarnItems);

      if (!isIntact) {
        console.log(
          "🔴 DATA CHECK FAILED: earnItems data changed unexpectedly",
        );
        console.log("Initial:", initialEarnItems);
        console.log("Current:", currentEarnItems);
      } else {
        console.log("✅ DATA CHECK PASSED: earnItems data preserved");
      }

      return {
        isIntact,
        initial: initialEarnItems,
        current: currentEarnItems,
      };
    });

    expect(dataIntegrity.isIntact).toBe(true);
  });
});
