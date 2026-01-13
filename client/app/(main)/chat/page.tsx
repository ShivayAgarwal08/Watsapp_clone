"use client";
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatArea from '@/components/ChatArea';
import { useAuth } from '@/context/AuthContext';

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-[#111b21] overflow-hidden">
      <div className="w-[400px] border-r border-[#222e35] flex flex-col bg-[#111b21]">
        <Sidebar 
          onSelectChat={setSelectedChat} 
          selectedChatId={selectedChat?.id} 
        />
      </div>
      <div className="flex-1 flex flex-col relative bg-[#0b141a]">
        {selectedChat ? (
           <ChatArea chat={selectedChat} />
        ) : (
           <div className="flex-1 flex items-center justify-center flex-col text-[#e9edef] border-b-[6px] border-[#00a884]">
             <div className="text-center">
                <h1 className="text-4xl font-light mb-4 text-[#e9edef]">ChatWave Web</h1>
                <p className="text-[#8696a0] text-sm mt-2">Send and receive messages without keeping your phone online.</p>
                <div className="mt-8 text-xs text-[#8696a0] flex items-center justify-center gap-2">
                   <span className="opacity-60">🔒 End-to-end encrypted</span>
                </div>
             </div>
           </div>
        )}
      </div>
    </div>
  );
}
