"use client";
import React, { useEffect, useState } from 'react';
import { Search, MoreVertical, MessageSquare } from 'lucide-react';
import NewChatModal from './NewChatModal';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

// Types
interface User {
  id: string;
  username: string;
  avatar?: string;
  isOnline?: boolean;
}
interface Chat {
  id: string;
  isGroup: boolean;
  name?: string;
  updatedAt: string;
  participants: User[];
  messages: { content: string; createdAt: string; type: string }[];
}

export default function Sidebar({ onSelectChat, selectedChatId }: { onSelectChat: (chat: any) => void, selectedChatId: string | null }) {
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const { user } = useAuth();
  const { socket } = useSocket();

  const fetchChats = async () => {
    try {
      const { data } = await api.get('/chat');
      setChats(data);
    } catch (error) {
      console.error("Failed to fetch chats", error);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [isNewChatOpen]); // Refetch when modal closes (potentially new chat created)

  // Real-time update for sidebar (e.g. moving chat to top on new message)
  useEffect(() => {
    if(!socket) return;
    const handleMessage = (newMessage: any) => {
        // Simple logic: refetch chats to update order and last message
        // A optimized version would update state locally
        fetchChats(); 
    };
    socket.on("receive_message", handleMessage);
    return () => {
        socket.off("receive_message", handleMessage);
    };
  }, [socket]);

  const getChatName = (chat: Chat) => {
    if (chat.isGroup) return chat.name;
    const other = chat.participants.find(p => p.id !== user?.id);
    return other?.username || "User";
  };
  
  const getChatAvatar = (chat: Chat) => {
    // Return avatar logic
     const other = chat.participants.find(p => p.id !== user?.id);
    return other?.username?.[0].toUpperCase() || "?";
  };

  return (
    <div className="flex flex-col h-full bg-[#111b21] border-r border-[#202c33] relative">
      {/* Header */}
      <div className="h-16 bg-[#202c33] flex items-center justify-between px-4 py-2 border-b border-[#222e35]">
        <div className="w-10 h-10 rounded-full bg-[#00a884] overflow-hidden cursor-pointer flex items-center justify-center text-[#111b21] font-bold">
           {user?.username?.[0]?.toUpperCase() || "ME"}
        </div>
        <div className="flex items-center gap-4 text-[#aebac1]">
          <button 
            onClick={() => setIsNewChatOpen(true)}
            title="New Chat" 
            className="p-2 hover:bg-[#374248] rounded-full transition-colors"
          >
            <MessageSquare size={20} />
          </button>
          <button title="Menu" className="p-2 hover:bg-[#374248] rounded-full transition-colors"><MoreVertical size={20} /></button>
        </div>
      </div>
      
      {/* Search */}
      <div className="p-2 border-b border-[#202c33]">
        <div className="bg-[#202c33] rounded-lg flex items-center px-4 py-2">
          <Search size={18} className="text-[#aebac1] mr-4" />
          <input 
            type="text" 
            placeholder="Search or start new chat" 
            className="bg-transparent text-[#d1d7db] placeholder-[#8696a0] w-full text-sm focus:outline-none"
          />
        </div>
      </div>
      
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {chats.map(chat => {
          const name = getChatName(chat);
          const lastMsg = chat.messages?.[0];
          const isActive = selectedChatId === chat.id;

          return (
          <div 
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className={`flex items-center p-3 cursor-pointer transition-colors border-b border-[#222e35] last:border-0 ${isActive ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'}`}
          >
            <div className={`w-12 h-12 rounded-full mr-3 flex-shrink-0 flex items-center justify-center text-white font-bold bg-gray-600`}>
               {getChatAvatar(chat)}
            </div>
            <div className="flex-1 min-w-0">
               <div className="flex justify-between items-baseline mb-1">
                 <h3 className="text-[#e9edef] font-medium truncate">{name}</h3>
                 <span className="text-xs text-[#8696a0]">
                   {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                 </span>
               </div>
               <div className="flex justify-between items-center">
                 <p className="text-[#8696a0] text-sm truncate mr-2 overflow-hidden whitespace-nowrap">
                   {lastMsg ? lastMsg.content : "Start a conversation"}
                 </p>
               </div>
            </div>
          </div>
        )})}
      </div>

      <NewChatModal isOpen={isNewChatOpen} onClose={() => setIsNewChatOpen(false)} />
    </div>
  );
}
