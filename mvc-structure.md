bash

root-directory/     # Backend (Rust) is in the root
│── frontend/       # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Chat.jsx
│   │   │   ├── Message.jsx
│   ├── package.json
│   ├── vite.config.js
│── src/            # Rust backend source files
│   ├── main.rs
│   ├── ws_handler.rs
│── Cargo.toml
│── Cargo.lock
│── README.md
