/**
 * ノードグラフプラグインの共通定数。
 */

/** プロジェクト配下のプラグイン専用ディレクトリ名。 */
export const NODE_GRAPH_DIR = ".mooreseditor";

/** ノードグラフ永続化ファイル名。 */
export const NODE_GRAPH_FILE_NAME = "nodeGraph.v1.json";

/**
 * プロジェクトルートからの相対パス。
 * `HostAPI.saveProject` の extraFiles など、POSIX 区切りで扱える文脈で使う。
 */
export const NODE_GRAPH_RELATIVE_PATH = `${NODE_GRAPH_DIR}/${NODE_GRAPH_FILE_NAME}`;
