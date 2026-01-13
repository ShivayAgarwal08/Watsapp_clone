"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Paperclip, Mic, Smile, Send } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function ChatArea({ chat }: { chat: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const { socket } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if(!chat) return;
    try {
      const { data } = await api.get(\`/message/\${chat.id}\`);
      setMessages(data);
      socket?.emit('join_chat', chat.id);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [chat]);

  useEffect(() => {
    if(!socket) return;
    const handleMessageReceived = (newMessageReceived: any) => {
        if (!chat || chat.id !== newMessageReceived.chatId) {
            // Notification logic could go here
        } else {
            setMessages((prev) => [...prev, newMessageReceived]);
        }
    };
    socket.on("message_received", handleMessageReceived);
    return () => {
        socket.off("message_received", handleMessageReceived);
    };
  }, [socket, chat]);

  useEffect(() => {
     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if(!newMessage.trim()) return;

    try {
      const { data } = await api.post('/message', {
        content: newMessage,
        chatId: chat.id
      });
      // Emit to socket immediately for optimism, or just wait for API?
      // Our API doesn't emit 'message_received' to sender, so we append manually
      setMessages([...messages, data]);
      socket?.emit('new_message', data);
      setNewMessage('');
    } catch (error) {
      console.error(error);
    }
  };

  const getChatName = () => {
    if (chat.isGroup) return chat.name;
    const other = chat.participants.find((p: any) => p.id !== user?.id);
    return other?.username || "User";
  };

  return (
    <div className="h-full flex flex-col bg-[#0b141a]">
      {/* Header */}
      <div className="h-16 bg-[#202c33] flex items-center justify-between px-4 py-2 border-b border-[#222e35] z-10">
        <div className="flex items-center cursor-pointer">
           <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold mr-3">
             {getChatName()[0].toUpperCase()}
           </div>
           <div>
             <h3 className="text-[#e9edef] font-medium">{getChatName()}</h3>
           </div>
        </div>
        <div className="flex items-center gap-4 text-[#aebac1]">
           <button className="p-2 hover:bg-[#374248] rounded-full"><Search size={20} /></button>
           <button className="p-2 hover:bg-[#374248] rounded-full"><MoreVertical size={20} /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat opacity-95">
         <div className="flex flex-col gap-2">
            {messages.map((msg, i) => {
              const isMe = msg.senderId === user?.id;
              return (
                <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] md:max-w-[60%] lg:max-w-[50%] rounded-lg p-2 shadow-sm text-[#e9edef] text-sm relative ${isMe ? 'bg-[#005c4b] rounded-tr-none' : 'bg-[#202c33] rounded-tl-none'}`}>
                     <p className="pb-4 pr-1">{msg.content}</p> {/* Pad for timestamp */}
                     <span className={`absolute bottom-1 right-2 text-[10px] text-[#8696a0] flex items-center gap-1`}>
                       {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       {isMe && (
                         <span className="text-[#53bdeb]">✓✓</span>
                       )}
                     </span>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
         </div>
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="min-h-[62px] bg-[#202c33] flex items-center px-4 py-2 gap-2 z-10">
         <button type="button" className="text-[#8696a0] p-2 hover:bg-[#374248] rounded-full"><Smile size={24} /></button>
         <button type="button" className="text-[#8696a0] p-2 hover:bg-[#374248] rounded-full"><Paperclip size={24} /></button>
         
         <div className="flex-1 bg-[#2a3942] rounded-lg flex items-center px-4 py-2">
           <input 
             value={newMessage}
             onChange={(e) => setNewMessage(e.target.value)}
             className="bg-transparent flex-1 text-[#d1d7db] placeholder-[#8696a0] focus:outline-none text-sm"
             placeholder="Type a message"
           />
         </div>
         
         {newMessage ? (
           <button type="submit" className="text-[#8696a0] p-2 hover:bg-[#374248] rounded-full"><Send size={24} /></button>
         ) : (
           <button type="button" className="text-[#8696a0] p-2 hover:bg-[#374248] rounded-full"><Mic size={24} /></button>
         )}
      </form>
    </div>
  );
}
