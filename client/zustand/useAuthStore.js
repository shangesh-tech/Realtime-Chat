import { create } from "zustand";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const API_URL = "https://realtime-chat-qa08.onrender.com";    

const useAuthStore = create((set, get) => ({
  authUser: null,
  isLoading: false,
  socket: null,
  onlineUsers: [],

  // Check current auth (session)
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/auth/session`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("No user session");
      const data = await res.json();
      if (data?.user) {
        set({ authUser: data.user, isLoading: false });
        // Connect socket after user authentication
        get().connectSocket();
      } else {
        set({ authUser: null, isLoading: false });
      }
    } catch (err) {
      set({ authUser: null, isLoading: false });
    }
  },

  // Logout
  logout: async () => {
    set({ isLoading: true });
    try {
      // Disconnect socket
      if (get().socket) {
        get().socket.disconnect();
      }

      const res = await fetch(`${API_URL}/auth/signout`, {
        method: 'POST',
        credentials: 'include',
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });
      if (res.ok) {
        set({ authUser: null, isLoading: false });
        toast.success("Logged out");
        get().disconnectSocket();
      } else {
        set({ isLoading: false });
        toast.error("Logout failed");
      }
    } catch (err) {
      set({ isLoading: false, error: "Logout failed" });
      toast.error("Logout failed");
    }
  },

  setSocket: (socket) => set({ socket }),

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser) return;

    try {
      const socket = io('https://realtime-chat-qa08.onrender.com', {
        query: { userId: authUser.id },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      socket.on('connect', () => {
        console.log('Socket connected with ID:', socket.id);
      });

      socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
      });

      socket.on('getOnlineUsers', (onlineUserIds) => {
        console.log('Online users:', onlineUserIds);
        set({ onlineUsers: onlineUserIds });
      });

      set({ socket });
      return socket;
    } catch (error) {
      console.error('Error connecting to socket:', error);
      return null;
    }
  },
  disconnectSocket: () => {
    if (get().socket?.connected) {
      get().socket.disconnect();
      set({ socket: null });
    }
  },
}));

export default useAuthStore;
