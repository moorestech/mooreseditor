import { test, expect } from "@playwright/test";

// These tests share state via the dev-fs API (file creation/cleanup),
// so they must run sequentially to avoid race conditions.
test.describe.configure({ mode: "serial" });

const NODE_GRAPH_FILE_PATH = ".mooreseditor/nodeGraph.v1.json";

/**
 * Helper: read a file via the dev FS API and parse JSON content.
 */
async function readNodeGraphFile(
  page: import("@playwright/test").Page,
): Promise<Record<string, unknown>> {
  const response = await page.request.get("/api/dev-fs/read", {
    params: { path: NODE_GRAPH_FILE_PATH },
  });
  expect(response.ok()).toBe(true);
  const body = await response.json();
  expect(body.content).toBeTruthy();
  return JSON.parse(body.content as string) as Record<string, unknown>;
}

/**
 * Helper: open sample project and switch to Node Graph mode.
 * Waits for preloading to complete, switches mode, and waits for the canvas to render.
 */
async function setupNodeGraphMode(
  page: import("@playwright/test").Page,
): Promise<void> {
  // Click "File Open" to load SampleProject data
  await page.getByRole("button", { name: "File Open" }).click();

  // Wait for the "Node Graph" radio to become enabled (preloading complete)
  // Mantine SegmentedControl uses hidden radio inputs; wait for the input to be enabled
  const nodeGraphInput = page.locator('input[type="radio"][value="node"]');
  await expect(nodeGraphInput).not.toBeDisabled({ timeout: 30000 });

  // Dispatch click event directly on the hidden radio input.
  // This is more reliable than clicking the visible label, which can be missed
  // due to Mantine's animated indicator overlay intercepting clicks.
  // dispatchEvent bypasses viewport/visibility checks that affect hidden inputs.
  await nodeGraphInput.dispatchEvent("click");

  // Wait for the React Flow application container to render
  await expect(page.getByRole("application")).toBeVisible({ timeout: 15000 });

  // Brief stabilization wait for the graph canvas to initialize.
  // Research nodes may or may not load (Tauri API unavailable in browser),
  // so we don't wait for node count > 0. Tests add memo nodes explicitly.
  await page.waitForTimeout(1000);
}

/**
 * Helper: add a memo node via the toolbar button and wait for it to appear.
 */
async function addMemoNode(
  page: import("@playwright/test").Page,
): Promise<void> {
  const nodesBefore = await page.locator(".react-flow__node").count();

  // Click the "Add Memo" button (ActionIcon with aria-label="Add Memo")
  await page.getByRole("button", { name: "Add Memo" }).click();

  // Wait for the new node to appear
  await expect(page.locator(".react-flow__node")).toHaveCount(nodesBefore + 1, {
    timeout: 5000,
  });
}

/**
 * Helper: save in Node Graph mode and wait for dev FS write confirmation.
 */
async function saveAndWaitForDevFs(
  page: import("@playwright/test").Page,
  consoleLogs: string[],
): Promise<void> {
  await page.keyboard.press("Control+s");

  await expect
    .poll(
      () =>
        consoleLogs.some((log) =>
          log.includes("nodeGraph saved via dev server"),
        ),
      {
        message: "Expected console to contain 'nodeGraph saved via dev server'",
        timeout: 15000,
      },
    )
    .toBe(true);
}

test.describe("Node Graph Save - nodeGraph.v1.json", () => {
  test.beforeEach(async ({ page }) => {
    // Clean up test files from previous runs
    await page.request.delete("/api/dev-fs/cleanup");

    // Navigate to the app
    await page.goto("/");
  });

  test("Basic save - Node Graph mode save produces nodeGraph.v1.json", async ({
    page,
  }) => {
    const consoleLogs: string[] = [];
    page.on("console", (msg) => {
      consoleLogs.push(msg.text());
    });

    await setupNodeGraphMode(page);

    // Add a memo node to ensure the graph is dirty and has at least one node
    // (research nodes may or may not load depending on Tauri API rejection timing)
    await addMemoNode(page);

    // Save and verify dev FS write
    await saveAndWaitForDevFs(page, consoleLogs);

    // Verify console contains "nodeGraph:" with JSON data
    const nodeGraphLogEntry = consoleLogs.find((log) =>
      log.startsWith("nodeGraph:"),
    );
    expect(nodeGraphLogEntry).toBeTruthy();

    // Parse the logged JSON to verify it is valid
    const loggedJsonText = nodeGraphLogEntry!.replace(/^nodeGraph:\s*/, "");
    const loggedData = JSON.parse(loggedJsonText);
    expect(loggedData).toHaveProperty("version", 1);

    // Read file via dev FS API and verify structure
    const nodeGraphData = await readNodeGraphFile(page);

    expect(nodeGraphData).toHaveProperty("version", 1);
    expect(nodeGraphData).toHaveProperty("viewport");
    expect(nodeGraphData).toHaveProperty("nodes");
    expect(nodeGraphData).toHaveProperty("edges");

    // Verify viewport is an object with x, y, zoom
    const viewport = nodeGraphData.viewport as Record<string, unknown>;
    expect(typeof viewport.x).toBe("number");
    expect(typeof viewport.y).toBe("number");
    expect(typeof viewport.zoom).toBe("number");

    // Verify nodes is a non-empty array with at least the memo node
    const nodes = nodeGraphData.nodes as Array<Record<string, unknown>>;
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes.some((n) => n.type === "note")).toBe(true);

    // Verify edges is an array
    expect(Array.isArray(nodeGraphData.edges)).toBe(true);
  });

  test("Add memo node + save - nodeGraph includes added memo", async ({
    page,
  }) => {
    const consoleLogs: string[] = [];
    page.on("console", (msg) => {
      consoleLogs.push(msg.text());
    });

    await setupNodeGraphMode(page);

    // Add a memo node
    await addMemoNode(page);

    // Save and verify dev FS write
    await saveAndWaitForDevFs(page, consoleLogs);

    // Read file via dev FS API
    const nodeGraphData = await readNodeGraphFile(page);

    // Verify file structure
    expect(nodeGraphData).toHaveProperty("version", 1);
    const nodes = nodeGraphData.nodes as Array<Record<string, unknown>>;
    expect(Array.isArray(nodes)).toBe(true);

    // Find memo/note nodes
    const noteNodes = nodes.filter((node) => node.type === "note");
    expect(noteNodes.length).toBeGreaterThanOrEqual(1);

    // Verify the memo node has required properties
    const memoNode = noteNodes[0];
    expect(memoNode).toHaveProperty("type", "note");
    expect(memoNode).toHaveProperty("text");
    expect(memoNode).toHaveProperty("position");

    const position = memoNode.position as Record<string, unknown>;
    expect(typeof position.x).toBe("number");
    expect(typeof position.y).toBe("number");
  });

  test("Mode switch preservation - nodeGraph data survives mode switch to Editor", async ({
    page,
  }) => {
    const consoleLogs: string[] = [];
    page.on("console", (msg) => {
      consoleLogs.push(msg.text());
    });

    await setupNodeGraphMode(page);

    // Add a memo node so the graph has dirty data to save
    await addMemoNode(page);

    // Save nodeGraph via Ctrl+S
    await saveAndWaitForDevFs(page, consoleLogs);

    // Record the nodeGraph content after first save
    const nodeGraphBefore = await readNodeGraphFile(page);
    expect(nodeGraphBefore).toHaveProperty("version", 1);
    expect(nodeGraphBefore).toHaveProperty("nodes");
    expect(nodeGraphBefore).toHaveProperty("edges");

    // Switch back to "Editor" mode via SegmentedControl
    // Use dispatchEvent on hidden radio input for reliability (same as setupNodeGraphMode)
    const editorInput = page.locator('input[type="radio"][value="editor"]');
    await editorInput.dispatchEvent("click");

    // Wait for Editor mode to be active (the sidebar with data categories should be visible)
    await expect(page.getByRole("button", { name: "File Open" })).toBeVisible({
      timeout: 5000,
    });

    // Confirm the Editor sidebar has loaded with data categories
    await expect(page.getByText("blocks").first()).toBeVisible({
      timeout: 5000,
    });

    // Verify the nodeGraph.v1.json file still exists after mode switch
    const existsResponse = await page.request.get("/api/dev-fs/exists", {
      params: { path: NODE_GRAPH_FILE_PATH },
    });
    const existsBody = await existsResponse.json();
    expect(existsBody.exists).toBe(true);

    // Read and verify: nodeGraph structure should be preserved after switching to Editor mode
    const nodeGraphAfter = await readNodeGraphFile(page);
    expect(nodeGraphAfter).toHaveProperty("version", 1);
    expect(nodeGraphAfter).toHaveProperty("viewport");
    expect(nodeGraphAfter).toHaveProperty("nodes");
    expect(nodeGraphAfter).toHaveProperty("edges");

    // Verify the memo node we added is still present
    const nodesAfter = nodeGraphAfter.nodes as Array<Record<string, unknown>>;
    expect(nodesAfter.some((n) => n.type === "note")).toBe(true);

    // Verify the node count hasn't decreased (file wasn't corrupted or truncated)
    const nodesBefore = (
      nodeGraphBefore.nodes as Array<Record<string, unknown>>
    ).length;
    expect(nodesAfter.length).toBeGreaterThanOrEqual(nodesBefore);
  });
});
