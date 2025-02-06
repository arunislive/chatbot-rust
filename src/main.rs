use futures_util::{SinkExt, StreamExt};
use std::{collections::HashMap, sync::Arc};
use tokio::net::TcpListener;
use tokio::sync::{mpsc, Mutex};
use tokio_tungstenite::accept_async;
use uuid::Uuid;

type Clients = Arc<Mutex<HashMap<Uuid, mpsc::UnboundedSender<String>>>>;

#[tokio::main]
async fn main() {
    let listener = TcpListener::bind("0.0.0.0:8080").await.expect("Failed to bind"); // Accept connections from any device
    let clients: Clients = Arc::new(Mutex::new(HashMap::new()));

    while let Ok((stream, _)) = listener.accept().await {
        let clients = clients.clone();

        tokio::spawn(async move {
            let ws_stream = match accept_async(stream).await {
                Ok(ws) => ws,
                Err(_) => return,
            };

            let (mut sender, mut receiver) = ws_stream.split();
            let id = Uuid::new_v4();
            let (tx, mut rx) = mpsc::unbounded_channel();

            clients.lock().await.insert(id, tx.clone());

            loop {
                tokio::select! {
                    Some(msg) = receiver.next() => {
                        match msg {
                            Ok(msg) if msg.is_text() => {
                                let text = msg.into_text().unwrap();
                                let mut clients_guard = clients.lock().await;
                                let message = format!("User {}: {}", id, text);

                                // Broadcast message to all clients
                                for (_, client_tx) in clients_guard.iter() {
                                    let _ = client_tx.send(message.clone());
                                }
                            }
                            _ => break,
                        }
                    }
                    Some(msg) = rx.recv() => {
                        if sender.send(tokio_tungstenite::tungstenite::Message::Text(msg)).await.is_err() {
                            break;
                        }
                    }
                }
            }

            clients.lock().await.remove(&id);
        });
    }
}
