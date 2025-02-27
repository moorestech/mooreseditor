import { parseDocument } from 'yaml';
import * as fs from 'node:fs';

export function loadYamlString(yaml: string) {
  return parseDocument(yaml)
}
