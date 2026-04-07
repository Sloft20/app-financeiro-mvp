"use client";
import React from 'react';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Power, ShieldAlert, User as UserIcon } from 'lucide-react';

export default function ProfilePage() {
    const user = useAuthStore(state => state.user);
    const router = useRouter();
    const queryClient = useQueryClient();

    const handleLogout = async () => {
        // 1. Invalidar Sessão Remota no Supabase (SecOps)
        await supabase.auth.signOut();
        
        // 2. Limpar Zustand Store (Esvaziar Token Memória)
        useAuthStore.getState().logout();
        
        // 3. Clear Nuclear de Extratos (React Query Cache Invalidation)
        queryClient.clear();
        
        // 4. Ejetar para ambiente não seguro via Next.js router
        router.replace("/login");
    };

    return (
        <div className="space-y-6 pb-6 animate-in fade-in">
             <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center mt-4">
                 <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4 shadow-inner">
                     <UserIcon size={40} />
                 </div>
                 <h2 className="text-xl font-black text-slate-800">Identidade Verificada</h2>
                 <p className="text-sm font-bold text-slate-500 mt-1">{user?.email || "usuario@terminal.oculto"}</p>
                 <div className="mt-4 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5">
                     <ShieldAlert size={12} /> Cofre RLS Ativo
                 </div>
             </div>

             <div className="bg-root rounded-[2.5rem] p-6 mt-12 bg-rose-50 border-rose-100 border">
                 <h3 className="text-xs font-extrabold text-rose-800 uppercase tracking-widest mb-4">Zona Crítica SecOps</h3>
                 
                 <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-rose-600 text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-rose-600/30 hover:bg-rose-700 active:scale-95 transition-all">
                     <Power size={20} />
                     Lacrar Cofre (Sair)
                 </button>
                 <p className="text-center text-[10px] font-bold text-rose-400 mt-4 leading-relaxed px-4">
                     Esta ação apagará toda visualização em cache no dispositivo e fará revogação completa do Token JWT de acesso.
                 </p>
             </div>
        </div>
    );
}
