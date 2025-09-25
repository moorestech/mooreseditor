// AI Generated Test Code
import { vi } from "vitest";

// Mock Tauri API
export const invoke = vi.fn();

export const fs = {
  readTextFile: vi.fn(),
  writeTextFile: vi.fn(),
  exists: vi.fn(),
  createDir: vi.fn(),
  readDir: vi.fn(),
  removeFile: vi.fn(),
  removeDir: vi.fn(),
  copyFile: vi.fn(),
  renameFile: vi.fn(),
};

export const path = {
  join: vi.fn((...parts: string[]) => parts.join("/")),
  dirname: vi.fn((path: string) => {
    const parts = path.split("/");
    parts.pop();
    return parts.join("/");
  }),
  basename: vi.fn((path: string) => {
    const parts = path.split("/");
    return parts[parts.length - 1];
  }),
  extname: vi.fn((path: string) => {
    const parts = path.split(".");
    return parts.length > 1 ? `.${parts[parts.length - 1]}` : "";
  }),
  resolve: vi.fn((...paths: string[]) => paths.join("/")),
  normalize: vi.fn((path: string) => path),
};

export const dialog = {
  open: vi.fn(),
  save: vi.fn(),
  message: vi.fn(),
  ask: vi.fn(),
  confirm: vi.fn(),
};

export const app = {
  getVersion: vi.fn().mockResolvedValue("1.0.0"),
  getName: vi.fn().mockResolvedValue("mooreseditor"),
  getTauriVersion: vi.fn().mockResolvedValue("2.0.0"),
};

export const window = {
  getCurrent: vi.fn().mockReturnValue({
    listen: vi.fn(),
    once: vi.fn(),
    emit: vi.fn(),
  }),
};

export const event = {
  listen: vi.fn(),
  once: vi.fn(),
  emit: vi.fn(),
};
