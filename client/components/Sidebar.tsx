import React, { useState } from 'react';
import { Search, MoreVertical, MessageSquare } from 'lucide-react';
import NewChatModal from './NewChatModal';

// Placeholder data
const chats = [
  { id: '1', name: 'Alice', lastMessage: 'See you later!', time: '10:00 AM', unread: 2 },
  { id: '2', name: 'Bob', lastMessage: 'Can you send the file?', time: 'Yesterday', unread: 0 },
  { id: '3', name: 'Charlie', lastMessage: 'Where are you?', time: 'Monday', unread: 5 },
  { id: '4', name: 'David', lastMessage: 'Ok', time: 'Sunday', unread: 0 },
];

export default function Sidebar({ onSelectChat }: { onSelectChat: (id: string) => void }) {
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[#111b21] border-r border-[#202c33] relative">
      {/* Header */}
      <div className="h-16 bg-[#202c33] flex items-center justify-between px-4 py-2 border-b border-[#222e35]">
        <div className="w-10 h-10 rounded-full bg-gray-500 overflow-hidden cursor-pointer flex items-center justify-center text-white font-bold">
           ME
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
        {chats.map(chat => (
          <div 
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className="flex items-center p-3 cursor-pointer hover:bg-[#202c33] transition-colors border-b border-[#222e35] last:border-0"
          >
            <div className={`w-12 h-12 rounded-full mr-3 flex-shrink-0 flex items-center justify-center text-white font-bold ${['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-yellow-500'][Number(chat.id) % 4]}`}>
               {chat.name[0]}
            </div>
            <div className="flex-1 min-w-0">
               <div className="flex justify-between items-baseline mb-1">
                 <h3 className="text-[#e9edef] font-medium truncate">{chat.name}</h3>
                 <span className="text-xs text-[#8696a0]">{chat.time}</span>
               </div>
               <div className="flex justify-between items-center">
                 <p className="text-[#8696a0] text-sm truncate mr-2 overflow-hidden whitespace-nowrap">{chat.lastMessage}</p>
                 {chat.unread > 0 && (
                   <span className="w-5 h-5 bg-[#00a884] rounded-full flex items-center justify-center text-[#111b21] text-xs font-bold flex-shrink-0">
                     {chat.unread}
                   </span>
                 )}
               </div>
            </div>
          </div>
        ))}
      </div>

      <NewChatModal isOpen={isNewChatOpen} onClose={() => setIsNewChatOpen(false)} />
    </div>
  );
}
