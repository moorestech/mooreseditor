export const SHARED_DEPENDENCIES = [
  { key: "react", spec: "react", hasDefault: true, versionRange: "^19.0.0" },
  {
    key: "react-dom",
    spec: "react-dom",
    hasDefault: true,
    versionRange: "^19.0.0",
  },
  {
    key: "react-jsx-runtime",
    spec: "react/jsx-runtime",
    hasDefault: false,
    versionRange: "^19.0.0",
  },
  {
    key: "mantine-core",
    spec: "@mantine/core",
    hasDefault: false,
    versionRange: "^7.10.2",
  },
  {
    key: "mantine-hooks",
    spec: "@mantine/hooks",
    hasDefault: false,
    versionRange: "^7.10.2",
  },
  {
    key: "mantine-notifications",
    spec: "@mantine/notifications",
    hasDefault: false,
    versionRange: "^7.10.2",
  },
  {
    key: "tabler-icons-react",
    spec: "@tabler/icons-react",
    hasDefault: false,
    versionRange: "^3.31.0",
  },
  {
    key: "xyflow-react",
    spec: "@xyflow/react",
    hasDefault: false,
    versionRange: "^12.10.0",
  },
  {
    key: "plugin-sdk",
    spec: "@moorestech/mooreseditor-plugin-sdk",
    hasDefault: false,
    versionRange: "workspace:*",
    skipIntrospection: true,
  },
];

export function sharedDependencySpecs() {
  return SHARED_DEPENDENCIES.map((dep) => dep.spec);
}

export function createSharedDependencyImportMap() {
  return {
    imports: Object.fromEntries(
      SHARED_DEPENDENCIES.map((dep) => [dep.spec, `/shared/${dep.key}.js`]),
    ),
  };
}
