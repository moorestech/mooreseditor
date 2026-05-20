import * as fs from "node:fs";
import * as path from "node:path";

import type { ServerResponse } from "node:http";
import type { Plugin } from "vite";

/**
 * pluginFsPlugin
 *
 * The live shared-dependency bridge plus the plugin filesystem API. Since
 * Task 3 the production import map in `index.html` resolves shared deps
 * through the `/shared/*.js` bridge served here, so this is the real
 * mechanism the host and dynamically-imported plugins rely on.
 *
 * Provides three capabilities:
 *
 *  1. `/api/plugin-fs/read?path=<path>` + `/api/plugin-fs/file?path=<path>`
 *     (dev only)
 *     Serve files located underneath an allowed root (`plugins/` at the
 *     monorepo root). Unlike `devFsPlugin` (limited to `tmp/e2e-output`),
 *     these endpoints are scoped to the plugin distribution directory so the
 *     host can fetch plugin manifests / bundles during development.
 *     `/read` returns JSON `{ content }` (text); `/file` returns the raw
 *     bytes with a correct `Content-Type` (used for the dynamically
 *     `import()`-ed entry JS and injected CSS). Relative `path` values are
 *     resolved against the *monorepo root* (the form `mooreseditor.config.yaml`
 *     uses, e.g. `./plugins/node-graph`); the result is then allow-list
 *     checked against `plugins/` — traversal outside it returns 403.
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
// `hasDefault` controls whether `bridgeSource()` additionally emits
// `export { default } from "<spec>"`. It MUST be `true` only for packages
// whose ESM entry actually has a top-level default export — emitting that
// re-export for a package without one breaks the build / bridge evaluation.
// Verified values (inspecting each package's ESM entry):
//   - react / react-dom: real default export -> true
//   - react/jsx-runtime, @mantine/*, @tabler/icons-react, @xyflow/react,
//     @mooreseditor/plugin-sdk: named exports only -> false
//
// SYNC CONTRACT: this registry is the single source of truth for shared
// deps. Every entry below MUST be mirrored 1:1 by:
//   - the `index.html` import map (`/shared/<key>.js` URLs), and
//   - the `EXTERNAL` array in `plugins/node-graph/vite.config.ts`.
// All three lists currently enumerate the same 9 deps. Adding/removing a dep
// here without updating the other two will leave it unresolvable for
// dynamically-imported plugins (import map) or wrongly bundled (EXTERNAL).
const SHARED_DEPS: Record<string, { spec: string; hasDefault: boolean }> = {
  react: { spec: "react", hasDefault: true },
  "react-dom": { spec: "react-dom", hasDefault: true },
  // Key convention for subpath specs: collapse the subpath separator,
  // slash -> hyphen (`react/jsx-runtime` -> `react-jsx-runtime`), so the
  // key stays a valid single `/shared/<key>.js` path segment.
  "react-jsx-runtime": { spec: "react/jsx-runtime", hasDefault: false },
  "mantine-core": { spec: "@mantine/core", hasDefault: false },
  // The host itself does not import `@mantine/hooks` directly, but it must
  // be retained as a host dependency so this bridge can serve it to plugins.
  "mantine-hooks": { spec: "@mantine/hooks", hasDefault: false },
  "mantine-notifications": {
    spec: "@mantine/notifications",
    hasDefault: false,
  },
  "tabler-icons-react": { spec: "@tabler/icons-react", hasDefault: false },
  "xyflow-react": { spec: "@xyflow/react", hasDefault: false },
  "plugin-sdk": { spec: "@mooreseditor/plugin-sdk", hasDefault: false },
};

const SHARED_PREFIX = "\0plugin-fs-shared:";

/** JS 識別子として妥当な名前か（不正な named export はスキップする）。 */
function isValidIdentifier(name: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name);
}

/**
 * ホスト依存を共有ブリッジとして再エクスポートする ESM ソースを生成する。
 *
 * 素朴な `export * from "<spec>"` では不十分なケースがある:
 *  - dev: Vite の依存最適化は `react` のような CJS パッケージを
 *    「`export default` のみ」のモジュールへ変換する。`export *` は
 *    default 以外の named export しか転送しないため、変換後 `react` には
 *    named export が無く、プラグインの `import { useMemo }` が
 *    `does not provide an export named 'useMemo'` で失敗する。
 *
 * 対策として、実モジュールを実行時に import して named export 名を列挙し、
 * 個別の named 再エクスポート（`export { name } from "<spec>"`）を生成する。
 * named 再エクスポートは Vite/Rollup の import-analysis が CJS interop へ
 * 書き換えるため、CJS（react）でも ESM（@xyflow/react）でも正しく解決される。
 * 特定 API のハードコードを避け、依存のバージョン差にも追従する。
 */
async function bridgeSource(dep: {
  spec: string;
  hasDefault: boolean;
}): Promise<string> {
  const spec = JSON.stringify(dep.spec);
  let names: string[] = [];
  try {
    const mod = (await import(dep.spec)) as Record<string, unknown>;
    names = Object.keys(mod).filter(
      (k) => k !== "default" && k !== "__esModule" && isValidIdentifier(k),
    );
  } catch {
    // import 失敗時は素朴な `export *` にフォールバックする。
    const star = `export * from ${spec};\n`;
    const def = dep.hasDefault ? `export { default } from ${spec};\n` : "";
    return star + def;
  }

  const lines: string[] = [];
  if (names.length > 0) {
    // 各 named export を個別に再エクスポートする（`export *` は使わない。
    // 併用すると同名 export が二重定義になるため）。
    lines.push(`export { ${names.join(", ")} } from ${spec};`);
  } else {
    // named export が 1 つも検出できなかった場合のみ `export *` を使う。
    lines.push(`export * from ${spec};`);
  }
  if (dep.hasDefault) {
    lines.push(`export { default } from ${spec};`);
  }
  return lines.join("\n") + "\n";
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

/** Map a file extension to the Content-Type used for `/api/plugin-fs/file`. */
function contentTypeFor(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".js":
    case ".mjs":
      // Dynamically imported by the host -> must be a JS MIME type.
      return "text/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

export function pluginFsPlugin(): Plugin {
  // `allowedRoot` is the security boundary: every served file MUST live under
  // `<monorepo>/plugins`. `repoRoot` is the *resolution base* for relative
  // paths — `mooreseditor.config.yaml` declares plugin dirs as
  // monorepo-root-relative (e.g. `./plugins/node-graph`), so a relative
  // request path must be resolved against the monorepo root, then still be
  // allow-list-checked against `allowedRoot`.
  let allowedRoot = "";
  let repoRoot = "";

  /**
   * Resolve a request `path` query value to an absolute, allow-listed file
   * path. Returns `{ resolved }` on success or `{ error: { status, message } }`.
   */
  function resolvePluginPath(
    filePath: string,
  ):
    | { resolved: string; error?: undefined }
    | { resolved?: undefined; error: { status: number; message: string } } {
    const resolved = path.isAbsolute(filePath)
      ? path.resolve(filePath)
      : path.resolve(repoRoot, filePath);
    // Allow-list: must live under the plugins/ directory.
    if (
      resolved !== allowedRoot &&
      !resolved.startsWith(allowedRoot + path.sep)
    ) {
      return {
        error: {
          status: 403,
          message: `Path outside allowed root: ${filePath}`,
        },
      };
    }
    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
      return { error: { status: 404, message: `File not found: ${filePath}` } };
    }
    return { resolved };
  }

  return {
    name: "plugin-fs-plugin",
    apply: "serve",

    configResolved(config) {
      // config.root === apps/mooreseditor ; monorepo root is two levels up.
      repoRoot = path.resolve(config.root, "..", "..");
      allowedRoot = path.resolve(repoRoot, "plugins");
    },

    resolveId(id) {
      if (id.startsWith("/shared/") && id.endsWith(".js")) {
        return SHARED_PREFIX + id.slice("/shared/".length, -3);
      }
      return null;
    },

    async load(id) {
      if (id.startsWith(SHARED_PREFIX)) {
        const name = id.slice(SHARED_PREFIX.length);
        const dep = SHARED_DEPS[name];
        if (!dep) return null;
        // Re-export the bare specifier. Vite optimizes `dep` once; both the
        // host and this module share that single optimized instance.
        return await bridgeSource(dep);
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
        // Match on the exact pathname so `/api/plugin-fs/readdir` etc. do not
        // accidentally hit the `/read` branch via a `startsWith` prefix.
        // `req.url` has no host, so a dummy base is supplied for `URL`.
        const pathname = new URL(url, "http://localhost").pathname;

        // GET /api/plugin-fs/read?path=<path>
        // `path` may be absolute, or relative to the monorepo root (the
        // form `mooreseditor.config.yaml` uses, e.g. `./plugins/node-graph`).
        // A browser client has no business knowing the host's absolute FS
        // layout, so relative is the realistic plugin-loading form.
        // Returns JSON `{ content }` (text payload).
        if (pathname === "/api/plugin-fs/read" && method === "GET") {
          const filePath = parseQueryParam(url, "path");
          if (typeof filePath !== "string" || filePath.length === 0) {
            sendJson(res, 400, { error: "'path' query parameter is required" });
            return;
          }
          try {
            const result = resolvePluginPath(filePath);
            if (result.error) {
              sendJson(res, result.error.status, {
                error: result.error.message,
              });
              return;
            }
            const content = fs.readFileSync(result.resolved, "utf-8");
            sendJson(res, 200, { content });
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "Unknown error";
            sendJson(res, 500, { error: message });
          }
          return;
        }

        // GET /api/plugin-fs/file?path=<path>
        // Serves a file as a raw asset with a correct Content-Type. Used for
        // the plugin entry JS (dynamically `import()`-ed by the host, so the
        // JS MIME type matters) and CSS injected via <link>. Same allow-list
        // and path-resolution rules as `/read`.
        if (pathname === "/api/plugin-fs/file" && method === "GET") {
          const filePath = parseQueryParam(url, "path");
          if (typeof filePath !== "string" || filePath.length === 0) {
            sendJson(res, 400, { error: "'path' query parameter is required" });
            return;
          }
          try {
            const result = resolvePluginPath(filePath);
            if (result.error) {
              sendJson(res, result.error.status, {
                error: result.error.message,
              });
              return;
            }
            const body = fs.readFileSync(result.resolved);
            res.writeHead(200, {
              "Content-Type": contentTypeFor(result.resolved),
              "Content-Length": body.length,
            });
            res.end(body);
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
 * Design (verified by build-output analysis; prod Tauri run pending
 * Task 8):
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
      // `{ index: "index.html" }` and the `assets/[name]-[hash].js` fallback
      // below intentionally re-state Vite's own defaults — we must respecify
      // them because supplying `input`/`entryFileNames` replaces the
      // defaults wholesale. If more HTML entries are ever added to the app,
      // this `input` map must be extended to keep them building.
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

    async load(id) {
      if (id.startsWith(ENTRY_PREFIX)) {
        const name = id.slice(ENTRY_PREFIX.length);
        const dep = SHARED_DEPS[name];
        if (!dep) return null;
        return await bridgeSource(dep);
      }
      return null;
    },
  };
}
