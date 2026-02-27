/**
 * Stub for @tauri-apps/plugin-notification in test environment.
 */
export async function isPermissionGranted(): Promise<boolean> {
  return false;
}

export async function requestPermission(): Promise<string> {
  return "denied";
}

export async function sendNotification(
  _options: Record<string, unknown>,
): Promise<void> {
  // no-op in test
}
