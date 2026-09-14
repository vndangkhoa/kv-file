use kv_files::fs::sandbox::RootManager;

#[test]
fn test_sandbox_path_traversal_prevention() {
    let temp_dir = std::env::temp_dir().join(format!("ola_test_{}", uuid::Uuid::new_v4()));
    let storage_dir = temp_dir.join("storage");
    std::fs::create_dir_all(&storage_dir).unwrap();

    let root_manager = RootManager::new(vec![("storage".to_string(), storage_dir.clone())]).unwrap();

    // 1. Valid inside root
    let safe = root_manager.resolve_safe("storage", "my_folder/doc.txt");
    assert!(safe.is_ok());

    // 2. Traversal attempt with ../../
    let hack = root_manager.resolve_safe("storage", "../../etc/passwd");
    assert!(hack.is_err());

    // 3. Absolute path trick /etc/passwd
    let hack_abs = root_manager.resolve_safe("storage", "/etc/passwd");
    // Should be stripped of leading slash and resolved under storage/etc/passwd, inside root!
    if let Ok(resolved) = hack_abs {
        assert!(resolved.starts_with(&storage_dir));
    }

    // Clean up
    let _ = std::fs::remove_dir_all(&temp_dir);
}
