import { useState, useEffect, useRef } from "react";

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    const ws = useRef(null);

    useEffect(() => {
        const host = window.location.hostname; // Get the correct host dynamically
        ws.current = new WebSocket(`ws://${host}:8080`);

        ws.current.onmessage = (event) => {
            setMessages((prev) => [...prev, event.data]);
        };

        return () => ws.current.close();
    }, []);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (input.trim() !== "") {
            ws.current.send(input);
            setInput("");
        }
    };

    return (
        <div className="flex flex-col w-96 bg-gray-800 p-4 rounded-lg">
            <div className="h-60 overflow-y-auto border-b border-gray-600 mb-4 p-2 space-y-2">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`p-2 rounded-lg max-w-[80%] ${
                            msg.includes("User") ? "bg-blue-500 text-white ml-auto" : "bg-gray-700 text-gray-200"
                        }`}
                    >
                        {msg}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="flex">
                <input
                    type="text"
                    className="flex-1 p-2 bg-gray-700 text-white rounded-l"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <button onClick={sendMessage} className="bg-blue-600 px-4 text-white rounded-r">
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;
