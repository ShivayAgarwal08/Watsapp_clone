import React, { useState } from 'react';
import { X, Search, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';

export default function NewChatModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if(val.length > 1) {
      setLoading(true);
      try {
        const { data } = await api.get(\`/auth/search?query=\${val}\`);
        setResults(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    } else {
      setResults([]);
    }
  };

  const accessChat = async (userId: string) => {
    try {
      await api.post('/chat', { userId });
      onClose();
      // Should ideally trigger a refresh of chats in Sidebar
    } catch (e) {
      console.error(e);
    }
  };

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
                   onChange={(e) => handleSearch(e.target.value)}
                   className="bg-transparent flex-1 text-[#d1d7db] placeholder-[#8696a0] focus:outline-none" 
                   placeholder="Search name or email"
                 />
               </div>
               
               <div className="space-y-2 min-h-[200px]">
                 {results.length > 0 ? (
                   results.map(user => (
                     <div 
                       key={user.id} 
                       onClick={() => accessChat(user.id)}
                       className="flex items-center justify-between p-3 hover:bg-[#111b21] rounded-lg cursor-pointer group transition-colors"
                     >
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                           {user.username[0].toUpperCase()}
                         </div>
                         <div>
                           <div className="text-[#e9edef] font-medium">{user.username}</div>
                           <div className="text-[#8696a0] text-sm">{user.email}</div>
                         </div>
                       </div>
                       <button className="text-[#00a884] p-2 hover:bg-[#202c33] rounded-full transition-colors">
                         <MessageSquare size={20} />
                       </button>
                     </div>
                   ))
                 ) : (
                   query && !loading && <p className="text-center text-[#8696a0] py-4">No users found</p>
                 )}
               </div>
             </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
