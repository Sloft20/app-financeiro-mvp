"use client";
import React from 'react';
import { useBudgetStore } from '@/store/budgetStore';
import { useDailyBudget } from '@/hooks/useBudget';
import Link from 'next/link';
import SmartFAB from '@/components/ui/SmartFAB';

export default function TopBar() {
  const { status, dailyAverage, message } = useBudgetStore();
  
  // TanStack React Query interceptará os dados reais do FastAPI baseando em TTL (5 min cache)
  // e atualizará o Store do Zustand dinamicamente.
  useDailyBudget();

  const getBackgroundColor = () => {
    switch(status) {
      case "danger": return "bg-rose-600 text-white";
      case "warning": return "bg-amber-500 text-slate-900";
      case "success": return "bg-emerald-500 text-white";
      case "excellent": return "bg-indigo-600 text-white";
      case "loading":
      default: 
        return "bg-slate-800 text-slate-200 animate-pulse";
    }
  };

  return (
    <div className={`w-full px-5 md:px-10 pt-6 pb-6 transition-colors duration-700 ease-in-out ${getBackgroundColor()} sticky top-0 z-40 md:rounded-b-none shadow-md`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-0.5">
            Diário Médio
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {status === "loading" ? "R$ --" : `R$ ${dailyAverage?.toFixed(2)}`}
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-black/15 flex items-center justify-center border-2 border-white/20 shadow-inner backdrop-blur-md">
          <span className="text-sm font-bold opacity-90">AL</span>
        </div>
      </div>
      <div className="mt-4 bg-black/10 rounded-2xl px-4 py-2.5 backdrop-blur-sm border border-white/10">
        <p className="text-xs font-semibold opacity-95 tracking-wide">
          {status === "loading" ? "Conectando ao banco FastAPI..." : message}
        </p>
      </div>

      <div className="hidden md:flex mt-6 gap-3 items-center w-full max-w-fit bg-black/10 p-2 rounded-2xl backdrop-blur-md border border-white/10">
          <Link href="/" className="px-5 py-2 hover:bg-white/20 text-white font-bold text-sm rounded-xl transition">Início</Link>
          <Link href="/stats" className="px-5 py-2 hover:bg-white/20 text-white font-bold text-sm rounded-xl transition">Estatísticas</Link>
          <Link href="/goals" className="px-5 py-2 hover:bg-white/20 text-white font-bold text-sm rounded-xl transition">Cofres</Link>
          <Link href="/profile" className="px-5 py-2 hover:bg-white/20 text-white font-bold text-sm rounded-xl transition">Perfil</Link>
          <div className="ml-4 pl-4 border-l border-white/20 flex items-center">
              <SmartFAB />
          </div>
      </div>
    </div>
  );
}
