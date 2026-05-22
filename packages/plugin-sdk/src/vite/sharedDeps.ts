import {
  SHARED_DEPENDENCIES as SHARED_DEPENDENCIES_VALUE,
  createSharedDependencyImportMap as createSharedDependencyImportMapValue,
  sharedDependencySpecs as sharedDependencySpecsValue,
} from "./sharedDeps.js";

export interface SharedDependency {
  key: string;
  spec: string;
  hasDefault: boolean;
  versionRange: string;
  skipIntrospection?: boolean;
}

export const SHARED_DEPENDENCIES =
  SHARED_DEPENDENCIES_VALUE as readonly SharedDependency[];

export function sharedDependencySpecs(): string[] {
  return sharedDependencySpecsValue();
}

export function createSharedDependencyImportMap(): {
  imports: Record<string, string>;
} {
  return createSharedDependencyImportMapValue();
}
