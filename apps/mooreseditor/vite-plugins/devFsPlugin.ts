import * as fs from "node:fs";
import * as path from "node:path";

import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

const E2E_OUTPUT_DIR = "tmp/e2e-output";

function resolveTargetPath(projectRoot: string, relativePath: string): string {
  const resolved = path.resolve(projectRoot, E2E_OUTPUT_DIR, relativePath);
  const outputDir = path.resolve(projectRoot, E2E_OUTPUT_DIR);

  // Prevent path traversal attacks
  if (!resolved.startsWith(outputDir)) {
    throw new Error(`Path traversal detected: ${relativePath}`);
  }

  return resolved;
}

function sendJson(
  res: ServerResponse,
  statusCode: number,
  data: Record<string, unknown>,
): void {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const body = Buffer.concat(chunks).toString("utf-8");
        resolve(JSON.parse(body) as Record<string, unknown>);
      } catch (_err) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function parseQueryParam(url: string, param: string): string | null {
  const queryIndex = url.indexOf("?");
  if (queryIndex === -1) return null;

  const searchParams = new URLSearchParams(url.slice(queryIndex));
  return searchParams.get(param);
}

export function devFsPlugin(): Plugin {
  return {
    name: "dev-fs-plugin",
    apply: "serve",
    configureServer(server) {
      const projectRoot = server.config.root;

      server.middlewares.use((req, res, next) => {
        const url = req.url ?? "";

        if (!url.startsWith("/api/dev-fs/")) {
          return next();
        }

        const method = req.method?.toUpperCase();

        // POST /api/dev-fs/write
        if (url.startsWith("/api/dev-fs/write") && method === "POST") {
          parseJsonBody(req)
            .then((body) => {
              const filePath = body.path as string | undefined;
              const content = body.content as string | undefined;

              if (typeof filePath !== "string" || typeof content !== "string") {
                sendJson(res, 400, {
                  error: "Both 'path' and 'content' are required as strings",
                });
                return;
              }

              try {
                const targetPath = resolveTargetPath(projectRoot, filePath);
                const dir = path.dirname(targetPath);
                fs.mkdirSync(dir, { recursive: true });
                fs.writeFileSync(targetPath, content, "utf-8");
                sendJson(res, 200, { success: true });
              } catch (err) {
                const message =
                  err instanceof Error ? err.message : "Unknown error";
                sendJson(res, 500, { error: message });
              }
            })
            .catch((err) => {
              sendJson(res, 400, { error: err.message });
            });
          return;
        }

        // GET /api/dev-fs/read?path=...
        if (url.startsWith("/api/dev-fs/read") && method === "GET") {
          const filePath = parseQueryParam(url, "path");

          if (typeof filePath !== "string") {
            sendJson(res, 400, { error: "'path' query parameter is required" });
            return;
          }

          try {
            const targetPath = resolveTargetPath(projectRoot, filePath);
            if (!fs.existsSync(targetPath)) {
              sendJson(res, 404, { error: `File not found: ${filePath}` });
              return;
            }
            const content = fs.readFileSync(targetPath, "utf-8");
            sendJson(res, 200, { content });
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "Unknown error";
            sendJson(res, 500, { error: message });
          }
          return;
        }

        // GET /api/dev-fs/exists?path=...
        if (url.startsWith("/api/dev-fs/exists") && method === "GET") {
          const filePath = parseQueryParam(url, "path");

          if (typeof filePath !== "string") {
            sendJson(res, 400, { error: "'path' query parameter is required" });
            return;
          }

          try {
            const targetPath = resolveTargetPath(projectRoot, filePath);
            const isExists = fs.existsSync(targetPath);
            sendJson(res, 200, { exists: isExists });
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "Unknown error";
            sendJson(res, 500, { error: message });
          }
          return;
        }

        // DELETE /api/dev-fs/cleanup
        if (url.startsWith("/api/dev-fs/cleanup") && method === "DELETE") {
          try {
            const outputDir = path.resolve(projectRoot, E2E_OUTPUT_DIR);
            if (fs.existsSync(outputDir)) {
              fs.rmSync(outputDir, { recursive: true, force: true });
            }
            sendJson(res, 200, { success: true });
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "Unknown error";
            sendJson(res, 500, { error: message });
          }
          return;
        }

        // Unknown dev-fs endpoint
        sendJson(res, 404, { error: `Unknown endpoint: ${url}` });
      });
    },
  };
}
