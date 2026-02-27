import { describe, expect, it } from "vitest";

/**
 * notification.ts depends on @mantine/notifications and @tauri-apps/plugin-notification
 * which are not available in unit test environment.
 * Integration tests via Playwright verify notification behavior in browser.
 *
 * This file verifies the module can be imported without side effects.
 */

describe("notification module", () => {
  it("exports showNotification and notifyFieldsAdded", async () => {
    // Dynamic import to catch module-level errors
    const mod = await import("../notification");
    expect(typeof mod.showNotification).toBe("function");
    expect(typeof mod.notifyFieldsAdded).toBe("function");
  });
});
