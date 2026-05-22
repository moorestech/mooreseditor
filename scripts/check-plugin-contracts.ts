import { readFileSync } from "node:fs";

import {
  SHARED_DEPENDENCIES,
  sharedDependencySpecs,
} from "@moorestech/mooreseditor-plugin-sdk/vite";

interface PackageJson {
  name?: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

function readJson(path: string): PackageJson {
  return JSON.parse(readFileSync(path, "utf8")) as PackageJson;
}

function dependencyRange(
  pkg: PackageJson,
  spec: string,
): string | undefined {
  return pkg.dependencies?.[spec] ?? pkg.peerDependencies?.[spec];
}

const hostPackage = readJson("apps/mooreseditor/package.json");
const sdkPackage = readJson("packages/plugin-sdk/package.json");
const nodeGraphPackage = readJson("plugins/node-graph/package.json");

for (const dep of SHARED_DEPENDENCIES) {
  if (dep.spec === "react/jsx-runtime") {
    continue;
  }
  const hostVersion = dependencyRange(hostPackage, dep.spec);
  if (hostVersion !== dep.versionRange) {
    throw new Error(
      `Host dependency ${dep.spec} is ${hostVersion}, expected ${dep.versionRange}`,
    );
  }
}

const sharedSpecs = new Set(sharedDependencySpecs());
for (const pkg of [sdkPackage, nodeGraphPackage]) {
  const peerDependencies = pkg.peerDependencies ?? {};
  for (const spec of sharedSpecs) {
    if (
      spec === "react/jsx-runtime" ||
      spec === "@xyflow/react" ||
      (pkg.name === "@moorestech/mooreseditor-plugin-sdk" &&
        spec === "@moorestech/mooreseditor-plugin-sdk")
    ) {
      continue;
    }

    const expected = SHARED_DEPENDENCIES.find(
      (dep) => dep.spec === spec,
    )?.versionRange;
    if (peerDependencies[spec] !== expected) {
      throw new Error(
        `${pkg.name} peer ${spec} is ${peerDependencies[spec]}, expected ${expected}`,
      );
    }
  }
}
