"use client"

import { useState } from "react"
import { ChatSidebar } from "./chat-sidebar"
import { ChatWindow } from "./chat-window"
import { NewChatModal } from "./new-chat-modal"
import { CreateGroupModal } from "./create-group-modal"
import { useMobile } from "@/hooks/use-mobile"

export function MainChatLayout({ user }) {
  const [selectedChat, setSelectedChat] = useState(null)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
  const isMobile = useMobile()

  // Mock chat data
  const [chats] = useState([
    {
      id: "1",
      name: "Alice Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Hey! How are you doing?",
      timestamp: "2:30 PM",
      unread: 2,
      type: "direct",
    },
    {
      id: "2",
      name: "Design Team",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Alice: The new mockups are ready for review",
      timestamp: "1:45 PM",
      unread: 5,
      type: "group",
    },
    {
      id: "3",
      name: "Bob Smith",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Thanks for the help with the project!",
      timestamp: "12:15 PM",
      unread: 0,
      type: "direct",
    },
    {
      id: "4",
      name: "Marketing Team",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Sarah: Campaign results are looking great!",
      timestamp: "11:30 AM",
      unread: 3,
      type: "group",
    },
    {
      id: "5",
      name: "Emma Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "See you at the meeting tomorrow",
      timestamp: "Yesterday",
      unread: 0,
      type: "direct",
    },
  ])

  const handleNewChat = () => {
    setShowNewChatModal(true)
  }

  const handleCreateGroup = () => {
    setShowCreateGroupModal(true)
  }

  const handleSelectChat = (chat) => {
    setSelectedChat(chat)
  }

  const handleBackToChats = () => {
    setSelectedChat(null)
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Chat List View (Shown on mobile when no chat is selected) */}
      <div
        className={`${
          isMobile
            ? `fixed inset-0 bg-white z-30 transition-transform duration-300 ease-in-out ${
                selectedChat ? "translate-x-[-100%]" : "translate-x-0"
              }`
            : "relative flex-shrink-0"
        }`}
      >
        <ChatSidebar
          user={user}
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onCreateGroup={handleCreateGroup}
        />
      </div>

      {/* Chat Window (Slides in from right on mobile) */}
      <div
        className={`flex-1 flex flex-col min-w-0 relative ${
          isMobile
            ? `fixed inset-0 bg-white z-30 transition-transform duration-300 ease-in-out ${
                selectedChat ? "translate-x-0" : "translate-x-[100%]"
              }`
            : ""
        }`}
      >
        <ChatWindow
          selectedChat={selectedChat}
          currentUser={user}
          onBackClick={isMobile ? handleBackToChats : undefined}
        />
      </div>

      {/* Modals */}
      <NewChatModal
        open={showNewChatModal}
        onOpenChange={setShowNewChatModal}
        onSelectContact={(contact) => {
          setSelectedChat(contact)
          setShowNewChatModal(false)
        }}
      />

      <CreateGroupModal
        open={showCreateGroupModal}
        onOpenChange={setShowCreateGroupModal}
        onCreateGroup={(group) => {
          setSelectedChat(group)
          setShowCreateGroupModal(false)
        }}
      />
    </div>
  )
}
