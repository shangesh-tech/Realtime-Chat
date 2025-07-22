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
} from "lucide-react"

export function ChatWindow({ selectedChat, currentUser, onBackClick }) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const messagesEndRef = useRef(null)

  // Mock messages for selected chat
  useEffect(() => {
    if (selectedChat) {
      if (selectedChat.type === "group") {
        setMessages([
          {
            id: "1",
            text: "Hey everyone! How's the project going?",
            sender: "2",
            senderName: "Alice Johnson",
            senderAvatar: "/placeholder.svg?height=32&width=32",
            timestamp: "2:30 PM",
            type: "received",
            status: "read",
          },
          {
            id: "2",
            text: "I'm making good progress on the frontend. Should have it ready by tomorrow!",
            sender: currentUser.id,
            senderName: currentUser.name,
            senderAvatar: currentUser.avatar,
            timestamp: "2:32 PM",
            type: "sent",
            status: "read",
          },
          {
            id: "3",
            text: "Great! I've finished the API endpoints. Let me know if you need any changes.",
            sender: "3",
            senderName: "Bob Smith",
            senderAvatar: "/placeholder.svg?height=32&width=32",
            timestamp: "2:35 PM",
            type: "received",
            status: "delivered",
          },
        ])
      } else {
        setMessages([
          {
            id: "1",
            text: "Hey! How are you doing?",
            sender: selectedChat.id,
            senderName: selectedChat.name,
            senderAvatar: selectedChat.avatar,
            timestamp: "2:30 PM",
            type: "received",
            status: "read",
          },
          {
            id: "2",
            text: "I'm doing great! Thanks for asking. How about you?",
            sender: currentUser.id,
            senderName: currentUser.name,
            senderAvatar: currentUser.avatar,
            timestamp: "2:32 PM",
            type: "sent",
            status: "read",
          },
          {
            id: "3",
            text: "Pretty good! Working on some exciting projects.",
            sender: selectedChat.id,
            senderName: selectedChat.name,
            senderAvatar: selectedChat.avatar,
            timestamp: "2:35 PM",
            type: "received",
            status: "delivered",
          },
        ])
      }
    }
  }, [selectedChat, currentUser.id, currentUser.name, currentUser.avatar])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!message.trim()) return

    const newMessage = {
      id: Date.now().toString(),
      text: message,
      sender: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "sent",
      status: "sending",
    }

    setMessages((prev) => [...prev, newMessage])
    setMessage("")

    // Simulate message status updates
    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "sent" } : msg)))
    }, 1000)

    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg)))
    }, 2000)
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
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      default:
        return null
    }
  }

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center chat-bg">
        <div className="text-center p-6">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Send className="h-12 w-12 md:h-16 md:w-16 text-blue-500" />
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
                src={selectedChat?.avatar || "/placeholder.svg"} 
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
          <button
            className="h-9 w-9 md:h-10 md:w-10 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full hidden md:flex items-center justify-center"
          >
            <Search className="h-4 w-4 md:h-5 md:w-5" />
          </button>
          <button
            className="h-9 w-9 md:h-10 md:w-10 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full flex items-center justify-center"
          >
            <Phone className="h-4 w-4 md:h-5 md:w-5" />
          </button>
          <button
            className="h-9 w-9 md:h-10 md:w-10 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full hidden md:flex items-center justify-center"
          >
            <Video className="h-4 w-4 md:h-5 md:w-5" />
          </button>
          <div className="relative">
            <button
              className="h-9 w-9 md:h-10 md:w-10 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full flex items-center justify-center"
              onClick={() => document.getElementById('chat-dropdown').classList.toggle('hidden')}
            >
              <MoreVertical className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <div id="chat-dropdown" className="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 md:hidden">Search Messages</button>
              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 md:hidden">Video Call</button>
              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">View Profile</button>
              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mute Notifications</button>
              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Clear Chat</button>
              <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Block User</button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 chat-bg custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex message-enter ${msg.type === "sent" ? "justify-end" : "justify-start"}`}>
            <div
              className={`flex items-end space-x-2 max-w-[80%] md:max-w-[70%] ${
                msg.type === "sent" ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              {msg.type === "received" && selectedChat?.type === "group" && (
                <div className="h-6 w-6 md:h-8 md:w-8 flex-shrink-0 rounded-full overflow-hidden">
                  <img 
                    src={msg.senderAvatar || "/placeholder.svg"} 
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
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                }`}
              >
                {msg.type === "received" && selectedChat?.type === "group" && (
                  <div className="flex items-center space-x-1 mb-1">
                    <p className="text-xs font-semibold text-blue-600">{msg.senderName}</p>
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
                  <p className={`text-[10px] md:text-xs ${msg.type === "sent" ? "text-blue-100" : "text-gray-500"}`}>
                    {msg.timestamp}
                  </p>
                  {msg.type === "sent" && <div className="ml-1 md:ml-2">{getStatusIcon(msg.status)}</div>}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-2 md:p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <button
            type="button"
            className="h-10 w-10 md:h-12 md:w-12 text-gray-500 hover:text-gray-700 hover:bg-gray-100 flex-shrink-0 rounded-full flex items-center justify-center"
          >
            <Paperclip className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <div className="flex-1 relative">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full pr-12 py-2.5 md:py-3 h-10 md:h-12 rounded-full border-2 border-gray-200 focus:border-blue-400 focus:ring-blue-400 shadow-sm text-sm md:text-base px-4 focus:outline-none"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 md:h-8 md:w-8 text-gray-500 hover:text-gray-700 rounded-full flex items-center justify-center"
            >
              <Smile className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>
          <button
            type="submit"
            disabled={!message.trim()}
            className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 flex-shrink-0 shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
          >
            <Send className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </button>
        </form>
      </div>
    </div>
  )
}
