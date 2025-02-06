import { useState, useEffect, useRef } from "react";
import "./App.css"
export default function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [ws, setWs] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:3000/ws");
        socket.onmessage = (event) => {
            setMessages((prev) => [...prev, event.data]);
        };
        setWs(socket);

        return () => socket.close();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (ws && input.trim() !== "") {
            ws.send(input);
            setMessages((prev) => [...prev, `You: ${input}`]);
            setInput("");
        }
    };

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700 text-white p-4">
            <div className="w-full max-w-md h-96 bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col border border-gray-600">
                <h2 className="text-xl font-bold text-center mb-2">Chat</h2>
                <div className="flex-1 overflow-auto scrollbar-hide p-2 bg-gray-700 rounded-lg">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`p-2 my-1 rounded-lg max-w-xs ${
                                msg.startsWith("You:") ? "bg-blue-500 ml-auto" : "bg-gray-600"
                            }`}
                        >
                            {msg}
                        </div>
                    ))}
                    <div ref={messagesEndRef}></div>
                </div>
                <div className="flex mt-2">
                    <input
                        type="text"
                        className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 text-white"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                    />
                    <button
                        onClick={sendMessage}
                        className="ml-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white transition"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
