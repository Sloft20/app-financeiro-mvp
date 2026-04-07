"use client";
import React from 'react';
import { Plus } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { motion } from 'framer-motion';

export default function SmartFAB({ className = "" }: { className?: string }) {
  const toggleFabModal = useUIStore((state) => state.toggleFabModal);

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      whileHover={{ scale: 1.05 }}
      onClick={toggleFabModal}
      className={`w-14 h-14 md:w-12 md:h-12 bg-slate-900 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(15,23,42,0.4)] border-[4px] border-white text-white hover:bg-slate-800 transition-colors ${className}`}
    >
      <Plus size={28} strokeWidth={2.5} />
    </motion.button>
  );
}
