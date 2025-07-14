/**
 * 自動インクリメントのオプション
 */
export interface AutoIncrementOptions {
  /**
   * 昇順(最大値+step) or 降順(最小値-step)
   */
  direction: 'asc' | 'desc';
  /**
   * 加算/減算する値
   */
  step: number;
  /**
   * 配列が空の場合の初期値
   */
  startWith: number;
}

/**
 * 配列内のデータに基づいて次の自動インクリメント値を計算します。
 *
 * @param data - オブジェクトの配列
 * @param key - 値を計算するために使用するオブジェクトのキー
 * @param options - 自動インクリメントのオプション
 * @returns 計算された次の値
 */
export const calculateAutoIncrement = <T extends Record<string, any>>(
  data: T[],
  key: string,
  options: AutoIncrementOptions,
): number => {
  const { direction, step, startWith } = options;

  // 有効な数値のみを抽出
  const values = data
    .map((item) => item[key])
    .filter((value): value is number => typeof value === 'number' && isFinite(value));

  // 配列が空、または有効な数値が一つもなければ初期値を返す
  if (values.length === 0) {
    return startWith;
  }

  if (direction === 'asc') {
    const maxValue = Math.max(...values);
    return maxValue + step;
  } else { // 'desc'
    const minValue = Math.min(...values);
    return minValue - step;
  }
};