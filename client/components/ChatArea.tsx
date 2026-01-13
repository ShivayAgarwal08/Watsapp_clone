import React, { useState } from 'react';
import { Search, MoreVertical, Paperclip, Mic, Smile, Send } from 'lucide-react';

// Placeholder messages
const exampleMessages = [
  { id: '1', senderId: '1', content: 'Hey! Welcome to ChatWave.', time: '10:00 AM', status: 'read' },
  { id: '2', senderId: 'me', content: 'Thanks! The UI looks amazing.', time: '10:05 AM', status: 'read' },
  { id: '3', senderId: '1', content: 'I know right? Dark mode is premium.', time: '10:06 AM', status: 'read' },
  { id: '4', senderId: 'me', content: 'Absolutely.', time: '10:10 AM', status: 'delivered' },
];

export default function ChatArea({ chat }: { chat: string }) {
  const [message, setMessage] = useState('');

  return (
    <div className="h-full flex flex-col bg-[#0b141a]">
      {/* Header */}
      <div className="h-16 bg-[#202c33] flex items-center justify-between px-4 py-2 border-b border-[#222e35] z-10">
        <div className="flex items-center cursor-pointer">
           <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
             A
           </div>
           <div>
             <h3 className="text-[#e9edef] font-medium">Alice</h3>
             <p className="text-[#8696a0] text-xs">online</p>
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
            {exampleMessages.map(msg => {
              const isMe = msg.senderId === 'me';
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] md:max-w-[60%] lg:max-w-[50%] rounded-lg p-2 shadow-sm text-[#e9edef] text-sm relative ${isMe ? 'bg-[#005c4b] rounded-tr-none' : 'bg-[#202c33] rounded-tl-none'}`}>
                     <p className="pb-4 pr-1">{msg.content}</p> {/* Pad for timestamp */}
                     <span className={`absolute bottom-1 right-2 text-[10px] text-[#8696a0] flex items-center gap-1`}>
                       {msg.time}
                       {isMe && (
                         <span className={['read'].includes(msg.status) ? 'text-[#53bdeb]' : 'text-[#8696a0]'}>
                           {/* Double Tick SVG */}
                           <svg viewBox="0 0 16 15" width="16" height="15" className="fill-current w-4 h-4"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg>
                         </span>
                       )}
                     </span>
                  </div>
                </div>
              )
            })}
         </div>
      </div>

      {/* Input */}
      <div className="min-h-[62px] bg-[#202c33] flex items-center px-4 py-2 gap-2 z-10">
         <button className="text-[#8696a0] p-2 hover:bg-[#374248] rounded-full"><Smile size={24} /></button>
         <button className="text-[#8696a0] p-2 hover:bg-[#374248] rounded-full"><Paperclip size={24} /></button>
         
         <div className="flex-1 bg-[#2a3942] rounded-lg flex items-center px-4 py-2">
           <input 
             value={message}
             onChange={(e) => setMessage(e.target.value)}
             className="bg-transparent flex-1 text-[#d1d7db] placeholder-[#8696a0] focus:outline-none text-sm"
             placeholder="Type a message"
           />
         </div>
         
         {message ? (
           <button className="text-[#8696a0] p-2 hover:bg-[#374248] rounded-full"><Send size={24} /></button>
         ) : (
           <button className="text-[#8696a0] p-2 hover:bg-[#374248] rounded-full"><Mic size={24} /></button>
         )}
      </div>
    </div>
  );
}
