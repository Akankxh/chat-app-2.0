import {create} from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";


export const useChatStore = create((set, get) => ({
  messages : [],
  users : [],
  selectedUser: JSON.parse(localStorage.getItem("selectedUser")) || null,
  isUsersLoading : false,
  isMessagesLoading : false,

  getUsers: async () => {
        set({ isUsersLoading: true });
        try {
          const res = await axiosInstance.get("/messages/users");
          set({ users: res.data });
        } catch (error) {
          toast.error("Failed to load users");
        } finally {
          set({ isUsersLoading: false });  // ← always runs
        } 
  },

   getMessages: async (userId) => {
      set({ isMessagesLoading: true });
      try {
        const res = await axiosInstance.get(`/messages/${userId}`);
        set({ messages: res.data });
        // Persist messages for this user
        localStorage.setItem(`messages_${userId}`, JSON.stringify(res.data));
      } catch (error) {
        // Fallback to cached messages on error
        const cached = localStorage.getItem(`messages_${userId}`);
        if (cached) set({ messages: JSON.parse(cached) });
        toast.error("Failed to load messages");
      } finally {
        set({ isMessagesLoading: false });
      }
  },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
          const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
          const updated = [...messages, res.data];
          set({ messages: updated });
          localStorage.setItem(`messages_${selectedUser._id}`, JSON.stringify(updated));
        } catch (error) {
          toast.error(error.response.data.message);
        }
    },

    subscribeToMessages: () => {
      const {selectedUser} = get();
      if(!selectedUser) return;

      const socket = useAuthStore.getState().socket;
      if(!socket) return;

      socket.on("newMessage", (newMessage) => {
        if(newMessage.senderId !== selectedUser._id) return; // Ignore if not from current chat
        const { messages } = get();
        set({ messages: [...messages, newMessage] });
      });
    },

    unsubscribeFromMessages: () => {
      const socket = useAuthStore.getState().socket;
      socket.off("newMessage");
    },

    setSelectedUser: (selectedUser) => {
      set({ selectedUser });
      if (selectedUser) {
        localStorage.setItem("selectedUser", JSON.stringify(selectedUser));
        // Pre-load cached messages immediately so they show before fetch completes
        const cached = localStorage.getItem(`messages_${selectedUser._id}`);
        if (cached) set({ messages: JSON.parse(cached) });
      } else {
        localStorage.removeItem("selectedUser");
        set({ messages: [] });
      }
    },

}));