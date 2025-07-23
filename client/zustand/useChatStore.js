import { create } from "zustand";
import toast from "react-hot-toast";
import useAuthStore from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  notifications: [], // [{userId, message, timestamp}]

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await fetch("https://realtime-chat-qa08.onrender.com/api/message/users", { credentials: 'include' });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to fetch users");
      const data = await res.json();
      set({ users: data });
    } catch (error) {
      toast.error(error.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await fetch(`https://realtime-chat-qa08.onrender.com/api/message/${userId}`, { credentials: 'include' });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to fetch messages");
      const data = await res.json();
      set({ messages: data.map(msg => ({ ...msg, type: msg.senderId === useAuthStore.getState().authUser.id ? 'sent' : 'received' })) });
    } catch (error) {
      toast.error(error.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  addTempMessage: (tempMessage) => {
    set({ messages: [...get().messages, tempMessage] });
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      if (!selectedUser?._id) {
        console.error("Cannot send message: No selected user");
        return;
      }
      const res = await fetch(`https://realtime-chat-qa08.onrender.com/api/message/send/${selectedUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
        credentials: 'include'
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }
      
      const data = await res.json();
      const newMessage = { ...data, type: 'sent', status: 'delivered' };
      
      const updatedMessages = messages.map(msg => 
        msg._id.toString().startsWith('temp-') ? newMessage : msg
      );
      
      set({ messages: updatedMessages });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Failed to send message");

      const updatedMessages = messages.map(msg => 
        msg._id.toString().startsWith('temp-') 
          ? {...msg, status: 'failed'} 
          : msg
      );
      
      set({ messages: updatedMessages });
    }
  },

  isUserOnline: (userId) => {
    const onlineUsers = useAuthStore.getState().onlineUsers;
    return onlineUsers.includes(userId);
  },

  showNotification: (userId, message) => {
    const users = get().users;
    const user = users.find(u => u._id === userId);
    const userName = user ? user.name : 'Someone';
    
    // Add to notifications
    const notification = { userId, message, timestamp: new Date() };
    set({ notifications: [...get().notifications, notification] });
    
    // Show toast notification
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex`}>
        <div className="flex-1 p-4">
          <div className="flex items-start">
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {userName}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {message.length > 30 ? message.substring(0, 30) + '...' : message}
              </p>
            </div>
          </div>
        </div>
      </div>
    ), { duration: 3000 });
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.error("Socket not available for subscription");
      return;
    }

    console.log("Socket connection status:", socket.connected ? "connected" : "disconnected");
    console.log("Subscribing to messages for user:", selectedUser._id);

    // Remove any existing listeners to prevent duplicates
    socket.off("newMessage");
    
    socket.on("newMessage", (newMessage) => {
      console.log('Received new message:', newMessage);
      
      const currentSelectedUser = get().selectedUser;
      
      // Show notification if message not from currently selected user
      if (!currentSelectedUser || newMessage.senderId !== currentSelectedUser._id) {
        get().showNotification(newMessage.senderId, newMessage.text || 'Sent you a message');
        return;
      }
      
      const isMessageFromSelectedUser = newMessage.senderId === currentSelectedUser._id;
      if (!isMessageFromSelectedUser) {
        console.log("Message not from selected user");
        return;
      }

      set({
        messages: [...get().messages, { ...newMessage, type: 'received' }],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
