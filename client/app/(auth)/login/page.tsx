"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="min-h-screen bg-[#111b21] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-32 bg-[#00a884] z-0"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#202c33] p-8 rounded-lg shadow-xl w-full max-w-md z-10 border border-[#222e35]"
      >
        <div className="flex justify-center mb-6">
           <div className="w-16 h-16 bg-[#00a884] rounded-full flex items-center justify-center text-white font-bold text-2xl">
             CW
           </div>
        </div>
        
        <h2 className="text-2xl font-bold text-[#e9edef] text-center mb-2">Welcome Back</h2>
        <p className="text-[#8696a0] text-center mb-8">Sign in to continue to ChatWave</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#e9edef] text-sm font-medium mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#2a3942] border border-[#2a3942] rounded-lg px-4 py-3 text-[#e9edef] focus:outline-none focus:border-[#00a884] transition-colors placeholder-gray-500"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label className="block text-[#e9edef] text-sm font-medium mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#2a3942] border border-[#2a3942] rounded-lg px-4 py-3 text-[#e9edef] focus:outline-none focus:border-[#00a884] transition-colors placeholder-gray-500"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit"
            className="w-full bg-[#00a884] hover:bg-[#008f6f] text-[#111b21] font-bold py-3 rounded-lg transition-colors cursor-pointer"
          >
            Sign In
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-[#8696a0] text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#00a884] hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
