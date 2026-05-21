function normalizeSlashes(value: string): string {
  return value.replace(/\\/g, "/");
}

export function resolvePluginPackagePath(
  pluginDir: string,
  packageRelativePath: string,
): string {
  const normalizedRelative = normalizeSlashes(packageRelativePath);
  if (
    normalizedRelative.trim() === "" ||
    normalizedRelative.startsWith("/") ||
    /^[a-zA-Z]:\//.test(normalizedRelative)
  ) {
    throw new Error(`Invalid plugin file path: ${packageRelativePath}`);
  }

  const segments = normalizedRelative.split("/").filter(Boolean);
  if (segments.includes("..")) {
    throw new Error(`Invalid plugin file path: ${packageRelativePath}`);
  }

  const normalizedDir = normalizeSlashes(pluginDir).replace(/\/+$/, "");
  return `${normalizedDir}/${segments.join("/")}`;
}
