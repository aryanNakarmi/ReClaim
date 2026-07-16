
import axios from "./axios";
import { API } from "./endpoints";

export interface Message {
  _id: string;
  chatId: string;
  senderId: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
  };
  senderRole: "user" | "admin";
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
  };
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Admin: get all chats (inbox)
export const getAllChats = async () => {
  try {
    const response = await axios.get(API.CHAT.GET_ALL);
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to fetch chats"
    );
  }
};

// Admin: get messages for a specific chat
export const getChatMessages = async (chatId: string) => {
  try {
    const response = await axios.get(API.CHAT.GET_MESSAGES(chatId));
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to fetch messages"
    );
  }
};

// Admin: send a message in a chat
export const sendAdminMessage = async (chatId: string, content: string) => {
  try {
    const response = await axios.post(API.CHAT.SEND_ADMIN_MESSAGE(chatId), { content });
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to send message"
    );
  }
};

// Mark messages as read
export const markAsRead = async (chatId: string) => {
  try {
    const response = await axios.put(API.CHAT.MARK_READ(chatId));
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to mark as read"
    );
  }
};

// User: get or create own chat
export const getMyChat = async () => {
  try {
    const response = await axios.get(API.CHAT.MY_CHAT);
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to get chat"
    );
  }
};

// User: send a message
export const sendUserMessage = async (content: string) => {
  try {
    const response = await axios.post(API.CHAT.SEND_USER_MESSAGE, { content });
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to send message"
    );
  }
};
