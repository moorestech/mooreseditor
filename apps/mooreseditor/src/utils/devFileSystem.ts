/**
 * 開発環境用: サンプルJSONファイルを読み込む
 */

/**
 * 開発環境用: 特定のサンプルJSONファイルを取得
 * @param name ファイル名（拡張子なし）
 * @returns JSONデータ
 */
export async function getSampleJson(name: string): Promise<any> {
  const content = await fetchFileContent(`/src/sample/master/${name}.json`);
    return JSON.parse(content);
}

/**
 * 開発環境用: 特定のサンプルYAMLスキーマファイルを取得
 * @param name ファイル名（拡張子なし）
 * @returns YAMLデータ（文字列）
 */
export async function getSampleSchema(name: string): Promise<string> {
  return  await fetchFileContent(`/src/sample/schema/${name}.yml`);
}

/**
 * 開発環境用: サンプルスキーマファイルのリストを取得
 * @returns スキーマファイル名のリスト
 */
export function getSampleSchemaList(): string[] {
  return ['mapObjects', 'blocks', 'items', 'objectSample'];
}

async function fetchFileContent(path: string): Promise<string> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}: ${response.status}`);
    }
    return response.text();
  } catch (error) {
    console.error(`Failed to load ${name}.yml:`, error);
    throw error;
  }
}


