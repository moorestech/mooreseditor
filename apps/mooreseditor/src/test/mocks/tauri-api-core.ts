/**
 * Stub for @tauri-apps/api/core in test environment.
 * Provides no-op invoke so dynamic imports in services/fileSystem.ts resolve.
 */
export async function invoke(_cmd: string, _args?: unknown): Promise<unknown> {
  return undefined;
}
