use tauri::Manager;
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![greet, add_project_to_scope])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
