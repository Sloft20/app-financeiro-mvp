"use client";
import React from 'react';
import { Plus } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { motion } from 'framer-motion';

export default function SmartFAB() {
  const toggleFabModal = useUIStore((state) => state.toggleFabModal);

  return (
    <div className="absolute left-1/2 -top-6 -translate-x-1/2 z-50">
      <motion.button
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.05 }}
        onClick={toggleFabModal}
        className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(15,23,42,0.4)] border-[5px] border-white text-white hover:bg-slate-800 transition-colors"
      >
        <Plus size={32} strokeWidth={2.5} />
      </motion.button>
    </div>
  );
}
