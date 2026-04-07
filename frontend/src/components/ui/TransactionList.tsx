"use client";

import React, { useMemo } from 'react';
import { useTransactionFeed, useDeleteTransaction, FeedTransaction } from '@/hooks/useTransactionList';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, SmartphoneNfc, CreditCard, ChevronDown, Repeat, Zap } from 'lucide-react';

// Regra de Planilha do Breno: Agrupar por data (DD de MM).
const groupTransactionsByDate = (transactions: FeedTransaction[]) => {
  const groups: Record<string, FeedTransaction[]> = {};
  
  transactions.forEach(t => {
      const rawDate = new Date(t.transaction_date + 'T00:00:00'); // Trata UTC para não pular 1 dia
      // Mock básico para 'Hoje'
      const today = new Date();
      const isToday = rawDate.toDateString() === today.toDateString();
      const isYesterday = new Date(today.setDate(today.getDate() - 1)).toDateString() === rawDate.toDateString();
      
      let label = rawDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
      if (isToday) label = `Hoje, ${label}`;
      else if (isYesterday) label = `Ontem, ${label}`;

      if (!groups[label]) groups[label] = [];
      groups[label].push(t);
  });

  return groups;
};

export default function TransactionList() {
    const { data: transactions = [], isLoading } = useTransactionFeed();
    const { mutate: deleteTx, isPending } = useDeleteTransaction();

    const groupedData = useMemo(() => groupTransactionsByDate(transactions), [transactions]);

    if (isLoading) {
        return <div className="p-6 text-center text-slate-400 font-bold animate-pulse text-sm">Escaneando transações...</div>;
    }

    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center opacity-60">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4"><Zap className="text-slate-400" /></div>
                <h3 className="font-extrabold text-slate-600 mb-2">Base em Branco</h3>
                <p className="text-xs font-semibold text-slate-500">Seu feed de competência está livre. Clique no Smart FAB abaixo para lançar histórico.</p>
            </div>
        );
    }

    // O Ícone depende do tipo de pagamento
    const getIcon = (type: string, isPaid: boolean) => {
        if (!isPaid || type === 'CREDIT') return <CreditCard size={18} className="text-amber-500" />;
        if (type === 'INCOME') return <ChevronDown size={18} className="text-emerald-500 rotate-180" />;
        return <SmartphoneNfc size={18} className="text-rose-500" />; 
    };

    return (
        <div className="space-y-8 animate-in fade-in pb-10">
            {Object.keys(groupedData).map((dateLabel) => (
                <div key={dateLabel}>
                    <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest pl-2 mb-3">{dateLabel}</h3>
                    
                    <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100 flex flex-col gap-1 overflow-hidden">
                        <AnimatePresence>
                            {groupedData[dateLabel].map((tx) => {
                                // Regra Visual "Fantasma" para Dívidas/Competência Não Paga
                                const isGhost = !tx.is_paid || tx.type === "CREDIT";
                                
                                return (
                                    <motion.div 
                                        key={tx.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -100, height: 0, margin: 0, padding: 0 }}
                                        className={`group flex items-center justify-between p-4 rounded-2xl bg-white hover:bg-slate-50 transition-colors relative overflow-hidden  ${isGhost ? 'opacity-60' : ''}`}
                                    >
                                        <div className="flex items-center gap-4 z-10">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isGhost ? 'bg-amber-50 border border-amber-100/50' : 'bg-slate-100'}`}>
                                                {getIcon(tx.type, tx.is_paid)}
                                            </div>
                                            <div>
                                                <p className={`font-extrabold text-sm ${isGhost ? 'text-slate-500' : 'text-slate-800'}`}>{tx.description}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isGhost ? "Cartão/Futuro" : "Contabilizado"}</span>
                                                    {!tx.is_paid && <Repeat size={10} className="text-amber-500" />}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 z-10 bg-white group-hover:bg-slate-50 pl-2">
                                            <p className={`font-black text-sm text-right ${tx.type === 'INCOME' ? 'text-emerald-500' : isGhost ? 'text-slate-500' : 'text-rose-600'}`}>
                                                {tx.type === 'INCOME' ? '+' : '-'} R$ {tx.amount.toFixed(2)}
                                            </p>
                                        </div>

                                        {/* Swipe To Delete Button Emulado: Hover/Group Base */}
                                        <div className="absolute right-0 inset-y-0 w-16 bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-full group-hover:translate-x-0 transition-all duration-300">
                                             <button onClick={() => deleteTx(tx.id)} disabled={isPending} className="w-full h-full flex items-center justify-center">
                                                <Trash2 size={20} className="text-white" />
                                             </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            ))}
        </div>
    );
}
