import type { ReactNode, SetStateAction } from "react";

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
  setColumns(action: SetStateAction<Column[]>): void;
  /** ロード済みスキーマ。 */
  schemas: Record<string, Schema>;
  /** スキーマを名前指定でロードする。 */
  loadSchema(name: string): Promise<Schema | null>;
  /** プロジェクトディレクトリ（未オープン時 null）。 */
  get projectDir(): string | null;
  /** master ディレクトリ（未設定時 null）。 */
  get masterDir(): string | null;
  /** ホストへ未保存変更を通知する。 */
  markDirty(): void;
  /** プラグイン専用ファイルをプロジェクト配下へ保存する。 */
  saveExtraFile(relativePath: string, content: string): Promise<void>;
  /** プラグイン専用ファイルをプロジェクト配下から読み込む（無ければ null）。 */
  readExtraFile(relativePath: string): Promise<string | null>;
  /**
   * master カラム群と任意のプラグイン専用ファイルを 1 つのホスト保存要求として保存する。
   *
   * ホストは書き込み前に全ターゲットを検証し、無効なパスがあれば最初の書き込み前に reject する。
   * 複数ファイルにまたがる filesystem-atomic transaction ではない。
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
  /** ビューがホストから取り除かれる時のクリーンアップ（任意）。 */
  dispose?(): void;
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
