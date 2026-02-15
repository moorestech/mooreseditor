import { test, expect } from "@playwright/test";

/**
 * Helper: open sample project and switch to Node Graph mode.
 */
async function setupNodeGraphMode(
  page: import("@playwright/test").Page,
): Promise<void> {
  await page.getByRole("button", { name: "File Open" }).click();

  const nodeGraphInput = page.locator(
    'input[type="radio"][value="node"]',
  );
  await expect(nodeGraphInput).not.toBeDisabled({ timeout: 30000 });
  await nodeGraphInput.dispatchEvent("click");

  await expect(page.getByRole("application")).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(1000);
}

test.describe("Context Menu - Close on Click", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Context menu closes when left-clicking on the canvas", async ({
    page,
  }) => {
    await setupNodeGraphMode(page);

    const canvas = page.locator(".react-flow__pane");

    // Right-click on the canvas to open context menu
    await canvas.click({ button: "right", position: { x: 300, y: 300 } });

    // Assert context menu is visible
    const contextMenu = page.getByRole("menu", { name: "Add node" });
    await expect(contextMenu).toBeVisible({ timeout: 3000 });

    // Left-click on the canvas (away from the menu) to close it
    await canvas.click({ position: { x: 100, y: 100 } });

    // Assert context menu is no longer visible
    await expect(contextMenu).not.toBeVisible({ timeout: 3000 });
  });

  test("Context menu closes when left-clicking on a node", async ({
    page,
  }) => {
    await setupNodeGraphMode(page);

    const canvas = page.locator(".react-flow__pane");

    // Add a memo node first to ensure we have a node to click
    await page.getByRole("button", { name: "Add Memo" }).click();
    const nodeLocator = page.locator(".react-flow__node");
    await expect(nodeLocator.first()).toBeVisible({ timeout: 5000 });

    // Right-click on the canvas to open context menu
    await canvas.click({ button: "right", position: { x: 300, y: 300 } });

    // Assert context menu is visible
    const contextMenu = page.getByRole("menu", { name: "Add node" });
    await expect(contextMenu).toBeVisible({ timeout: 3000 });

    // Left-click on the memo node to close the menu
    await nodeLocator.first().click();

    // Assert context menu is no longer visible
    await expect(contextMenu).not.toBeVisible({ timeout: 3000 });
  });

  test("Context menu closes on Escape key", async ({ page }) => {
    await setupNodeGraphMode(page);

    const canvas = page.locator(".react-flow__pane");

    // Right-click on the canvas to open context menu
    await canvas.click({ button: "right", position: { x: 300, y: 300 } });

    // Assert context menu is visible
    const contextMenu = page.getByRole("menu", { name: "Add node" });
    await expect(contextMenu).toBeVisible({ timeout: 3000 });

    // Press Escape to close
    await page.keyboard.press("Escape");

    // Assert context menu is no longer visible
    await expect(contextMenu).not.toBeVisible({ timeout: 3000 });
  });
});
