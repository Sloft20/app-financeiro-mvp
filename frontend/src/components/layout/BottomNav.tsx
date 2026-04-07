"use client";
import React from 'react';
import Link from 'next/link';
import { Home, BarChart2, Target, User } from 'lucide-react';
import SmartFAB from '@/components/ui/SmartFAB';

export default function BottomNav() {
  return (
    <div className="md:hidden absolute bottom-0 w-full bg-white border-t border-slate-100 shadow-[0_-15px_40px_rgba(0,0,0,0.06)] rounded-t-[2.5rem] pb-safe z-40">
      <div className="flex justify-between items-center h-20 px-6 relative max-w-md mx-auto pb-2">
        
        <Link href="/" className="flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors w-12 group">
          <Home size={24} strokeWidth={2.5} className="mb-0.5 group-hover:-translate-y-1 transition-transform" />
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        
        <Link href="/stats" className="flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors mr-6 w-12 group">
          <BarChart2 size={24} strokeWidth={2.5} className="mb-0.5 group-hover:-translate-y-1 transition-transform" />
          <span className="text-[10px] font-bold">Relatório</span>
        </Link>
        
        {/* Smart FAB Injected here overlapping dynamically */}
        <div className="absolute left-1/2 -top-6 -translate-x-1/2 z-50">
           <SmartFAB />
        </div>

        <Link href="/goals" className="flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors ml-6 w-12 group">
          <Target size={24} strokeWidth={2.5} className="mb-0.5 group-hover:-translate-y-1 transition-transform" />
          <span className="text-[10px] font-bold">Cofres</span>
        </Link>
        
        <Link href="/profile" className="flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors w-12 group">
          <User size={24} strokeWidth={2.5} className="mb-0.5 group-hover:-translate-y-1 transition-transform" />
          <span className="text-[10px] font-bold">Perfil</span>
        </Link>
        
      </div>
    </div>
  );
}
