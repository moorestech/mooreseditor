import YAML from 'yaml';

export function loadYamlString(yaml: string) {
  return YAML.parse(yaml)
}
