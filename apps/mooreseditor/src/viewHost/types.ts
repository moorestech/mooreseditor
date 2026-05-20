import type { ReactNode } from "react";

/**
 * ホストに登録される 1 ビュー（タブ）の記述子。
 * Phase 1 では組み込みの Editor のみ。Phase 3 でプラグインビューが追加される。
 */
export interface ViewDescriptor {
  /** 一意なビュー ID。タブの value に使う。 */
  id: string;
  /** タブに表示するラベル。 */
  label: string;
  /** ビュー本体をレンダリングする。 */
  render: () => ReactNode;
  /** タブを無効化するか（例: データ未ロード時）。 */
  disabled?: boolean;
}

/**
 * アクティブなビューがホストへ公開する能力。
 * ホストはこれを使って Ctrl+S 保存・検索ジャンプを駆動する。
 */
export interface ViewCapabilities {
  /** 現在保存可能か。 */
  canSave: boolean;
  /** 保存を実行する。 */
  onSave: () => void;
  /** 検索でアクティブになった一致要素へフォーカスする（任意）。 */
  focusSearchMatch?: (element: HTMLElement | null) => void;
}
