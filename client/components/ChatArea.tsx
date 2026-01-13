"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Paperclip, Mic, Smile, Send, FileText, Image as ImageIcon, Music } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const SERVER_URL = 'http://localhost:4000';

export default function ChatArea({ chat }: { chat: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const { socket } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            // Notification
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

  const sendMessage = async (content: string, type = "text", fileData: any = null) => {
    if(!content && !fileData) return;

    try {
      const payload: any = {
        content: content,
        chatId: chat.id,
        type: type
      };
      
      if(fileData) {
        payload.fileUrl = fileData.filePath;
        payload.fileName = fileData.fileName;
        payload.fileSize = fileData.fileSize;
      }

      const { data } = await api.post('/message', payload);
      setMessages([...messages, data]);
      socket?.emit('new_message', data);
      setNewMessage('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(newMessage.trim()) sendMessage(newMessage);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Determine type
      let type = 'file';
      if(file.type.startsWith('image')) type = 'image';
      else if(file.type === 'application/pdf') type = 'pdf';
      else if(file.type.startsWith('audio')) type = 'audio';
      
      sendMessage("", type, data);
    } catch (error) {
       console.error("Upload failed", error);
       alert("File upload failed");
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
                     
                     {/* Content based on type */}
                     {msg.type === 'text' && <p className="pb-4 pr-1">{msg.content}</p>}
                     
                     {msg.type === 'image' && (
                        <div className="mb-2 rounded overflow-hidden">
                           <img src={SERVER_URL + msg.fileUrl} alt="Shared" className="max-w-full h-auto" />
                        </div>
                     )}

                     {msg.type === 'pdf' && (
                        <div className="flex items-center gap-3 bg-black/20 p-3 rounded mb-4 w-64">
                           <FileText size={32} className="text-red-400" />
                           <div className="flex-1 truncate">
                              <p className="truncate text-sm">{msg.fileName}</p>
                              <p className="text-xs opacity-70">PDF</p>
                           </div>
                           <a href={SERVER_URL + msg.fileUrl} target="_blank" rel="noreferrer" className="p-2 bg-[#2a3942] rounded-full">⬇</a>
                        </div>
                     )}

                     {msg.type === 'audio' && (
                        <div className="flex items-center gap-2 mb-4">
                           <audio controls src={SERVER_URL + msg.fileUrl} className="w-64 h-8" />
                        </div>
                     )}
                     
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
      <form onSubmit={handleFormSubmit} className="min-h-[62px] bg-[#202c33] flex items-center px-4 py-2 gap-2 z-10">
         <button type="button" className="text-[#8696a0] p-2 hover:bg-[#374248] rounded-full"><Smile size={24} /></button>
         
         <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload} 
            accept="image/*,.pdf,audio/*"
        />
         <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="text-[#8696a0] p-2 hover:bg-[#374248] rounded-full"
        >
            <Paperclip size={24} />
         </button>
         
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
