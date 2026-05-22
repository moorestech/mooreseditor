// Builds the `./vite` subpath for the npm package.
// The runtime `.js` files are hand-written Node ESM build tooling; they ship
// byte-identical (no transpile). Only `.d.ts` files are generated, from the
// parallel `.ts` sources, so the `./vite` `types` condition resolves.
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync } from "node:fs";

mkdirSync("dist/vite", { recursive: true });

for (const f of ["index.js", "mooresPlugin.js", "sharedDeps.js"]) {
  cpSync(`src/vite/${f}`, `dist/vite/${f}`);
}

execFileSync("pnpm", ["exec", "tsc", "-p", "tsconfig.build.json"], {
  stdio: "inherit",
});

console.log(
  "vite subpath built: dist/vite/{index,mooresPlugin,sharedDeps}.{js,d.ts}",
);
