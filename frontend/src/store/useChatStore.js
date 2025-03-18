import { create } from "zustand";
import toast from "react-hot-toast"
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";



export const  useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true});

        try {
          const res = await axiosInstance.get("/messages/users");
          set({users: res.data});
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
          set({ isUsersLoading: false });
        }
    },

    getMessages: async(userId) => {
        set({ isMessagesLoading: true});

        try {
          const res = await axiosInstance.get(`/messages/${userId}`);
          set({ messages: res.data});
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
          set({ isMessagesLoading: false});
        }
    },

    sendMessage: async (messagedata) =>{
       const { selectedUser, messages } = get();
       try {
        const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messagedata);

        set({messages: [...messages, res.data]});
       } catch (error) {
          toast.error(error.response.data.message);
       }
    },

    subscribeToMessages: () => {
      const socket = useAuthStore.getState().socket;
      
      socket.on("newMessage", (newMessage) => {
        const { selectedUser, messages } = get();
    
        // Only update if the message is from or to the selected user
        if (
          newMessage.senderId === selectedUser?._id ||
          newMessage.receiverId === selectedUser?._id
        ) {
          set({
            messages: [...messages, newMessage],
          });
        }
      });
    },
    
    unsubscribeFromMessages: () => {
      const socket = useAuthStore.getState().socket;
      socket.off("newMessage");
    },
   
    setSelectedUser: (selectedUser) => {
      set({ selectedUser });
      get().unsubscribeFromMessages(); // Unsubscribe from previous user
      get().subscribeToMessages(); // Subscribe to the new user
    },
    
}))