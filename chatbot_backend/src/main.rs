use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    extract::State,
    response::IntoResponse,
    routing::get,
    Router,
};
use mongodb::{bson::doc, options::ClientOptions, Client, Database};
use std::{net::SocketAddr, sync::Arc};
use tokio::sync::Mutex;

#[derive(Clone)]
struct AppState {
    db: Database,
}

async fn handle_socket(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| websocket_handler(socket, state))
}

async fn websocket_handler(mut socket: WebSocket, state: Arc<AppState>) {
    while let Some(Ok(msg)) = socket.recv().await {
        if let Message::Text(text) = msg {
            let messages_collection = state.db.collection("messages");
            let _ = messages_collection
                .insert_one(doc! { "message": &text }, None)
                .await;

            let _ = socket.send(Message::Text(format!("Stored: {}", text))).await;
        }
    }
}

#[tokio::main]
async fn main() {
    let mongo_client = Client::with_uri_str("mongodb://localhost:27017")
        .await
        .expect("MongoDB connection failed");
    let db = mongo_client.database("chatbot");

    let app_state = Arc::new(AppState { db });

    let app = Router::new()
        .route("/ws", get(handle_socket))
        .with_state(app_state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Server running on http://{}", addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
