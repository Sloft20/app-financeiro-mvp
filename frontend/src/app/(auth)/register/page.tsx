"use client";
import React, { useState } from 'react';
import { supabase } from '@/services/supabase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");

    const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
            // Em dev, auto_confirm é geralmente true no supabase admin, não exige email verification.
            data: { full_name: "Novo Usuário" }
        }
    });
    
    if (error) {
      setError("Falha. " + error.message);
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  return (
      <div className="min-h-full flex flex-col justify-center px-6 py-12 bg-slate-900 absolute inset-0 z-50">
        <motion.div initial={{y: 30, opacity: 0}} animate={{y:0, opacity: 1}} transition={{duration: 0.6}} className="mb-12 text-center">
            <h1 className="text-4xl font-black tracking-tight text-white mb-2">Onboarding</h1>
            <p className="text-slate-500 font-bold text-xs tracking-widest uppercase">Protocolo de Criação</p>
        </motion.div>
        
        <motion.form initial={{scale: 0.95, opacity: 0}} animate={{scale: 1, opacity: 1}} transition={{delay: 0.2, duration: 0.4}} onSubmit={handleRegister} className="space-y-4">
            {error && <motion.div initial={{scale: 0.9}} animate={{scale: 1}} className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl text-[11px] font-bold text-center">{error}</motion.div>}
            <div>
              <input type="email" placeholder="E-mail principal" className="w-full bg-slate-800 border border-slate-700 px-5 py-4 rounded-2xl font-bold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <input type="password" placeholder="Definir Senha Mestra" className="w-full bg-slate-800 border border-slate-700 px-5 py-4 rounded-2xl font-bold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95 transition-all mt-4 flex items-center justify-center text-sm">
                {loading ? <Loader2 className="animate-spin" /> : "Gerar Acesso Seguro"}
            </button>
        </motion.form>

        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 0.5}} className="mt-8 text-center">
            <p className="text-slate-500 text-xs font-bold">Protocolo Ativado? <a href="/login" className="text-indigo-400 hover:text-white transition-colors">Voltar para Login</a></p>
        </motion.div>
      </div>
  );
}
