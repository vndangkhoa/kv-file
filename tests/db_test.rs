use kv_files::db::Database;

#[tokio::test]
async fn test_db_user_and_shares() {
    let temp_db = std::env::temp_dir().join(format!("ola_db_{}.db", uuid::Uuid::new_v4()));
    let db = Database::new(&temp_db).unwrap();

    // 1. Initial user status
    assert!(!db.has_users().await.unwrap());

    // 2. Create user
    let user = db.create_user("admin", "hashed_secret", "admin").await.unwrap();
    assert_eq!(user.username, "admin");
    assert!(db.has_users().await.unwrap());

    // 3. Query user
    let found = db.get_user_by_username("admin").await.unwrap();
    assert!(found.is_some());
    let (u, hash) = found.unwrap();
    assert_eq!(u.id, user.id);
    assert_eq!(hash, "hashed_secret");

    // 4. Create Share
    let share = db
        .create_share("storage", "documents/report.pdf", false, None, None, true)
        .await
        .unwrap();
    assert_eq!(share.path, "documents/report.pdf");

    let queried_share = db.get_share_by_token(&share.token).await.unwrap();
    assert!(queried_share.is_some());

    // 5. Trash item
    let trash_item = db
        .add_trash_item("storage", "photos/vacation.jpg", "uuid_vacation.jpg", 1024, false)
        .await
        .unwrap();
    assert_eq!(trash_item.original_path, "photos/vacation.jpg");

    let trash_list = db.list_trash().await.unwrap();
    assert_eq!(trash_list.len(), 1);

    db.remove_trash_item(&trash_item.id).await.unwrap();
    let trash_list_after = db.list_trash().await.unwrap();
    assert_eq!(trash_list_after.len(), 0);

    // Clean up
    let _ = std::fs::remove_file(&temp_db);
}
