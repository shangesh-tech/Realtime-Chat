"use client"

import { useState } from "react"
import { Camera, Search } from "lucide-react"
import { useChatStore } from '@/zustand/useChatStore';

export function CreateGroupModal({ open, onOpenChange, onCreateGroup }) {
  const [groupName, setGroupName] = useState("")
  const [groupImage, setGroupImage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState([])

  const allUsers = useChatStore((state) => state.users);

  const filteredUsers = allUsers.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleUserToggle = (userId) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedUsers.length === 0) return

    const newGroup = {
      id: Date.now().toString(),
      name: groupName,
      avatar: groupImage || "/placeholder.svg?height=40&width=40",
      lastMessage: "Group created",
      timestamp: "Now",
      unread: 0,
      type: "group",
      members: selectedUsers,
    }

    onCreateGroup(newGroup)

    // Reset form
    setGroupName("")
    setGroupImage("")
    setSelectedUsers([])
    setSearchQuery("")
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-gradient-to-r from-purple-700 to-purple-800 rounded-lg w-full max-w-md p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Create New Group</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                <img src={"https://avatar.iran.liara.run/public"} alt="Group" className="h-full w-full object-cover" />
              </div>
              <button
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white border border-gray-200 flex items-center justify-center"
                onClick={() => {
                  // In a real app, this would open a file picker
                  setGroupImage("/placeholder.svg?height=64&width=64")
                }}
              >
                <Camera className="h-3 w-3 text-black" />
              </button>
            </div>
            <div className="flex-1">
              <label htmlFor="groupName" className="block text-sm font-medium mb-1 text-white">Group Name</label>
              <input
                id="groupName"
                className="text-white w-full px-3 py-2 border-2 border-gray-300  rounded-md placeholder:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">Add Members</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                className="text-white w-full px-10 py-2 border-2 border-gray-300  rounded-md placeholder:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-purple-600">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleUserToggle(user.id)}
                  className="h-4 w-4 text-white"
                />
                <div className="h-10 w-10 rounded-full overflow-hidden">
                  <img src={"https://avatar.iran.liara.run/public"} alt={user.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">{user.name}</h3>
                  <p className="text-sm text-gray-300">{user.status}</p>
                </div>
              </div>
            ))}
          </div>

          {selectedUsers.length > 0 && (
            <div className="text-sm text-gray-300">
              {selectedUsers.length} member{selectedUsers.length !== 1 ? "s" : ""} selected
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button 
            className="px-4 py-2 border-2 border-gray-300 rounded-md hover:text-red-500 hover:border-red-500 text-white"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button 
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${(!groupName.trim() || selectedUsers.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleCreateGroup} 
            disabled={!groupName.trim() || selectedUsers.length === 0}
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  )
}
