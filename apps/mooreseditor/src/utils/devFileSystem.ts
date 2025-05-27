/**
 * 開発環境用: サンプルJSONファイルを読み込む
 */

/**
 * 開発環境用: 特定のサンプルJSONファイルを取得
 * @param name ファイル名（拡張子なし）
 * @returns JSONデータ
 */
export async function getSampleJson(name: string): Promise<any> {
  try {
    console.log(`Loading ${name}.json for web environment`);
    
    const response = await fetch(`/src/sample/master/${name}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${name}.json: ${response.status}`);
    }
    const content = await response.text();
    const jsonData = JSON.parse(content);
    console.log(`Successfully loaded ${name}.json`);
    return jsonData;
  } catch (error) {
    console.error(`Failed to load ${name}.json:`, error);
    throw error;
  }
}

/**
 * 開発環境用: サンプルJSONファイルのリストを取得
 * @returns サンプルファイル名のリスト
 */
export function getSampleFileList(): string[] {
  return ['items', 'blocks', 'craftRecipes', 'machineRecipes', 'mapObjects', 'challenges', 'fluids'];
}

/**
 * 開発環境用: 特定のサンプルYAMLスキーマファイルを取得
 * @param name ファイル名（拡張子なし）
 * @returns YAMLデータ（文字列）
 */
export async function getSampleSchema(name: string): Promise<string> {
  try {
    console.log(`Loading ${name}.yml for web environment`);
    
    const response = await fetch(`/src/schema/${name}.yml`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${name}.yml: ${response.status}`);
    }
    const content = await response.text();
    console.log(`Successfully loaded ${name}.yml`);
    return content;
  } catch (error) {
    console.error(`Failed to load ${name}.yml:`, error);
    throw error;
  }
}

/**
 * 開発環境用: サンプルスキーマファイルのリストを取得
 * @returns スキーマファイル名のリスト
 */
export function getSampleSchemaList(): string[] {
  return ['mapObjects', 'blocks', 'items'];
}
