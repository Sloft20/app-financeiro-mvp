"use client";
import React, { useState } from 'react';
import { useSetupAccount } from '@/hooks/useAccounts';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Coins, Landmark } from 'lucide-react';

export default function OnboardingPage() {
  const [name, setName] = useState("Conta Principal");
  const [balance, setBalance] = useState("");
  const { mutate, isPending } = useSetupAccount();
  const router = useRouter();

  const handleSetup = (e: React.FormEvent) => {
     e.preventDefault();
     const val = parseFloat(balance.replace(",", "."));
     if (isNaN(val)) return;

     mutate({ name, type: "CHECKING", balance: val }, {
        onSuccess: () => router.push('/')
     });
  };

  return (
    <div className="absolute inset-0 z-50 bg-indigo-600 flex flex-col justify-center px-6 py-12 text-white h-full w-full">
      <motion.div initial={{y: 20, opacity: 0}} animate={{y:0, opacity: 1}} className="text-center mb-10">
         <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20 shadow-xl">
             <Landmark size={36} className="text-white" />
         </div>
         <h1 className="text-3xl font-black tracking-tight mb-2">Fundação do Caixa</h1>
         <p className="text-indigo-200 font-medium text-sm">Precisamos do seu ponto de partida para a mágica financeira funcionar.</p>
      </motion.div>

      <motion.form initial={{scale: 0.95, opacity: 0}} animate={{scale: 1, opacity: 1}} transition={{delay: 0.2}} onSubmit={handleSetup} className="bg-white rounded-[2.5rem] p-6 shadow-2xl text-slate-800 space-y-6">
          
          <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 mb-2 block">Nome do Banco / Conta</label>
              <input 
                 type="text" 
                 value={name} onChange={e => setName(e.target.value)}
                 required
                 className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
          </div>

          <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 mb-2 block">Saldo Real Atual Inicial</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-5 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                  <span className="text-xl font-bold text-slate-400 mr-2">R$</span>
                  <input 
                     type="text" inputMode="decimal" placeholder="0.00"
                     value={balance} onChange={e => setBalance(e.target.value)}
                     required
                     className="w-full bg-transparent py-4 text-3xl font-black text-slate-800 focus:outline-none"
                  />
              </div>
          </div>

          <button 
             type="submit" disabled={isPending}
             className="w-full bg-indigo-600 text-white font-extrabold py-5 rounded-2xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95 transition-all mt-4 flex items-center justify-center text-base"
          >
              {isPending ? <Loader2 className="animate-spin" /> : "Inicializar Conta"}
          </button>
      </motion.form>
    </div>
  );
}
