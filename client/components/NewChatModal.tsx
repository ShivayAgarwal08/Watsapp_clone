import React, { useState } from 'react';
import { X, Search, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewChatModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');

  // Mock search results
  const results = query ? [
    { id: '10', username: 'john_doe', email: 'john@example.com' },
    { id: '11', username: 'sarah_smith', email: 'sarah@example.com' },
    { id: '12', username: 'mike_ross', email: 'mike@example.com' },
  ] : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#222e35] w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-[#2a3942]"
          >
             <div className="bg-[#202c33] p-4 flex items-center justify-between border-b border-[#2a3942]">
               <h2 className="text-[#e9edef] text-lg font-medium">New Chat</h2>
               <button onClick={onClose} className="text-[#aebac1] hover:text-white"><X size={24} /></button>
             </div>
             
             <div className="p-4">
               <div className="bg-[#2a3942] rounded-lg flex items-center px-4 py-2 mb-4">
                 <Search size={20} className="text-[#8696a0] mr-2" />
                 <input 
                   autoFocus
                   value={query}
                   onChange={(e) => setQuery(e.target.value)}
                   className="bg-transparent flex-1 text-[#d1d7db] placeholder-[#8696a0] focus:outline-none" 
                   placeholder="Search name or email"
                 />
               </div>
               
               <div className="space-y-2 min-h-[200px]">
                 {results.length > 0 ? (
                   results.map(user => (
                     <div key={user.id} className="flex items-center justify-between p-3 hover:bg-[#111b21] rounded-lg cursor-pointer group transition-colors">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                           {user.username[0].toUpperCase()}
                         </div>
                         <div>
                           <div className="text-[#e9edef] font-medium">{user.username}</div>
                           <div className="text-[#8696a0] text-sm">{user.email}</div>
                         </div>
                       </div>
                       <button className="text-[#00a884] p-2 hover:bg-[#202c33] rounded-full transition-colors" title="Send Friend Request">
                         <UserPlus size={20} />
                       </button>
                     </div>
                   ))
                 ) : (
                   query && <p className="text-center text-[#8696a0] py-4">No users found</p>
                 )}
                 {!query && (
                    <div className="flex flex-col items-center justify-center h-[200px] text-[#8696a0] text-sm gap-2">
                      <Search size={48} className="opacity-20 mb-2" />
                      <p>Search for people to add them to your friends list.</p>
                    </div>
                 )}
               </div>
             </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
