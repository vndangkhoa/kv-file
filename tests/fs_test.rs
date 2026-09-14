use ola::db::Database;
use ola::fs::operations::FileOperations;
use ola::fs::sandbox::RootManager;
use ola::fs::trash::TrashManager;

#[tokio::test]
async fn test_filesystem_operations_and_trash() {
    let temp_dir = std::env::temp_dir().join(format!("ola_fs_test_{}", uuid::Uuid::new_v4()));
    let storage_dir = temp_dir.join("storage");
    let db_path = temp_dir.join("ola.db");

    std::fs::create_dir_all(&storage_dir).unwrap();
    let db = Database::new(&db_path).unwrap();
    let root_manager = RootManager::new(vec![("storage".to_string(), storage_dir.clone())]).unwrap();

    // 1. Create folder
    FileOperations::create_folder(&root_manager, "storage", "documents").await.unwrap();
    assert!(storage_dir.join("documents").is_dir());

    // 2. Create sample file
    let file_path = storage_dir.join("documents").join("test.txt");
    std::fs::write(&file_path, "Hello Ola Rust!").unwrap();

    // 3. List directory
    let listing = FileOperations::list_directory(&root_manager, "storage", "documents").await.unwrap();
    assert_eq!(listing.items.len(), 1);
    assert_eq!(listing.items[0].name, "test.txt");
    assert_eq!(listing.items[0].size, 15);

    // 4. Rename item
    FileOperations::rename_item(&root_manager, "storage", "documents/test.txt", "renamed.txt").await.unwrap();
    assert!(!file_path.exists());
    assert!(storage_dir.join("documents").join("renamed.txt").exists());

    // 5. Soft-delete to trash
    let trash_item = TrashManager::soft_delete(&root_manager, &db, "storage", "documents/renamed.txt").await.unwrap();
    assert!(!storage_dir.join("documents").join("renamed.txt").exists());

    let trash_list = db.list_trash().await.unwrap();
    assert_eq!(trash_list.len(), 1);

    // 6. Restore from trash
    TrashManager::restore(&root_manager, &db, &trash_item.id).await.unwrap();
    assert!(storage_dir.join("documents").join("renamed.txt").exists());
    assert_eq!(db.list_trash().await.unwrap().len(), 0);

    // Clean up
    let _ = std::fs::remove_dir_all(&temp_dir);
}
