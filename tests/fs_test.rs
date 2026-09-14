use kv_files::db::Database;
use kv_files::fs::operations::FileOperations;
use kv_files::fs::sandbox::RootManager;
use kv_files::fs::trash::TrashManager;

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

    // 7. Power Search with operators
    let search_res = FileOperations::search(&root_manager, "storage", "ext:txt in:documents", 10).await.unwrap();
    assert_eq!(search_res.len(), 1);
    assert_eq!(search_res[0].name, "renamed.txt");

    let no_match = FileOperations::search(&root_manager, "storage", "ext:mp4", 10).await.unwrap();
    assert_eq!(no_match.len(), 0);

    // 8. Test folder zip archive creation
    let zip_bytes = FileOperations::create_zip_archive(&storage_dir.join("documents")).await.unwrap();
    assert!(!zip_bytes.is_empty());
    // Valid ZIP starts with PK\x03\x04
    assert_eq!(&zip_bytes[0..4], b"PK\x03\x04");

    // 9. Verify Office and Code MediaType classification
    use kv_files::models::MediaType;
    assert_eq!(MediaType::from_extension("docx"), MediaType::Doc);
    assert_eq!(MediaType::from_extension("xlsx"), MediaType::Spreadsheet);
    assert_eq!(MediaType::from_extension("pptx"), MediaType::Presentation);
    assert_eq!(MediaType::from_extension("toml"), MediaType::Code);
    assert_eq!(MediaType::from_extension("yaml"), MediaType::Code);
    assert_eq!(MediaType::from_extension("ini"), MediaType::Code);
    assert_eq!(MediaType::from_extension("mp4"), MediaType::Video);

    // Clean up
    let _ = std::fs::remove_dir_all(&temp_dir);
}
