"use client"

import { useState, useRef, useEffect } from "react"
import {
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  Users,
  Crown,
  Shield,
  CheckCheck,
  Check,
  ArrowLeft,
  Search,
  X,
} from "lucide-react"
import { useChatStore } from '@/zustand/useChatStore';
import useAuthStore from '@/zustand/useAuthStore';

export function ChatWindow({ selectedChat, currentUser, onBackClick }) {
  const [message, setMessage] = useState("")
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)

  const messages = useChatStore((state) => state.messages);
  const isMessagesLoading = useChatStore((state) => state.isMessagesLoading);
  const getMessages = useChatStore((state) => state.getMessages);
  const subscribeToMessages = useChatStore((state) => state.subscribeToMessages);
  const unsubscribeFromMessages = useChatStore((state) => state.unsubscribeFromMessages);

  useEffect(() => {
    if (selectedChat) {
      getMessages(selectedChat._id);
      subscribeToMessages();
    }
    return () => unsubscribeFromMessages();
  }, [selectedChat]);

  useEffect(() => {
    const socket = useAuthStore.getState().socket;
    if (socket && selectedChat) {
      subscribeToMessages();
      socket.on('connect_error', (err) => console.error('Socket connect error:', err));
    }
    return () => {
      if (socket) {
        unsubscribeFromMessages();
        socket.off('connect_error');
      }
    };
  }, [selectedChat, subscribeToMessages, unsubscribeFromMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('File size should not exceed 5MB')
      return
    }

    setSelectedImage(file)
    
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleFileButtonClick = () => {
    fileInputRef.current.click()
  }

  const clearSelectedImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    fileInputRef.current.value = ''
  }

  const handleSendMessage = (e) => {
    e.preventDefault();
    if ((!message.trim() && !selectedImage) || !selectedChat) return;
    
    try {
      const tempMessage = {
        _id: 'temp-' + Date.now(),
        text: message,
        senderId: currentUser.id,
        receiverId: selectedChat._id,
        createdAt: new Date().toISOString(),
        type: 'sent',
        status: 'sending',
        image: imagePreview  // Include the image preview
      };
      
      useChatStore.getState().addTempMessage(tempMessage);
      
      // Create message data with image
      const messageData = {
        text: message
      }
      
      // If there's a selected image, add it to the message data
      if (selectedImage) {
        const reader = new FileReader()
        reader.readAsDataURL(selectedImage)
        reader.onload = () => {
          // Send message with image data
          useChatStore.getState().sendMessage({
            ...messageData,
            image: reader.result
          })
        }
      } else {
        // Send message without image
        useChatStore.getState().sendMessage(messageData)
      }
      
      // Clear fields
      setMessage("")
      clearSelectedImage()
    } catch (error) {
      console.error("Error in handleSendMessage:", error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "sending":
        return <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin" />
      case "sent":
        return <Check className="h-3 w-3 text-gray-400" />
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-gray-400" />
      case "read":
        return <CheckCheck className="h-3 w-3 text-purple-500" />
      default:
        return null
    }
  }

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center chat-bg">
        <div className="text-center p-6">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-r from-purple-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Send className="h-12 w-12 md:h-16 md:w-16 text-purple-500" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-700 mb-3">Select a chat to start messaging</h3>
          <p className="text-sm md:text-lg text-gray-500">Choose from your existing conversations or start a new one</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white h-full">
      {/* Chat Header */}
      <div className="flex items-center p-3 md:p-6 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 shadow-sm">
        <div className="flex items-center flex-1 min-w-0">
          {onBackClick && (
            <button
              className="h-10 w-10 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full mr-2 md:mr-4 flex items-center justify-center"
              onClick={onBackClick}
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
          )}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="h-10 w-10 md:h-12 md:w-12 ring-2 ring-gray-200 flex-shrink-0 rounded-full overflow-hidden">
              <img 
                src={ "https://avatar.iran.liara.run/public"} 
                alt={selectedChat?.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 24 24' fill='${selectedChat?.type === "group" ? "#a855f7" : "#3b82f6"}' opacity='0.8'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='12' font-weight='bold'>${selectedChat?.name.charAt(0)}</text></svg>`;
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-gray-900 text-base md:text-xl truncate">{selectedChat?.name}</h2>
                <span
                  className={`hidden md:inline-flex text-xs px-2 py-1 rounded-full ${
                    selectedChat?.type === "group" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"
                  }`}
                >
                  {selectedChat?.type === "group" ? "Group" : "Direct"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {selectedChat?.type === "group" ? (
                  <span className="text-xs md:text-sm text-gray-600 truncate">5 members, 3 online</span>
                ) : (
                  <span className="text-xs md:text-sm text-green-600 truncate">Online</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1 md:space-x-2">
          
          <div className="relative">
            <button
              className="h-9 w-9 md:h-10 md:w-10 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full flex items-center justify-center"
              onClick={() => document.getElementById('chat-dropdown').classList.toggle('hidden')}
            >
              <MoreVertical className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <div id="chat-dropdown" className="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">View Profile</button>
              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Clear Chat</button>
              <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Block User</button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 chat-bg custom-scrollbar">
        {isMessagesLoading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id || msg.id} className={`flex message-enter ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`flex items-end space-x-2 max-w-[80%] md:max-w-[70%] ${
                  msg.type === "sent" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                {msg.type === "received" && selectedChat?.type === "group" && (
                  <div className="h-6 w-6 md:h-8 md:w-8 flex-shrink-0 rounded-full overflow-hidden">
                    <img 
                      src={msg.senderAvatar || "https://avatar.iran.liara.run/public"} 
                      alt={msg.senderName}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 24 24' fill='%23718096' opacity='0.8'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='10' font-weight='bold'>${msg.senderName.charAt(0)}</text></svg>`;
                      }}
                    />
                  </div>
                )}
                <div
                  className={`px-3 py-2 md:px-4 md:py-3 rounded-2xl shadow-sm ${
                    msg.type === "sent"
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-br-none"     
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                  }`}
                >
                  {msg.image && (
                    <div className="mb-2">
                      <img 
                        src={msg.image} 
                        alt="Attached" 
                        className="max-h-60 rounded-lg" 
                      />
                    </div>
                  )}
                  {msg.type === "received" && selectedChat?.type === "group" && (
                    <div className="flex items-center space-x-1 mb-1">
                      <p className="text-xs font-semibold text-purple-600">{msg.senderName}</p>
                      {msg.senderName === "Alice Johnson" && <Crown className="h-3 w-3 text-yellow-500" />}
                      {msg.senderName === "Bob Smith" && <Shield className="h-3 w-3 text-green-500" />}
                    </div>
                  )}
                  <p className="text-sm md:text-base leading-relaxed break-words">{msg.text}</p>
                  <div
                    className={`flex items-center justify-between mt-1 md:mt-2 ${
                      msg.type === "sent" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <p className={`text-[10px] md:text-xs ${msg.type === "sent" ? "text-purple-100" : "text-gray-500"}`}>
                      {msg.timestamp}
                    </p>
                    {msg.type === "sent" && <div className="ml-1 md:ml-2">{getStatusIcon(msg.status)}</div>}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-2 md:p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <button
            type="button"
            onClick={handleFileButtonClick}
            className="h-10 w-10 md:h-12 md:w-12 text-gray-500 hover:text-gray-700 hover:bg-gray-100 flex-shrink-0 rounded-full flex items-center justify-center"
          >
            <Paperclip className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <input 
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex-1 relative">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full pr-12 py-2.5 md:py-3 h-10 md:h-12 rounded-full border-2 border-gray-200 focus:border-purple-400 focus:ring-purple-400 shadow-sm text-sm md:text-base px-4 focus:outline-none text-black placeholder:text-black"
            />
            {imagePreview && (
              <div className="absolute bottom-full left-0 p-2 bg-gray-100 rounded-lg mb-2">
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Selected" 
                    className="h-24 rounded-lg" 
                  />
                  <button
                    onClick={clearSelectedImage}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 h-6 w-6 flex items-center justify-center"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 md:h-8 md:w-8 text-gray-500 hover:text-gray-700 rounded-full flex items-center justify-center"
            >
              <Smile className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>
          <button
            type="submit"
            disabled={!message.trim() || isMessagesLoading}
            className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 flex-shrink-0 shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
          >
            <Send className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </button>
        </form>
      </div>
    </div>
  )
}
