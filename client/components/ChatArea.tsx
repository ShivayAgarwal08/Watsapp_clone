"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Paperclip, Mic, Smile, Send, FileText, X } from 'lucide-react';
import EmojiPicker, { Theme, EmojiStyle } from 'emoji-picker-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const SERVER_URL = 'http://localhost:4000';

export default function ChatArea({ chat }: { chat: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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
    setNewMessage('');
  }, [chat]);

  useEffect(() => {
    if(!socket) return;
    
    // Message
    const handleMessageReceived = (newMessageReceived: any) => {
        if (!chat || chat.id !== newMessageReceived.chatId) return;
        setMessages((prev) => [...prev, newMessageReceived]);
    };

    // Typing
    const handleTyping = ({ chatId, username }: any) => {
        if(chat?.id !== chatId) return;
        setTypingUser(username);
        setIsTyping(true);
    };
    const handleStopTyping = (chatId: string) => {
        if(chat?.id !== chatId) return;
        setIsTyping(false);
        setTypingUser('');
    };

    // Reactions
    const handleReaction = (data: any) => {
        if(chat?.id !== data.chatId) return;
        setMessages(prev => prev.map(m => {
           if(m.id === data.messageId) {
               let newReactions = m.reactions || [];
               if(data.type === 'add') newReactions.push(data.reaction);
               else if(data.type === 'remove') newReactions = newReactions.filter((r:any) => r.id !== data.reactionId);
               else if(data.type === 'update') newReactions = newReactions.map((r:any) => r.id === data.reaction.id ? data.reaction : r);
               return { ...m, reactions: newReactions };
           }
           return m;
        }));
    };

    socket.on("message_received", handleMessageReceived);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);
    socket.on("reaction_received", handleReaction);

    return () => {
        socket.off("message_received", handleMessageReceived);
        socket.off("typing", handleTyping);
        socket.off("stop_typing", handleStopTyping);
        socket.off("reaction_received", handleReaction);
    };
  }, [socket, chat]);

  useEffect(() => {
     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleTypingInput = (e: React.ChangeEvent<HTMLInputElement>) => {
     setNewMessage(e.target.value);
     if(!socket) return;
     
     if(e.target.value.length > 0) {
        socket.emit("typing", { chatId: chat.id, username: user?.username });
     } else {
        socket.emit("stop_typing", chat.id);
     }
     
     // Debounce stop typing?
     // Simplifying: just emit stop when sent or empty
  };

  const sendMessage = async (content: string, type = "text", fileData: any = null) => {
    if(!content && !fileData) return;
    socket?.emit("stop_typing", chat.id);

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
      setShowEmojiPicker(false);
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
      
      let type = 'file';
      if(file.type.startsWith('image')) type = 'image';
      else if(file.type === 'application/pdf') type = 'pdf';
      else if(file.type.startsWith('audio')) type = 'audio';
      
      sendMessage("", type, data);
    } catch (error) {
       console.error("Upload failed", error);
    }
  };
  
  const handleEmojiClick = (emojiData: any) => {
     setNewMessage(prev => prev + emojiData.emoji);
  };

  const sendReaction = async (messageId: string, emoji: string) => {
     try {
        const { data } = await api.post('/message/reaction', { messageId, emoji });
        // Optimistic update
        setMessages(prev => prev.map(m => {
           if(m.id === messageId) {
               let newReactions = m.reactions || [];
               if(data.type === 'add') newReactions.push(data.reaction);
               else if(data.type === 'remove') newReactions = newReactions.filter((r:any) => r.id !== data.reactionId);
               else if(data.type === 'update') newReactions = newReactions.map((r:any) => r.id === data.reaction.id ? data.reaction : r);
               return { ...m, reactions: newReactions };
           }
           return m;
        }));
        
        socket?.emit('new_reaction', { ...data, chatId: chat.id });
     } catch (e) {
        console.error(e);
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
             {isTyping && <p className="text-[#00a884] text-xs font-bold animate-pulse">typing...</p>}
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
              const hasReactions = msg.reactions && msg.reactions.length > 0;

              return (
                <div key={msg.id || i} className={`group flex ${isMe ? 'justify-end' : 'justify-start'} relative`}>
                  
                  {/* Reaction Button (Hidden by default, shown on hover) */}
                  <div className={`opacity-0 group-hover:opacity-100 absolute top-2 ${isMe ? 'left-[-40px]' : 'right-[-40px]'} transition-opacity`}>
                     <button onClick={() => sendReaction(msg.id, '❤️')} className="text-xl hover:scale-125 transition-transform">❤️</button>
                  </div>

                  <div className={`max-w-[70%] md:max-w-[60%] lg:max-w-[50%] rounded-lg p-2 shadow-sm text-[#e9edef] text-sm relative ${isMe ? 'bg-[#005c4b] rounded-tr-none' : 'bg-[#202c33] rounded-tl-none'} ${hasReactions ? 'mb-4' : ''}`}>
                     
                     {/* Content based on type */}
                     {msg.type === 'text' && <p className="pb-4 pr-1">{msg.content}</p>}
                     
                     {msg.type === 'image' && (
                        <div className="mb-2 rounded overflow-hidden cursor-pointer">
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

                     {/* Reactions Display */}
                     {hasReactions && (
                        <div className="absolute -bottom-3 right-0 bg-[#202c33] border border-[#0b141a] rounded-full px-1.5 py-0.5 shadow-lg flex items-center gap-0.5">
                           {msg.reactions.slice(0, 3).map((r:any, idx: number) => <span key={idx} className="text-xs">{r.emoji}</span>)}
                           {msg.reactions.length > 3 && <span className="text-[10px] text-[#8696a0]">+{msg.reactions.length - 3}</span>}
                        </div>
                     )}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
         </div>
      </div>

      {/* Input */}
      <div className="bg-[#202c33] px-4 py-2 z-20 relative">
          {showEmojiPicker && (
             <div className="absolute bottom-20 left-4 z-30">
                <EmojiPicker 
                   theme={Theme.DARK} 
                   emojiStyle={EmojiStyle.APPLE}
                   onEmojiClick={handleEmojiClick}
                />
             </div>
          )}

          <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
             <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-2 rounded-full transition-colors ${showEmojiPicker ? 'text-[#00a884]' : 'text-[#8696a0] hover:bg-[#374248]'}`}>
                <Smile size={24} />
             </button>
             
             <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,audio/*" />
             <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[#8696a0] p-2 hover:bg-[#374248] rounded-full">
                <Paperclip size={24} />
             </button>
             
             <div className="flex-1 bg-[#2a3942] rounded-lg flex items-center px-4 py-2">
               <input 
                 value={newMessage}
                 onChange={handleTypingInput}
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
    </div>
  );
}
