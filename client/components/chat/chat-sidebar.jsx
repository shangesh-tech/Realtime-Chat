"use client"

import { useState } from "react"
import { Search, MessageCircle, Users, MoreVertical, User, Settings, LogOut } from "lucide-react"
import { useChatStore } from '@/zustand/useChatStore';


export function ChatSidebar({ user, chats, selectedChat, onSelectChat, onNewChat, onCreateGroup }) {
  const [searchQuery, setSearchQuery] = useState("")


  const filteredChats = chats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const getChatIcon = (chat) => {
    if (chat.type === "group") {
      return <Users className="h-4 w-4 text-blue-500" />
    }
    return <User className="h-4 w-4 text-green-500" />
  }

  const getChatTypeLabel = (chat) => {
    return chat.type === "group" ? "Group" : "Direct"
  }

  const isUserOnline = useChatStore((state) => state.isUserOnline);

  return (
    <div className="w-full md:w-80 h-full bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <div className="p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="h-9 w-9 md:h-10 md:w-10 ring-2 ring-white/20 rounded-full overflow-hidden">
                  <img 
                    src={"https://avatar.iran.liara.run/public"} 
                    alt={user.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 24 24' fill='white' opacity='0.2'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='12' font-weight='bold'>" + user.name.charAt(0) + "</text></svg>";
                    }}
                  />
                </div>
              </div>
              <h2 className="font-semibold text-base md:text-lg">Chats</h2>
            </div>
            <div className="flex items-center space-x-1">
              
              <div className="relative">
                <button
                  className="h-9 w-9 md:h-10 md:w-10 text-white hover:bg-white/10 rounded-full flex items-center justify-center"
                  onClick={() => document.getElementById('dropdown-menu').classList.toggle('hidden')}
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
                <div id="dropdown-menu" className="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 py-1">
                  <button className="text-black w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </button>
                  <button className="text-black w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-red-600">
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-3 pb-3 md:px-4 md:pb-4">
          <div className="relative">
            <Search className="text-white absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
            <input
              type="text"
              placeholder="Search user to chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 h-9 md:h-10 bg-white/10 border-transparent placeholder-white/60 text-white focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 rounded-lg shadow-sm text-sm outline-none"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-2 md:p-3 border-b border-gray-100">
        <div className="flex space-x-2">
          <button
            onClick={onNewChat}
            className="flex-1 h-9 md:h-10 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg text-xs md:text-sm flex items-center justify-center shadow-sm"
          >
            <MessageCircle className="h-4 w-4 mr-1.5" />
            New Chat
          </button>
          <button
            onClick={onCreateGroup}
            className="flex-1 h-9 md:h-10 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg text-xs md:text-sm flex items-center justify-center shadow-sm"
          >
            <Users className="h-4 w-4 mr-1.5" />
            New Group
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="divide-y divide-gray-100">
          {filteredChats.map((chat) => (
            <button
              key={chat._id}
              onClick={() => onSelectChat(chat)}
              className={`w-full p-3 md:p-4 transition-colors duration-200 ${
                selectedChat?.id === chat.id ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="h-12 w-12 md:h-14 md:w-14 rounded-full overflow-hidden">
                    <img 
                      src={"https://avatar.iran.liara.run/public"} 
                      alt={chat.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const bgClass = chat.type === "group" 
                          ? "bg-gradient-to-r from-purple-400 to-pink-400" 
                          : "bg-gradient-to-r from-green-400 to-blue-400";
                        e.target.src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 24 24' class='${bgClass}'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='12' font-weight='bold' fill='white'>${chat.name.charAt(0)}</text></svg>`;
                      }}
                    />
                  </div>
                  <div className="absolute -top-1 -right-1">{getChatIcon(chat)}</div>
                  
                  {/* Add online status indicator */}
                  {chat.type === 'direct' && (
                    <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                      isUserOnline(chat._id) ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`font-semibold truncate text-sm md:text-base ${
                        selectedChat?.id === chat.id ? "text-blue-700" : "text-gray-900"
                      }`}
                    >
                      {chat.name}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{chat.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs md:text-sm text-gray-600 truncate pr-2">
                      {chat.type === 'direct' && isUserOnline(chat._id) ? 'Online' : chat.lastMessage || 'Start a conversation'}
                    </p>
                    {chat.unread > 0 && (
                      <div className="bg-purple-500 h-5 w-5 md:h-6 md:w-6 p-0 flex items-center justify-center text-xs flex-shrink-0 text-white rounded-full">
                        {chat.unread}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
