import { test, expect } from "@playwright/test";

/**
 * Visual verification test for the Node Graph system.
 * This test captures screenshots at each step to provide visual evidence
 * that the node graph feature works end-to-end.
 */

const ARTIFACTS_DIR = ".artifacts/node-graph-system/images";

test.describe("Node Graph System - Visual Verification", () => {
  test("Full workflow: load project, switch to Node Graph, add memo, save, switch back", async ({
    page,
  }) => {
    const consoleLogs: string[] = [];
    page.on("console", (msg) => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });

    // --- Step 1: Open the app ---
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.screenshot({
      path: `${ARTIFACTS_DIR}/01-app-initial-load.png`,
      fullPage: true,
    });

    // --- Step 2: Click "File Open" to load sample project data ---
    await page.getByRole("button", { name: "File Open" }).click();

    // Wait for sidebar data categories to appear
    await expect(page.getByText("blocks").first()).toBeVisible({
      timeout: 10000,
    });

    await page.screenshot({
      path: `${ARTIFACTS_DIR}/02-file-open-sample-project.png`,
      fullPage: true,
    });

    // --- Step 3: Wait for "Node Graph" radio to become enabled ---
    const nodeGraphInput = page.locator('input[type="radio"][value="node"]');
    await expect(nodeGraphInput).not.toBeDisabled({ timeout: 30000 });

    await page.screenshot({
      path: `${ARTIFACTS_DIR}/03-node-graph-radio-enabled.png`,
      fullPage: true,
    });

    // --- Step 4: Switch to Node Graph mode ---
    // Use dispatchEvent on hidden radio input for reliability
    // (Mantine's animated indicator overlay can intercept clicks on the label)
    await nodeGraphInput.dispatchEvent("click");

    // Wait for the React Flow application container to render
    await expect(page.getByRole("application")).toBeVisible({
      timeout: 15000,
    });

    // Brief stabilization wait for the graph canvas to initialize
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: `${ARTIFACTS_DIR}/04-node-graph-canvas-loaded.png`,
      fullPage: true,
    });

    // Verify the React Flow canvas is present
    const reactFlowPane = page.locator(".react-flow__pane");
    await expect(reactFlowPane).toBeVisible();

    // --- Step 5: Verify the React Flow canvas loaded ---
    // Count existing nodes (research nodes may or may not be present)
    const nodesBefore = await page.locator(".react-flow__node").count();

    await page.screenshot({
      path: `${ARTIFACTS_DIR}/05-canvas-with-initial-nodes.png`,
      fullPage: true,
    });

    // --- Step 6: Click "Add Memo" button ---
    const addMemoButton = page.getByRole("button", { name: "Add Memo" });
    await expect(addMemoButton).toBeVisible({ timeout: 5000 });

    await addMemoButton.click();

    // Wait for new node to appear
    await expect(page.locator(".react-flow__node")).toHaveCount(
      nodesBefore + 1,
      { timeout: 5000 },
    );

    await page.screenshot({
      path: `${ARTIFACTS_DIR}/06-memo-node-added.png`,
      fullPage: true,
    });

    // --- Step 7: Verify memo node appears on canvas ---
    const memoNodes = page.locator(".react-flow__node");
    const totalNodes = await memoNodes.count();
    expect(totalNodes).toBe(nodesBefore + 1);

    await page.screenshot({
      path: `${ARTIFACTS_DIR}/07-memo-node-verified.png`,
      fullPage: true,
    });

    // --- Step 8: Press Ctrl+S to save ---
    await page.keyboard.press("Control+s");

    // --- Step 9: Verify "nodeGraph saved via dev server" in console ---
    await expect
      .poll(
        () =>
          consoleLogs.some((log) =>
            log.includes("nodeGraph saved via dev server"),
          ),
        {
          message:
            "Expected console to contain 'nodeGraph saved via dev server'",
          timeout: 15000,
        },
      )
      .toBe(true);

    // Find and log the save confirmation message
    const saveLog = consoleLogs.find((log) =>
      log.includes("nodeGraph saved via dev server"),
    );
    console.log("Save confirmation found:", saveLog);

    await page.screenshot({
      path: `${ARTIFACTS_DIR}/08-after-save.png`,
      fullPage: true,
    });

    // --- Step 10: Switch back to Editor mode ---
    const editorInput = page.locator('input[type="radio"][value="editor"]');
    await editorInput.dispatchEvent("click");

    // Wait for Editor mode to be active
    await expect(page.getByRole("button", { name: "File Open" })).toBeVisible({
      timeout: 5000,
    });

    // Confirm the Editor sidebar has loaded with data categories
    await expect(page.getByText("blocks").first()).toBeVisible({
      timeout: 5000,
    });

    await page.screenshot({
      path: `${ARTIFACTS_DIR}/09-editor-mode-restored.png`,
      fullPage: true,
    });

    // Verify the app is still functional by clicking on a data category
    await page.getByText("mapObjects").first().click();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: `${ARTIFACTS_DIR}/10-editor-mode-functional.png`,
      fullPage: true,
    });

    // --- Final summary ---
    console.log("=== Visual Verification Complete ===");
    console.log(`Total nodes before memo: ${nodesBefore}`);
    console.log(`Total nodes after memo: ${totalNodes}`);
    console.log(`Save confirmed: ${!!saveLog}`);
    console.log(`Editor mode restored: true`);
  });
});
