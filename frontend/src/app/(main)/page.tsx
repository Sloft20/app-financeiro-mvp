"use client";
import React, { useEffect } from 'react';
import TransactionList from '@/components/ui/TransactionList';
import { useAccounts } from '@/hooks/useAccounts';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { data: accounts, isLoading } = useAccounts();
  const router = useRouter();

  // A Rota "Sequestro": Impede visualização vazia
  useEffect(() => {
     if (!isLoading && accounts && accounts.length === 0) {
        router.replace("/onboarding");
     }
  }, [accounts, isLoading, router]);

  if (isLoading || (accounts && accounts.length === 0)) {
     return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-3xl p-5 shadow-sm shadow-indigo-600/20 text-white flex items-center justify-between">
         <div>
            <h2 className="text-sm font-extrabold mb-0.5">{accounts?.[0]?.name || "Conta Principal"}</h2>
            <p className="text-[11px] font-medium opacity-90">Terminal gamificado ativo.</p>
         </div>
      </div>

      <div>
         <TransactionList />
      </div>
    </div>
  );
}
