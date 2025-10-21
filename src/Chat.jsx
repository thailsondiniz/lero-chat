import React, { useEffect, useState, useRef } from "react";
import { VscSend } from "react-icons/vsc";
import { FaSmile } from "react-icons/fa";
import io from "socket.io-client";
import axios from "axios";

// conecta ao backend
// const socket = io("http://localhost:3000");
const socket = io("https://lero-chat-api-production.up.railway.app");
const API_URL = "https://lero-chat-api-production.up.railway.app";

export const Chat = () => {
  const [name, setName] = useState(() => localStorage.getItem("name") || "");
  const [tempName, setTempName] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      setChat((prev) => [...prev, msg]);
    });

    socket.on("onlineUsers", (count) => {
      setOnlineCount(count);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("onlineUsers");
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  useEffect(() => {
    if (name) {
      socket.emit("join", name);

      axios
        .get(`${API_URL}/messages`)
        .then((res) => setChat(res.data))
        .catch((err) => console.error(err));
    }
  }, [name]);

  const handleJoin = () => {
    if (tempName.trim() === "") return;
    localStorage.setItem("name", tempName);
    setName(tempName);
  };

  const sendMessage = () => {
    if (message.trim() === "") return;
    const msg = { name, text: message };
    socket.emit("sendMessage", msg);
    setMessage("");
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="w-full h-[100dvh] lg:min-h-screen sm:h-[90vh] flex items-center justify-center bg-black p-0 sm:p-4">
      <div className="w-full h-full sm:w-[90%] sm:h-[90vh] md:w-[700px] lg:w-[900px] bg-[#EDF0F6] flex flex-col justify-between rounded-none sm:rounded-2xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="flex sm:flex-row sm:justify-between sm:items-center gap-3 p-4 border-b border-[#B5B5B5]">
          <h1 className="font-bold text-xl sm:text-2xl text-center sm:text-left">
            Lero Chat
          </h1>
          <div className="bg-[#D0E6E6] px-4 py-2 rounded-2xl text-center">
            <span className="text-[#469C8A] text-sm sm:text-base">
              🟢 {onlineCount} pessoas online
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chat.map((msg, i) => {
            if (msg.system) {
              return (
                <div key={i} className="flex justify-center">
                  <span className="text-gray-500 text-xs italic">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={i}
                className={`flex flex-col ${
                  msg.name === name ? "items-end" : "items-start"
                }`}
              >
                <span className="text-xs text-gray-600 mb-1">
                  {msg.name === name ? "Você" : msg.name},{" "}
                  {formatTime(msg.createdAt)}
                </span>
                <div
                  className={`max-w-[75%] sm:max-w-[60%] rounded-lg p-3 text-sm sm:text-base break-words ${
                    msg.name === name
                      ? "bg-[#D0D4E7]"
                      : "bg-[#C8E6C9] text-gray-800"
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Nome */}
        {!name && (
          <div className="bg-white flex items-center gap-3 p-3 sm:p-4 border-t border-gray-200">
            <input
              type="text"
              placeholder="Digite seu nome"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="flex-1 border-0 outline-none text-sm sm:text-base p-2"
            />
            <button
              onClick={handleJoin}
              className="bg-[#0B89FF] p-2 sm:p-3 rounded-lg flex items-center justify-center hover:bg-[#0077e6] transition-colors cursor-pointer text-white"
            >
              Entrar
            </button>
          </div>
        )}

        {/* Input Mensagem */}
        {name && (
          <div className="bg-white flex items-center gap-3 p-3 sm:p-4 border-t border-gray-200">
            <input
              type="text"
              placeholder="Digite uma mensagem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 border-0 outline-none text-sm sm:text-base p-2"
            />
            {/* <FaSmile
              color="#B5B5B5"
              size={24}
              className="cursor-pointer hover:scale-110 transition-transform"
            /> */}
            <button
              onClick={sendMessage}
              className="bg-[#0B89FF] p-2 sm:p-3 rounded-lg flex items-center justify-center hover:bg-[#0077e6] transition-colors cursor-pointer"
            >
              <VscSend color="#FFFFFF" size={24} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
