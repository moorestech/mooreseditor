import { invoke } from "@tauri-apps/api/core";
import * as path from "@tauri-apps/api/path";
import {
  exists,
  mkdir,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";

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
  /** ロード済みスキーマ。 */
  schemas: Record<string, Schema>;
  /** スキーマを名前指定でロードする。 */
  loadSchema: (name: string) => Promise<Schema | null>;
  /** プロジェクトディレクトリ（未オープン時 null）。 */
  projectDir: string | null;
  /** master ディレクトリ（未設定時 null）。 */
  masterDir: string | null;
  /** ホストへ未保存変更を通知する。 */
  markDirty: () => void;
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
 * プラグイン専用ファイルを <projectDir>/<relativePath> から読み込む。
 * 存在しなければ null。prod は Tauri FS、失敗時は dev サーバへフォールバックする。
 */
async function readExtraFileImpl(
  projectDir: string | null,
  relativePath: string,
): Promise<string | null> {
  if (!projectDir) {
    return null;
  }

  try {
    const segments = relativePath.split("/").filter((s) => s.length > 0);
    let targetPath = projectDir;
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
    if (!isExists) {
      return null;
    }
    return await readTextFile(targetPath);
  } catch {
    // Tauri FS が使えない（dev/ブラウザ）場合は dev サーバへフォールバック
    try {
      return await readViaDevServer(relativePath);
    } catch {
      // dev サーバも使えない場合はファイル無し扱い
      return null;
    }
  }
}

/**
 * master カラム群と任意のプラグイン専用ファイルをまとめて保存する。
 * master カラムは <masterDir>/<column.title>.json へ書き込む。
 */
async function saveProjectImpl(
  projectDir: string | null,
  masterDir: string | null,
  columns: Column[],
  extraFiles?: { path: string; content: string }[],
): Promise<void> {
  if (!projectDir) {
    throw new Error("saveProject: projectDir is not set");
  }

  const errors: string[] = [];

  for (const column of columns) {
    const json = JSON.stringify(column.data, null, 2);
    try {
      if (!masterDir) {
        throw new Error("Master directory is not set.");
      }
      const jsonFilePath = await path.join(masterDir, `${column.title}.json`);
      await writeTextFile(jsonFilePath, json);
    } catch (error) {
      // Tauri FS が使えない場合は dev サーバへフォールバック
      try {
        await writeViaDevServer(`master/${column.title}.json`, json);
      } catch {
        errors.push(`${column.title}.json: ${error}`);
      }
    }
  }

  for (const file of extraFiles ?? []) {
    try {
      await saveExtraFileImpl(projectDir, file.path, file.content);
    } catch (error) {
      errors.push(`${file.path}: ${error}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`saveProject failed: ${errors.join("; ")}`);
  }
}

/**
 * ホスト側の state とハンドラを束ねて、プラグインへ渡す HostAPI を生成する。
 */
export function createHostApi(deps: CreateHostApiDeps): HostAPI {
  const { projectDir, masterDir } = deps;

  return {
    getColumns: () => deps.getColumns(),
    setColumns: (updater) => deps.setColumns(updater),
    schemas: deps.schemas,
    loadSchema: (name) => deps.loadSchema(name),
    projectDir,
    masterDir,
    markDirty: () => deps.markDirty(),
    saveExtraFile: (relativePath, content) =>
      saveExtraFileImpl(projectDir, relativePath, content),
    readExtraFile: (relativePath) =>
      readExtraFileImpl(projectDir, relativePath),
    saveProject: (columns, extraFiles) =>
      saveProjectImpl(projectDir, masterDir, columns, extraFiles),
  };
}
