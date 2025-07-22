"use client"

import { useState } from "react"
import { Search } from "lucide-react"

export function NewChatModal({ open, onOpenChange, onSelectContact }) {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock contacts
  const contacts = [
    {
      id: "4",
      name: "Emma Wilson",
      avatar: "https://avatar.iran.liara.run/public",
      status: "Online",
      type: "direct",
    },
    {
      id: "5",
      name: "Michael Brown",
      avatar: "https://avatar.iran.liara.run/public",
      status: "Last seen 2 hours ago",
      type: "direct",
    },
    {
      id: "6",
      name: "Sarah Davis",
      avatar: "https://avatar.iran.liara.run/public",
      status: "Online",
      type: "direct",
    },
    {
      id: "7",
      name: "David Miller",
      avatar: "https://avatar.iran.liara.run/public",
      status: "Last seen yesterday",
      type: "direct",
    },
  ]

  const filteredContacts = contacts.filter((contact) => contact.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleSelectContact = (contact) => {
    onSelectContact({
      ...contact,
      lastMessage: "",
      timestamp: "Now",
      unread: 0,
    })
  }

  return (
    open && (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-r from-purple-700 to-purple-800 rounded-lg shadow-lg w-full max-w-md">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Start New Chat</h2>
              <button
                onClick={() => onOpenChange(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700"
                />
              </div>
              <div className="max-h-80 overflow-y-auto space-y-2">
                {filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    className="w-full text-left p-3 hover:bg-purple-600  rounded-md transition-colors"
                    onClick={() => handleSelectContact(contact)}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                       
                          <img src={contact.avatar} alt={contact.name} className="h-full w-full object-cover" />
                        
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{contact.name}</h3>
                        <p className="text-sm text-gray-300">{contact.status}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  )
}
