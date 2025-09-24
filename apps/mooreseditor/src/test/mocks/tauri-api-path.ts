import { vi } from "vitest";

// Export functions as both named exports and on the default object for better compatibility
const join = vi.fn((...parts: string[]) => parts.join("/"));
const dirname = vi.fn((path: string) => {
  const parts = path.split("/");
  parts.pop();
  return parts.join("/");
});
const basename = vi.fn((path: string) => {
  const parts = path.split("/");
  return parts[parts.length - 1];
});
const extname = vi.fn((path: string) => {
  const parts = path.split(".");
  return parts.length > 1 ? `.${parts[parts.length - 1]}` : "";
});
const resolve = vi.fn((...paths: string[]) => paths.join("/"));
const normalize = vi.fn((path: string) => path);

// Support both named exports and namespace import
export { join, dirname, basename, extname, resolve, normalize };

// Also export as properties for namespace import (import * as path from '@tauri-apps/api/path')
const pathModule = {
  join,
  dirname,
  basename,
  extname,
  resolve,
  normalize,
};

export default pathModule;

// Ensure the module works with * as imports
module.exports = pathModule;
module.exports.join = join;
module.exports.dirname = dirname;
module.exports.basename = basename;
module.exports.extname = extname;
module.exports.resolve = resolve;
module.exports.normalize = normalize;
