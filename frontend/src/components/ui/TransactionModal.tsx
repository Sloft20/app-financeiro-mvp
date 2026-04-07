"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Receipt, CalendarDays, AlertTriangle, Loader2, Wallet } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useCreateTransaction, TransactionCreatePayload } from '@/hooks/useTransaction';
import { useAccounts, useCategories } from '@/hooks/useAccounts';

type FlowType = "DEBIT" | "CREDIT" | "INCOME" | "TRANSFER";
type CatType = "INCOME" | "FIXED_EXPENSE" | "VARIABLE_EXPENSE" | "TRANSFER";

export default function TransactionModal() {
  const isOpen = useUIStore((state) => state.isFabModalOpen);
  const setOpen = useUIStore((state) => state.setFabModalOpen);
  const { mutate, isPending } = useCreateTransaction();
  
  // A engrenagem dinâmica! Puxamos as contas e as categorias reais do usuário
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();

  const [flow, setFlow] = useState<FlowType>("DEBIT");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState("");
  const [categoryType, setCategoryType] = useState<CatType>("VARIABLE_EXPENSE");
  const [isPaid, setIsPaid] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isInstallment, setIsInstallment] = useState(false);

  useEffect(() => {
    if (isOpen) { 
      setAmount("");
      setDescription("");
      setShowAdvanced(false);
      setIsInstallment(false);
      setIsPaid(flow !== "CREDIT");
    }
  }, [isOpen, flow]);

  const handleSubmit = () => {
    if (!amount || isNaN(parseFloat(amount.replace(",", ".")))) return;
    
    // Obter conta dinamica (assume a index 0 como checking principal se houver)
    const activeAccountId = accounts?.[0]?.id;
    if (!activeAccountId) return alert("Erro crítico: Nenhuma conta detectada.");

    // Obter a categoria que satisfaça a logica (match pelo tipo)
    const targetType = flow === "INCOME" ? "INCOME" : categoryType;
    const catMatch = categories?.find(c => c.type === targetType);
    if (!catMatch) return alert("Erro crítico: Categoria não encontrada em banco.");

    const payload: TransactionCreatePayload = {
       account_id: activeAccountId,
       category_id: catMatch.id,
       amount: parseFloat(amount.replace(",", ".")),
       description: description || "Sem descrição",
       transaction_date: new Date().toISOString().split("T")[0],
       is_paid: isPaid,
       type: flow
    };

    mutate(payload);
  };

  const isCreditFlow = flow === "CREDIT";
  const showRiskWarning = isCreditFlow && categoryType === "VARIABLE_EXPENSE" && isInstallment;

  const getThemeColor = () => {
    if (flow === "INCOME") return "bg-emerald-500 shadow-emerald-500/30";
    if (flow === "CREDIT") return "bg-amber-500 shadow-amber-500/30";
    if (flow === "TRANSFER") return "bg-slate-700 shadow-slate-700/30";
    return "bg-rose-500 shadow-rose-500/30";
  };

  const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  const sheetVariants = {
    hidden: { y: "100%", opacity: 0, scale: 0.96 },
    visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring" as const, damping: 25, stiffness: 200 } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none px-4 pb-4">
          <motion.div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto" variants={backdropVariants} initial="hidden" animate="visible" exit="hidden" onClick={() => setOpen(false)} />

          <motion.div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl relative pointer-events-auto flex flex-col max-h-[90vh]" variants={sheetVariants} initial="hidden" animate="visible" exit="hidden" drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.2} onDragEnd={(e, { offset, velocity }) => { if (offset.y > 100 || velocity.y > 400) setOpen(false); }}>
            <div className="w-full flex justify-center py-4 shrink-0"><div className="w-12 h-1.5 bg-slate-200 rounded-full" /></div>

            <div className="px-6 relative overflow-y-auto scrollbar-hide pb-8">
              
              <div className="flex justify-between items-center mb-4 px-2">
                 <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    <Wallet size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{accounts?.[0]?.name || "Conta Oculta"}</span>
                 </div>
              </div>

              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6">
                 <button onClick={() => { setFlow("DEBIT"); setCategoryType("VARIABLE_EXPENSE"); }} className={`px-4 py-2.5 rounded-2xl whitespace-nowrap text-sm font-bold transition-all ${flow === "DEBIT" ? "bg-rose-50 text-rose-600 ring-2 ring-rose-200" : "bg-slate-50 text-slate-500"}`}>Pix/Débito</button>
                 <button onClick={() => { setFlow("CREDIT"); setCategoryType("VARIABLE_EXPENSE"); }} className={`px-4 py-2.5 rounded-2xl whitespace-nowrap text-sm font-bold transition-all ${flow === "CREDIT" ? "bg-amber-50 text-amber-600 ring-2 ring-amber-200" : "bg-slate-50 text-slate-500"}`}>Cartão de Crédito</button>
                 <button onClick={() => { setFlow("INCOME"); setCategoryType("INCOME"); setIsPaid(true); }} className={`px-4 py-2.5 rounded-2xl whitespace-nowrap text-sm font-bold transition-all ${flow === "INCOME" ? "bg-emerald-50 text-emerald-600 ring-2 ring-emerald-200" : "bg-slate-50 text-slate-500"}`}>Receita Base</button>
              </div>

              <div className="mb-8 flex flex-col items-center select-none">
                 <div className="flex items-center justify-center gap-1">
                    <span className="text-3xl font-bold text-slate-300">R$</span>
                    <input type="text" inputMode="decimal" className="text-[3.5rem] h-16 border-none outline-none focus:ring-0 text-center font-black text-slate-800 placeholder-slate-200 w-[200px]" placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="bg-slate-50 rounded-3xl p-3 border border-slate-100 flex flex-col gap-2">
                    <input type="text" placeholder="Qual a descrição? (Ex: Almoço)" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-bold" value={description} onChange={(e) => setDescription(e.target.value)} />
                 </div>

                 {!isCreditFlow ? (
                    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-3xl shadow-sm">
                       <div><p className="font-bold text-sm text-slate-800">Já Abateu no Caixa?</p></div>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={isPaid} onChange={() => setIsPaid(!isPaid)} />
                          <div className="w-12 h-7 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500"></div>
                       </label>
                    </div>
                 ) : (
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-3xl flex items-center gap-3">
                       <AlertTriangle size={20} className="text-amber-500 shrink-0" />
                       <p className="text-[11px] text-amber-700 font-bold leading-tight">O Cartão não altera seu caixa livre hoje.</p>
                    </div>
                 )}

                 <AnimatePresence>
                    {showRiskWarning && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 p-4 rounded-[2rem] flex gap-3 items-center shadow-sm">
                           <AlertTriangle size={24} className="text-amber-500 shrink-0" />
                           <p className="text-[11px] font-extrabold text-amber-900 leading-tight pr-2">⚠️ Parcelar consumo livre corrói o Diário Médio futuro!</p>
                        </motion.div>
                    )}
                 </AnimatePresence>

                 <motion.button 
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmit}
                    disabled={isPending}
                    className={`w-full py-5 rounded-[2rem] flex items-center justify-center text-white font-extrabold text-lg shadow-lg transition-all ${getThemeColor()} ${isPending ? 'opacity-70 pointer-events-none' : ''}`}
                 >
                    {isPending ? <Loader2 className="animate-spin" /> : "Registrar Lançamento"}
                 </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
