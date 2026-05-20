use std::path::{Path, PathBuf};

use tauri_plugin_fs::FsExt;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn add_project_to_scope(app: tauri::AppHandle, project_path: String) -> Result<(), String> {
    // Add the project directory and all its subdirectories to the scope
    let fs = app.fs_scope();
    fs.allow_directory(&project_path, true)
        .map_err(|e| format!("Failed to add directory to scope: {}", e))?;

    Ok(())
}

/// monorepo ルートの絶対パスを返す（CWD 非依存）。
///
/// `tauri dev` の実行時 CWD は `apps/mooreseditor/src-tauri`（実測で確認）で
/// あり、`std::env::current_dir()` 基準でパスを解決すると monorepo ルート
/// 相対パス（config 由来の `./plugins/...`）が誤った場所を指す。代わりに
/// コンパイル時定数 `CARGO_MANIFEST_DIR`（= `apps/mooreseditor/src-tauri`）を
/// アンカーに使い、そこから 3 階層上がって monorepo ルートを得る。これにより
/// CWD によらず解決結果が一意に定まる（correct-by-construction）。
///
/// 注意: `CARGO_MANIFEST_DIR` はビルドマシンのパスを焼き込むため、別マシンへ
/// 配布した packaged app では正しい場所を指さない。これは現行プラグインモデル
/// （`plugins/` を `.app` に同梱しない）の既知の制約であり Task 8 の範囲外。
///
/// `..` セグメントを残すと後続の許可リスト比較（`starts_with`）が崩れるため、
/// `canonicalize` で正規化する。失敗時のみ未正規化の join にフォールバックする。
fn monorepo_root() -> PathBuf {
    let raw = Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("..")
        .join("..")
        .join("..");
    std::fs::canonicalize(&raw).unwrap_or(raw)
}

/// monorepo ルート相対のプラグインパスを絶対パスへ解決し、許可リスト検証を
/// 通った場合のみ FS スコープへ登録して絶対パスを返す。
///
/// `mooreseditor.config.yaml` はプラグインディレクトリを monorepo ルート相対
/// パス（例: `./plugins/node-graph`）で宣言する。webview はそれを
/// `@tauri-apps/plugin-fs` や `asset` プロトコルが要求する絶対パスへ変換でき
/// ないため、ホストは Rust に解決 + スコープ登録を依頼する。
///
/// セキュリティ: `relative_path` は webview からの任意入力なので、解決後の
/// 絶対パスを許可リストで検証する（dev の `pluginFsPlugin.ts` の `allowedRoot`
/// ガードと同等）。許可するのは monorepo `plugins/` 配下、または
/// `apps/mooreseditor/mooreseditor.config.yaml` のみ。それ以外は `Err` を返し、
/// 無制限な FS スコープ拡大を防ぐ。
#[tauri::command]
async fn resolve_plugin_path(app: tauri::AppHandle, relative_path: String) -> Result<String, String> {
    let root = monorepo_root();
    let candidate = PathBuf::from(&relative_path);
    // 相対パスは（CWD ではなく）monorepo ルートを基準に解決する。
    let absolute = if candidate.is_absolute() {
        candidate
    } else {
        root.join(candidate)
    };

    // Canonicalize when the path exists so `..` segments collapse; fall back
    // to the un-canonicalized join otherwise (the file may be created later).
    let resolved = std::fs::canonicalize(&absolute).unwrap_or(absolute);

    // 許可リスト: `plugins/` 配下、または config ファイル自身のみ許可する。
    // 比較対象も canonicalize して `..` やシンボリックリンク経由の回避を防ぐ。
    let plugins_root = std::fs::canonicalize(root.join("plugins"))
        .unwrap_or_else(|_| root.join("plugins"));
    let config_path = std::fs::canonicalize(
        root.join("apps").join("mooreseditor").join("mooreseditor.config.yaml"),
    )
    .unwrap_or_else(|_| {
        root.join("apps").join("mooreseditor").join("mooreseditor.config.yaml")
    });

    let under_plugins =
        resolved == plugins_root || resolved.starts_with(&plugins_root);
    let is_config = resolved == config_path;
    if !under_plugins && !is_config {
        return Err(format!(
            "resolve_plugin_path: path outside allowed roots: {}",
            relative_path
        ));
    }

    let fs = app.fs_scope();
    // Scope the path itself plus, when it is a directory, everything below it.
    let scope_target: &Path = &resolved;
    if resolved.is_dir() {
        fs.allow_directory(scope_target, true)
            .map_err(|e| format!("Failed to add directory to scope: {}", e))?;
    } else {
        if let Some(parent) = resolved.parent() {
            fs.allow_directory(parent, true)
                .map_err(|e| format!("Failed to add directory to scope: {}", e))?;
        }
        fs.allow_file(scope_target)
            .map_err(|e| format!("Failed to add file to scope: {}", e))?;
    }

    resolved
        .to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| format!("Resolved path is not valid UTF-8: {:?}", resolved))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            add_project_to_scope,
            resolve_plugin_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
