"use client";
import React, { useState } from 'react';

// Placeholders for now
const Sidebar = ({ onSelectChat }: { onSelectChat: (id: string) => void }) => (
  <div className="h-full flex flex-col text-white p-4">
    <div className="mb-4 font-bold text-xl">Chats</div>
    <div 
      className="p-3 bg-[#202c33] rounded cursor-pointer hover:bg-[#2a3942]"
      onClick={() => onSelectChat('1')}
    >
      User 1
    </div>
  </div>
);

const ChatArea = ({ chat }: { chat: string }) => (
  <div className="h-full flex flex-col text-white">
    <div className="h-16 bg-[#202c33] flex items-center px-4 border-b border-[#222e35]">
      Chat Header
    </div>
    <div className="flex-1 bg-[url('/chat-bg-dark.png')] bg-repeat opacity-90 p-4">
      {/* Messages */}
      <div className="flex justify-end mb-2">
        <div className="bg-[#005c4b] p-2 rounded-lg max-w-xs">
          Hello!
          <div className="text-[10px] text-right opacity-70">12:00 PM <span className="text-blue-400">✓✓</span></div>
        </div>
      </div>
    </div>
    <div className="h-16 bg-[#202c33] flex items-center px-4 gap-2">
       <input className="flex-1 bg-[#2a3942] rounded-lg p-2 text-white outline-none" placeholder="Type a message" />
    </div>
  </div>
);

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  return (
    <div className="flex h-screen bg-[#111b21] overflow-hidden">
      <div className="w-[400px] border-r border-[#222e35] flex flex-col bg-[#111b21]">
        <Sidebar onSelectChat={setSelectedChat} />
      </div>
      <div className="flex-1 flex flex-col relative bg-[#0b141a]">
        {selectedChat ? (
           <ChatArea chat={selectedChat} />
        ) : (
           <div className="flex-1 flex items-center justify-center flex-col text-[#e9edef] border-b-[6px] border-[#00a884]">
             <div className="text-center">
                <h1 className="text-4xl font-light mb-4 text-[#e9edef]">ChatWave Web</h1>
                <p className="text-[#8696a0] text-sm mt-2">Send and receive messages without keeping your phone online.</p>
                <div className="mt-8 textxs text-[#8696a0] flex items-center justify-center gap-2">
                   <span className="opacity-60">🔒 End-to-end encrypted</span>
                </div>
             </div>
           </div>
        )}
      </div>
    </div>
  );
}
