use crate::db::Database;
use crate::fs::sandbox::RootManager;
use crate::models::{FsEvent, User};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{broadcast, RwLock};

#[derive(Clone)]
pub struct AppState {
    pub db: Database,
    pub roots: RootManager,
    pub tx: broadcast::Sender<FsEvent>,
    pub sessions: Arc<RwLock<HashMap<String, User>>>,
}

impl AppState {
    pub fn new(db: Database, roots: RootManager, tx: broadcast::Sender<FsEvent>) -> Self {
        Self {
            db,
            roots,
            tx,
            sessions: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn create_session(&self, user: User) -> String {
        let token = uuid::Uuid::new_v4().to_string();
        let mut sessions = self.sessions.write().await;
        sessions.insert(token.clone(), user);
        token
    }

    pub async fn get_session_user(&self, token: &str) -> Option<User> {
        let sessions = self.sessions.read().await;
        sessions.get(token).cloned()
    }

    pub async fn remove_session(&self, token: &str) {
        let mut sessions = self.sessions.write().await;
        sessions.remove(token);
    }
}
