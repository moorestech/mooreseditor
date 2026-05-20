import * as fs from "node:fs";
import * as path from "node:path";

import type { ServerResponse } from "node:http";
import type { Plugin } from "vite";

/**
 * pluginFsPlugin
 *
 * Phase 3 PoC / Task 6 implementation seed.
 *
 * Provides three capabilities:
 *
 *  1. `/api/plugin-fs/read?path=<absPath>`  (dev only)
 *     Serves files located underneath an allowed root (`plugins/` at the
 *     monorepo root). Unlike `devFsPlugin` (limited to `tmp/e2e-output`),
 *     this endpoint is scoped to the plugin distribution directory so the
 *     host can fetch plugin manifests / bundles during development.
 *
 *  2. `/shared/<dep>.js`  (dev: virtual module via Vite's serve pipeline)
 *     A "shared dependency bridge". Returns a tiny ESM module that
 *     re-exports a host dependency (e.g. `react`). Because the re-export is
 *     processed by Vite's normal module pipeline, the bare specifier
 *     resolves through the SAME dependency optimizer cache the host uses —
 *     guaranteeing a single module instance shared between the host and
 *     dynamically-imported plugins (which reach this URL via the
 *     `index.html` import map).
 *
 *  3. `shared/<dep>.js`  (build: real emitted chunk)
 *     During `vite build` the same bridge is emitted as a real chunk under
 *     `dist/shared/`. The `index.html` import map is NOT rewritten — there
 *     is no `transformIndexHtml` hook here. Instead the *static* map written
 *     into `index.html` stays correct because `pluginSharedBuildPlugin`
 *     force-names the bridge entries to stable, unhashed paths
 *     (`shared/<dep>.js`) via `entryFileNames`. So the literal path the
 *     import map already references is exactly where Rollup emits the chunk.
 *     Rollup hoists React's actual implementation into a shared chunk that
 *     BOTH the host bundle and the bridge entry import, so prod still has a
 *     single React instance.
 *
 *     NOTE: the prod side was verified by build-output analysis (inspecting
 *     `dist/` chunk paths and import graph), not by a live Tauri run.
 *
 * Per CLAUDE.md, dev/prod differences are handled by Vite's `apply` hook
 * granularity rather than runtime `if (isDev)` branching.
 */

// Shared dependencies exposed through `/shared/<name>.js`.
// Keep this list explicit: only deps that MUST be a single instance across
// host + plugins belong here.
// `hasDefault: false` for deps whose package has no default export
// (e.g. react/jsx-runtime) — only `export *` is emitted for those.
const SHARED_DEPS: Record<string, { spec: string; hasDefault: boolean }> = {
  react: { spec: "react", hasDefault: true },
  "react-dom": { spec: "react-dom", hasDefault: true },
  "react-jsx-runtime": { spec: "react/jsx-runtime", hasDefault: false },
};

const SHARED_PREFIX = "\0plugin-fs-shared:";

/** ESM source that re-exports a host dependency as the shared bridge. */
function bridgeSource(dep: { spec: string; hasDefault: boolean }): string {
  const star = `export * from ${JSON.stringify(dep.spec)};\n`;
  const def = dep.hasDefault
    ? `export { default } from ${JSON.stringify(dep.spec)};\n`
    : "";
  return star + def;
}

function sendJson(
  res: ServerResponse,
  statusCode: number,
  data: Record<string, unknown>,
): void {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function parseQueryParam(url: string, param: string): string | null {
  const queryIndex = url.indexOf("?");
  if (queryIndex === -1) return null;
  const searchParams = new URLSearchParams(url.slice(queryIndex));
  return searchParams.get(param);
}

/**
 * Dev-server side: `/api/plugin-fs/read` + virtual `/shared/*.js`.
 */
export function pluginFsPlugin(): Plugin {
  let allowedRoot = "";

  return {
    name: "plugin-fs-plugin",
    apply: "serve",

    configResolved(config) {
      // config.root === apps/mooreseditor ; monorepo root is two levels up.
      allowedRoot = path.resolve(config.root, "..", "..", "plugins");
    },

    resolveId(id) {
      if (id.startsWith("/shared/") && id.endsWith(".js")) {
        return SHARED_PREFIX + id.slice("/shared/".length, -3);
      }
      return null;
    },

    load(id) {
      if (id.startsWith(SHARED_PREFIX)) {
        const name = id.slice(SHARED_PREFIX.length);
        const dep = SHARED_DEPS[name];
        if (!dep) return null;
        // Re-export the bare specifier. Vite optimizes `dep` once; both the
        // host and this module share that single optimized instance.
        return bridgeSource(dep);
      }
      return null;
    },

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? "";
        if (!url.startsWith("/api/plugin-fs/")) {
          return next();
        }
        const method = req.method?.toUpperCase();

        // GET /api/plugin-fs/read?path=<absPath>
        if (url.startsWith("/api/plugin-fs/read") && method === "GET") {
          const filePath = parseQueryParam(url, "path");
          if (typeof filePath !== "string" || filePath.length === 0) {
            sendJson(res, 400, { error: "'path' query parameter is required" });
            return;
          }
          try {
            const resolved = path.resolve(filePath);
            // Allow-list: must live under the plugins/ directory.
            if (
              resolved !== allowedRoot &&
              !resolved.startsWith(allowedRoot + path.sep)
            ) {
              sendJson(res, 403, {
                error: `Path outside allowed root: ${filePath}`,
              });
              return;
            }
            if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
              sendJson(res, 404, { error: `File not found: ${filePath}` });
              return;
            }
            const content = fs.readFileSync(resolved, "utf-8");
            sendJson(res, 200, { content });
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "Unknown error";
            sendJson(res, 500, { error: message });
          }
          return;
        }

        sendJson(res, 404, { error: `Unknown endpoint: ${url}` });
      });
    },
  };
}

const ENTRY_PREFIX = "\0shared-entry:";

/**
 * Build side: emit real `shared/<dep>.js` bridge chunks at deterministic,
 * unhashed paths so the *static* `index.html` import map keeps resolving
 * correctly. The import map is never rewritten — there is no
 * `transformIndexHtml` hook; the map points at `shared/<dep>.js` literally
 * and this plugin makes Rollup emit the chunk at exactly that path.
 *
 * Design (verified by Phase 3 PoC build-output analysis, not a live Tauri
 * run):
 *  - Each shared dep is registered as a Rollup *input entry* with a virtual
 *    id. Its source is `export * from "<dep>"; export { default } from
 *    "<dep>"`. Rollup compiles this into a proper ESM module with clean
 *    named + default exports (NOT an opaque internal chunk).
 *  - React's actual implementation is hoisted by Rollup into a shared chunk
 *    that BOTH the host bundle and this entry import — so there is exactly
 *    one React instance in prod.
 *  - The entry chunk is force-named so it lands at the stable path
 *    `shared/<dep>.js`, which the import map references verbatim.
 *
 * Used in `vite.config.ts` alongside `pluginFsPlugin()`. Splitting build vs
 * serve into two `Plugin` objects keeps each one's `apply` field honest.
 */
export function pluginSharedBuildPlugin(): Plugin {
  return {
    name: "plugin-fs-shared-build",
    apply: "build",

    /** Register one input entry per shared dep. */
    config() {
      const input: Record<string, string> = { index: "index.html" };
      for (const name of Object.keys(SHARED_DEPS)) {
        // entry key e.g. "shared/react" -> emitted file "shared/react.js"
        input[`shared/${name}`] = `${ENTRY_PREFIX}${name}`;
      }
      return {
        build: {
          rollupOptions: {
            input,
            output: {
              // Keep the shared bridge entries at predictable, unhashed
              // paths so the import map can reference them statically.
              entryFileNames(chunk) {
                if (chunk.name.startsWith("shared/")) {
                  return "[name].js";
                }
                return "assets/[name]-[hash].js";
              },
            },
          },
        },
      };
    },

    resolveId(id) {
      if (id.startsWith(ENTRY_PREFIX)) return id;
      return null;
    },

    load(id) {
      if (id.startsWith(ENTRY_PREFIX)) {
        const name = id.slice(ENTRY_PREFIX.length);
        const dep = SHARED_DEPS[name];
        if (!dep) return null;
        return bridgeSource(dep);
      }
      return null;
    },
  };
}
