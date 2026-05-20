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

/// Resolve a path that may be relative to the process working directory into
/// an absolute path, and add it (recursively, if it is a directory) to the FS
/// scope so the frontend may `readTextFile` / `convertFileSrc` it.
///
/// `mooreseditor.config.yaml` declares plugin directories as monorepo-root
/// relative paths (e.g. `./plugins/node-graph`). The webview cannot turn
/// those into the absolute paths that `@tauri-apps/plugin-fs` and the `asset`
/// protocol require, so the host asks Rust to resolve + scope them. The
/// returned absolute path is then used by the frontend for both FS reads and
/// `convertFileSrc`.
#[tauri::command]
async fn resolve_plugin_path(app: tauri::AppHandle, relative_path: String) -> Result<String, String> {
    let candidate = PathBuf::from(&relative_path);
    let absolute = if candidate.is_absolute() {
        candidate
    } else {
        let cwd = std::env::current_dir()
            .map_err(|e| format!("Failed to read current directory: {}", e))?;
        cwd.join(candidate)
    };

    // Canonicalize when the path exists so `..` segments collapse; fall back
    // to the un-canonicalized join otherwise (the file may be created later).
    let resolved = std::fs::canonicalize(&absolute).unwrap_or(absolute);

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
