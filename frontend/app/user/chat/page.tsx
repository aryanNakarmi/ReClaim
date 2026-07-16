"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { HiChat, HiPaperAirplane } from "react-icons/hi";
import { io, Socket } from "socket.io-client";
import Image from "next/image";
import axios from "@/lib/api/axios";
import { useAuth } from "@/context/AuthContext";

const SOCKET_URL = "http://localhost:5050";
const BASE_URL = "http://localhost:5050";

interface Message {
  _id: string;
  chatId: string;
  senderId: { _id: string; fullName: string; email: string; role: string };
  senderRole: "user" | "admin";
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface Chat {
  _id: string;
  userId: { _id: string; fullName: string; email: string; profilePicture?: string };
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
}

const getAuthToken = () => {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";");
  for (let c of cookies) {
    c = c.trim();
    if (c.startsWith("auth_token="))
      return decodeURIComponent(c.substring("auth_token=".length));
  }
  return null;
};

const formatMessageTime = (dateString: string) =>
  new Date(dateString).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

const formatDateDivider = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

export default function UserChatPage() {
  const { user } = useAuth();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatIdRef = useRef<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    const socket = io(SOCKET_URL, { auth: { token }, transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("connect_error", (err) => console.error("Socket error:", err.message));
    socket.on("new_message", (message: Message) => {
      if (message.chatId === chatIdRef.current) {
        setMessages((prev) => [...prev, message]);
        if (chatIdRef.current) axios.put(`/api/v1/chats/${chatIdRef.current}/read`).catch(() => {});
      }
    });
    socket.on("user_typing", () => {
      setAdminTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setAdminTyping(false), 3000);
    });
    socket.on("user_stop_typing", () => setAdminTyping(false));
    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    const loadChat = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/v1/chats/my-chat");
        if (res.data.success) {
          const { chat, messages } = res.data.data;
          setChat(chat);
          setMessages(messages || []);
          chatIdRef.current = chat._id;
          socketRef.current?.emit("join_chat", chat._id);
          setTimeout(() => { axios.put(`/api/v1/chats/${chat._id}/read`).catch(() => {}); }, 2000);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load chat");
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(loadChat, 300);
    return () => clearTimeout(timer);
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim() || !chat || sending) return;
    const content = newMessage.trim();
    setNewMessage("");
    setSending(true);
    try {
      await axios.post("/api/v1/chats/my-chat/messages", { content });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send message");
      setNewMessage(content);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const groupedMessages = messages.reduce<{ date: string; msgs: Message[] }[]>((groups, msg) => {
    const date = formatDateDivider(msg.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.date === date) { last.msgs.push(msg); }
    else { groups.push({ date, msgs: [msg] }); }
    return groups;
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] rounded-lg overflow-hidden shadow border border-gray-200 bg-white">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-[#1B2A4F] flex items-center justify-center flex-shrink-0">
          <HiChat size={20} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-gray-900">ReClaim Support</p>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <p className="text-xs text-gray-500">
              {adminTyping ? <span className="text-[#E85D4A] italic">Admin is typing...</span> : "We typically reply within a few hours"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E85D4A]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
            <div className="w-16 h-16 bg-[#F0EDE6] rounded-full flex items-center justify-center">
              <HiChat size={32} className="text-[#E85D4A]/40" />
            </div>
            <p className="text-base font-medium text-gray-500">No messages yet</p>
            <p className="text-sm text-gray-400 text-center max-w-xs">Send us a message and our team will get back to you.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedMessages.map(({ date, msgs }) => (
              <div key={date}>
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium px-2">{date}</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="space-y-2">
                  {msgs.map((msg) => {
                    const isUser = msg.senderRole === "user";
                    return (
                      <div key={msg._id} className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
                        {!isUser && (
                          <div className="w-7 h-7 rounded-full bg-[#1B2A4F] flex items-center justify-center flex-shrink-0 mb-1">
                            <HiChat size={13} className="text-white" />
                          </div>
                        )}
                        <div className={`max-w-[70%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                          <div className={`px-4 py-2.5 rounded-lg text-sm shadow-sm ${isUser ? "bg-[#1B2A4F] text-white rounded-br-sm" : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"}`}>
                            <p className="leading-relaxed break-words">{msg.content}</p>
                          </div>
                          <p className="text-xs text-gray-400 mt-1 px-1">
                            {formatMessageTime(msg.createdAt)}
                            {isUser && <span className={`ml-1 ${msg.isRead ? "text-[#E85D4A]/60" : "text-gray-300"}`}>{msg.isRead ? "✓✓" : "✓"}</span>}
                          </p>
                        </div>
                        {isUser && (
                          <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mb-5">
                            {user?.profilePicture ? (
                              <Image src={`${BASE_URL}${user.profilePicture}`} alt={user.fullName || "You"} width={28} height={28} className="object-cover w-full h-full" unoptimized />
                            ) : (
                              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                <span className="text-xs font-bold text-gray-600">{user?.fullName?.charAt(0).toUpperCase() || "U"}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {adminTyping && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-[#1B2A4F] flex items-center justify-center flex-shrink-0">
                  <HiChat size={13} className="text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <input ref={inputRef} type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown} placeholder="Type your message..." disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B2A4F]/30 focus:border-[#1B2A4F] text-gray-900 placeholder-gray-400 text-sm bg-gray-50 disabled:opacity-50" />
        <button onClick={sendMessage} disabled={!newMessage.trim() || sending || loading}
          className="w-10 h-10 flex items-center justify-center bg-[#1B2A4F] text-white rounded-xl hover:bg-[#233459] transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
          {sending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <HiPaperAirplane size={18} className="rotate-90" />
          )}
        </button>
      </div>
    </div>
  );
}
