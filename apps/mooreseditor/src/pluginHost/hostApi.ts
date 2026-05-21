import type { SetStateAction } from "react";

import { invoke } from "@tauri-apps/api/core";
import * as path from "@tauri-apps/api/path";
import {
  exists,
  mkdir,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";

import { saveProjectFiles } from "../utils/projectPersistence";

import type { Column, HostAPI, Schema } from "@mooreseditor/plugin-sdk";

/**
 * createHostApi に注入するホスト側の生 state とハンドラ。
 *
 * FS 書込/読込（saveExtraFile / readExtraFile / saveProject の実体）は
 * projectDir / masterDir からこのモジュール内で構築する。deps はホストの
 * state を渡すだけでよい。
 */
export interface CreateHostApiDeps {
  /** 現在の master カラム一覧を取得する。 */
  getColumns: () => Column[];
  /** master カラムを更新する。 */
  setColumns: (updater: (columns: Column[]) => Column[]) => void;
  /**
   * 現在のロード済みスキーマを取得する。
   *
   * `useSchema` は `loadSchema` のたびに新しい `schemas` オブジェクトを生成する。
   * 生のオブジェクトを deps へ渡すと `createHostApi` の useMemo が毎ロードで
   * 再生成され、プラグインの `createView` 再実行＝remount を招く。
   * getter として渡すことで `createHostApi` の deps を安定させつつ、
   * `host.schemas` は常に最新値を返す。
   */
  getSchemas: () => Record<string, Schema>;
  /** スキーマを名前指定でロードする。 */
  loadSchema: (name: string) => Promise<Schema | null>;
  /** プロジェクトディレクトリ（未オープン時 null）。 */
  projectDir: string | null;
  /** master ディレクトリ（未設定時 null）。 */
  masterDir: string | null;
  /** ホストへ未保存変更を通知する。 */
  markDirty: () => void;
}

/** Tauri FS が利用できない（dev/ブラウザ環境）ことを表す内部マーカー。 */
const TAURI_UNAVAILABLE = Symbol("tauri-unavailable");

/**
 * relativePath（プラグインから渡される POSIX 区切りの相対パス）を検証する。
 * `..` セグメント・絶対パス・空パスを拒否し、projectDir からの脱出を防ぐ。
 */
function validateRelativePath(relativePath: string): void {
  if (relativePath.startsWith("/")) {
    throw new Error(
      `Invalid relativePath (must not be absolute): ${relativePath}`,
    );
  }
  const segments = relativePath.split("/").filter((s) => s.length > 0);
  if (segments.length === 0) {
    throw new Error(`Invalid relativePath (empty): ${relativePath}`);
  }
  if (segments.includes("..")) {
    throw new Error(
      `Invalid relativePath (path traversal '..' not allowed): ${relativePath}`,
    );
  }
}

/** dev サーバ経由でファイルを書き込む（E2E / ブラウザ検証用フォールバック）。 */
async function writeViaDevServer(
  relativePath: string,
  content: string,
): Promise<void> {
  const res = await fetch("/api/dev-fs/write", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: relativePath, content }),
  });
  if (!res.ok) {
    throw new Error(`Dev FS write failed: ${res.status}`);
  }
}

/**
 * dev サーバ経由でファイルを読み込む（E2E / ブラウザ検証用フォールバック）。
 * 404（ファイル無し）の場合は null を返す。
 */
async function readViaDevServer(relativePath: string): Promise<string | null> {
  const res = await fetch(
    `/api/dev-fs/read?path=${encodeURIComponent(relativePath)}`,
  );
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Dev FS read failed: ${res.status}`);
  }
  const body = (await res.json()) as { content?: string };
  return typeof body.content === "string" ? body.content : null;
}

/**
 * relativePath（POSIX 区切り）を分解し、projectDir と結合した絶対パスを返す。
 * dotfile を含むディレクトリは Tauri FS スコープへ明示追加し、recursive に mkdir する。
 */
async function resolveAndPrepareDir(
  projectDir: string,
  relativePath: string,
): Promise<string> {
  const segments = relativePath.split("/").filter((s) => s.length > 0);
  const dirSegments = segments.slice(0, -1);

  let currentDir = projectDir;
  for (const segment of dirSegments) {
    currentDir = await path.join(currentDir, segment);

    // dotfile ディレクトリ（'.' 始まり）は親ディレクトリの glob にマッチしないため
    // 明示的に Tauri FS スコープへ追加する。
    if (segment.startsWith(".")) {
      try {
        await invoke("add_project_to_scope", { projectPath: currentDir });
      } catch {
        // スコープ追加失敗 — dev/ブラウザ環境では想定内
      }
    }

    const isDirExists = await exists(currentDir);
    if (!isDirExists) {
      await mkdir(currentDir, { recursive: true });
    }
  }

  return path.join(currentDir, ...segments.slice(-1));
}

/**
 * プラグイン専用ファイルを <projectDir>/<relativePath> へ書き込む。
 * prod は Tauri FS、失敗時は dev サーバへ try-catch フォールバックする。
 */
async function saveExtraFileImpl(
  projectDir: string | null,
  relativePath: string,
  content: string,
): Promise<void> {
  if (!projectDir) {
    throw new Error("saveExtraFile: projectDir is not set");
  }
  validateRelativePath(relativePath);

  try {
    const targetPath = await resolveAndPrepareDir(projectDir, relativePath);
    await writeTextFile(targetPath, content);
  } catch (error) {
    // Tauri FS が使えない（dev/ブラウザ）場合は dev サーバへフォールバック
    try {
      await writeViaDevServer(relativePath, content);
    } catch {
      // dev サーバも使えない場合は元のエラーを伝播する
      throw error;
    }
  }
}

/**
 * Tauri FS を使って <projectDir>/<relativePath> を読み込む。
 *
 * - ファイルが存在しなければ null を返す。
 * - Tauri FS 自体が利用できない（dev/ブラウザ環境）場合は TAURI_UNAVAILABLE を返す。
 *   このとき呼び出し側は dev サーバへフォールバックする。
 * - Tauri FS は使えるが `readTextFile` が失敗した場合（権限不足 / I/O エラー等）は
 *   本物のエラーとして throw する。隠蔽すると「読めないファイル」を「無いファイル」と
 *   誤認し、プラグインが状態を初期化してしまう（データ損失）。
 */
async function readViaTauri(
  projectDir: string,
  relativePath: string,
): Promise<string | null | typeof TAURI_UNAVAILABLE> {
  const segments = relativePath.split("/").filter((s) => s.length > 0);
  let targetPath = projectDir;

  try {
    for (const segment of segments) {
      targetPath = await path.join(targetPath, segment);
      // 読込前に dotfile ディレクトリをスコープへ追加しておく
      if (segment.startsWith(".")) {
        try {
          await invoke("add_project_to_scope", { projectPath: targetPath });
        } catch {
          // スコープ追加失敗 — dev/ブラウザ環境では想定内
        }
      }
    }

    const isExists = await exists(targetPath);
    // exists() が成功した時点で Tauri FS は利用可能と判断する。
    if (!isExists) {
      return null;
    }
  } catch {
    // exists() に到達する前に失敗 → Tauri FS 自体が使えない。
    return TAURI_UNAVAILABLE;
  }

  // ここから先（readTextFile）の失敗は本物のエラー。隠蔽せず再 throw する。
  return await readTextFile(targetPath);
}

/**
 * プラグイン専用ファイルを <projectDir>/<relativePath> から読み込む。
 * 存在しなければ null。prod は Tauri FS を使い、Tauri FS 自体が使えない場合のみ
 * dev サーバへフォールバックする。Tauri FS が使えるのに読込が失敗した場合は
 * 本物のエラーとして throw する（ファイル無しと誤認させない）。
 */
async function readExtraFileImpl(
  projectDir: string | null,
  relativePath: string,
): Promise<string | null> {
  if (!projectDir) {
    return null;
  }
  validateRelativePath(relativePath);

  const result = await readViaTauri(projectDir, relativePath);
  if (result !== TAURI_UNAVAILABLE) {
    // Tauri FS で読めた（または存在しなかった）。result は string | null。
    return result;
  }

  // Tauri FS 自体が使えない（dev/ブラウザ環境）→ dev サーバへフォールバック。
  try {
    return await readViaDevServer(relativePath);
  } catch {
    // dev サーバも使えない場合はファイル無し扱い
    return null;
  }
}

/**
 * ホスト側の state とハンドラを束ねて、プラグインへ渡す HostAPI を生成する。
 *
 * `projectDir` / `masterDir` のプレーンフィールドは生成時点の値スナップショット。
 * 一方 `saveExtraFile` / `readExtraFile` / `saveProject` クロージャは呼び出し時に
 * `deps.projectDir` / `deps.masterDir` を読むため、deps が同一インスタンスのまま
 * 更新されても最新値を参照しリアクティブに振る舞う。
 *
 * `schemas` は getter プロパティとして実装する。`HostAPI` の型上は
 * `Record<string, Schema>` のプロパティだが、getter は妥当な実装であり
 * SDK 契約は変わらない。`deps.getSchemas()` を都度呼ぶため、createHostApi を
 * 再生成しなくても `host.schemas` は常に最新値を返す。
 */
export function createHostApi(deps: CreateHostApiDeps): HostAPI {
  return {
    getColumns: () => deps.getColumns(),
    setColumns: (action: SetStateAction<Column[]>) =>
      deps.setColumns((columns) =>
        typeof action === "function" ? action(columns) : action,
      ),
    get schemas() {
      return deps.getSchemas();
    },
    loadSchema: (name) => deps.loadSchema(name),
    get projectDir() {
      return deps.projectDir;
    },
    get masterDir() {
      return deps.masterDir;
    },
    markDirty: () => deps.markDirty(),
    saveExtraFile: (relativePath, content) =>
      saveExtraFileImpl(deps.projectDir, relativePath, content),
    readExtraFile: (relativePath) =>
      readExtraFileImpl(deps.projectDir, relativePath),
    saveProject: (columns, extraFiles) =>
      saveProjectFiles({
        projectDir: deps.projectDir,
        masterDir: deps.masterDir,
        columns,
        extraFiles,
      }),
  };
}
