"use client"

import { useState } from "react"
import { ChatSidebar } from "./chat-sidebar"
import { ChatWindow } from "./chat-window"
import { NewChatModal } from "./new-chat-modal"
import { CreateGroupModal } from "./create-group-modal"
import { useMobile } from "@/hooks/use-mobile"
import { useChatStore } from '@/zustand/useChatStore';
import { useEffect } from 'react';

export function MainChatLayout({ user }) {
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
  const isMobile = useMobile()

  const users = useChatStore((state) => state.users);
  const getUsers = useChatStore((state) => state.getUsers);
  const selectedUser = useChatStore((state) => state.selectedUser);
  const setSelectedUser = useChatStore((state) => state.setSelectedUser);

  useEffect(() => {
    getUsers();
  }, []);

  const handleNewChat = () => {
    setShowNewChatModal(true)
  }

  const handleCreateGroup = () => {
    setShowCreateGroupModal(true)
  }

  const handleSelectChat = (user) => {
    setSelectedUser(user)
  }

  const handleBackToChats = () => {
    setSelectedUser(null)
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Chat List View (Shown on mobile when no chat is selected) */}
      <div
        className={`${
          isMobile
            ? `fixed inset-0 bg-white z-30 transition-transform duration-300 ease-in-out ${
                selectedUser ? "translate-x-[-100%]" : "translate-x-0"
              }`
            : "relative flex-shrink-0"
        }`}
      >
        <ChatSidebar
          user={user}
          chats={users.map(user => ({ ...user, type: 'direct', lastMessage: '', timestamp: '', unread: 0 }))}
          selectedChat={selectedUser}
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
                selectedUser ? "translate-x-0" : "translate-x-[100%]"
              }`
            : ""
        }`}
      >
        <ChatWindow
          selectedChat={selectedUser}
          currentUser={user}
          onBackClick={isMobile ? handleBackToChats : undefined}
        />
      </div>

      {/* Modals */}
      <NewChatModal
        open={showNewChatModal}
        onOpenChange={setShowNewChatModal}
        onSelectContact={(contact) => {
          setSelectedUser(contact)
          setShowNewChatModal(false)
        }}
      />

      <CreateGroupModal
        open={showCreateGroupModal}
        onOpenChange={setShowCreateGroupModal}
        onCreateGroup={(group) => {
          setSelectedUser(group)
          setShowCreateGroupModal(false)
        }}
      />
    </div>
  )
}
