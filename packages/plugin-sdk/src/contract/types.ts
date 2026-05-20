import type { ReactNode } from "react";

import type { Column } from "../schema";
import type { Schema } from "../schema";

/**
 * ホストがプラグインへ提供する API。
 * プラグインはこれを通じてのみホストの状態へアクセスする。
 */
export interface HostAPI {
  /** 現在の master カラム一覧を取得する。 */
  getColumns(): Column[];
  /** master カラムを更新する。 */
  setColumns(updater: (columns: Column[]) => Column[]): void;
  /** ロード済みスキーマ。 */
  schemas: Record<string, Schema>;
  /** スキーマを名前指定でロードする。 */
  loadSchema(name: string): Promise<Schema | null>;
  /** プロジェクトディレクトリ（未オープン時 null）。 */
  projectDir: string | null;
  /** master ディレクトリ（未設定時 null）。 */
  masterDir: string | null;
  /** ホストへ未保存変更を通知する。 */
  markDirty(): void;
  /** プラグイン専用ファイルをプロジェクト配下へ保存する。 */
  saveExtraFile(relativePath: string, content: string): Promise<void>;
  /** プラグイン専用ファイルをプロジェクト配下から読み込む（無ければ null）。 */
  readExtraFile(relativePath: string): Promise<string | null>;
  /**
   * master カラム群と任意のプラグイン専用ファイルを原子的に保存する。
   *
   * PluginView.save() は「master カラム更新 + プラグイン専用ファイル保存（例:
   * nodeGraph.v1.json）」を 1 操作として完結させる必要がある。
   * saveExtraFile だけでは master JSON を永続化できないため、この API が必要。
   */
  saveProject(
    columns: Column[],
    extraFiles?: { path: string; content: string }[],
  ): Promise<void>;
}

/**
 * プラグインがホストへ公開するビュー実体。
 * ホストの ViewRegistry にタブとして登録される。
 */
export interface PluginView {
  /** ビュー本体をレンダリングする。 */
  render(): ReactNode;
  /** 保存を実行する（任意）。 */
  save?(): Promise<void>;
  /** 未保存変更があるか（任意）。 */
  isDirty?(): boolean;
  /** 検索一致要素へフォーカスする（任意）。 */
  focusSearchMatch?(element: HTMLElement | null): void;
}

/**
 * プラグイン成果物が default export するオブジェクト。
 */
export interface PluginManifest {
  /** 一意なプラグイン ID。 */
  id: string;
  /** タブ表示名。 */
  name: string;
  /** プラグインバージョン（semver）。 */
  version: string;
  /** HostAPI を受け取りビューを生成する。 */
  createView(host: HostAPI): PluginView;
}
