"use server";

import {
  getAllChats,
  getChatMessages,
  sendAdminMessage,
  sendUserMessage,
  getMyChat,
  markAsRead,
} from "@/lib/api/chat";

export const handleGetAllChats = async () => {
  try {
    const response = await getAllChats();
    if (response.success) {
      return { success: true, data: response.data };
    }
    return { success: false, message: response.message || "Failed to fetch chats", data: [] };
  } catch (error: Error | any) {
    return { success: false, message: error.message || "Failed to fetch chats", data: [] };
  }
};

export const handleGetChatMessages = async (chatId: string) => {
  try {
    const response = await getChatMessages(chatId);
    if (response.success) {
      return { success: true, data: response.data };
    }
    return { success: false, message: response.message || "Failed to fetch messages", data: null };
  } catch (error: Error | any) {
    return { success: false, message: error.message || "Failed to fetch messages", data: null };
  }
};

export const handleSendAdminMessage = async (chatId: string, content: string) => {
  try {
    const response = await sendAdminMessage(chatId, content);
    if (response.success) {
      return { success: true, data: response.data };
    }
    return { success: false, message: response.message || "Failed to send message", data: null };
  } catch (error: Error | any) {
    return { success: false, message: error.message || "Failed to send message", data: null };
  }
};

export const handleSendUserMessage = async (content: string) => {
  try {
    const response = await sendUserMessage(content);
    if (response.success) {
      return { success: true, data: response.data };
    }
    return { success: false, message: response.message || "Failed to send message", data: null };
  } catch (error: Error | any) {
    return { success: false, message: error.message || "Failed to send message", data: null };
  }
};

export const handleGetMyChat = async () => {
  try {
    const response = await getMyChat();
    if (response.success) {
      return { success: true, data: response.data };
    }
    return { success: false, message: response.message || "Failed to get chat", data: null };
  } catch (error: Error | any) {
    return { success: false, message: error.message || "Failed to get chat", data: null };
  }
};

export const handleMarkAsRead = async (chatId: string) => {
  try {
    const response = await markAsRead(chatId);
    return { success: response.success };
  } catch (error: Error | any) {
    return { success: false };
  }
};
