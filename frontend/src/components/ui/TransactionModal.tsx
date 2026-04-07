"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Loader2, Utensils, DollarSign, Wallet, ArrowRightLeft } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useCreateTransaction, TransactionCreatePayload } from '@/hooks/useTransaction';
import { useAccounts, useCategories } from '@/hooks/useAccounts';

type Tab = "GASTO" | "GANHO" | "TRANSFERENCIA";
type PaymentMethod = "CREDITO" | "DEBITO";
type PaymentCondition = "A_VISTA" | "PARCELADO" | "RECORRENTE";
type DateSelection = "HOJE" | "OUTRO";

export default function TransactionModal() {
  const isOpen = useUIStore((state) => state.isFabModalOpen);
  const setOpen = useUIStore((state) => state.setFabModalOpen);
  const { mutate, isPending } = useCreateTransaction();
  
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();

  const [activeTab, setActiveTab] = useState<Tab>("GASTO");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState("");
  
  // Selections
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedDestinationAccountId, setSelectedDestinationAccountId] = useState<string | null>(null); // For Transfers

  // Toggles
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CREDITO");
  const [paymentCondition, setPaymentCondition] = useState<PaymentCondition>("A_VISTA");
  const [dateSelection, setDateSelection] = useState<DateSelection>("HOJE");

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setDescription("");
      setPaymentMethod("DEBITO");
      setPaymentCondition("A_VISTA");
      setDateSelection("HOJE");
      
      if (accounts && accounts.length > 0) {
          setSelectedAccountId(accounts[0].id);
          if (accounts.length > 1) setSelectedDestinationAccountId(accounts[1].id);
      }
    }
  }, [isOpen, accounts]);

  // Bind categories smoothly to active Tab
  useEffect(() => {
    if (isOpen && categories && categories.length > 0) {
         if (activeTab === "GASTO") {
             const cat = categories.find(c => c.type === "VARIABLE_EXPENSE" || c.type === "FIXED_EXPENSE");
             if (cat) setSelectedCategoryId(cat.id);
         } else if (activeTab === "GANHO") {
             const cat = categories.find(c => c.type === "INCOME");
             if (cat) setSelectedCategoryId(cat.id);
         }
    }
  }, [activeTab, categories, isOpen]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (!val) {
        setAmount("");
        return;
    }
    const num = (parseInt(val) / 100).toFixed(2);
    setAmount(num.replace(".", ","));
  };

  const getAmountColor = () => {
    if (activeTab === "GASTO") return "text-rose-600";
    if (activeTab === "GANHO") return "text-emerald-500";
    return "text-slate-900";
  };

  const getActiveCategoryInfo = () => {
     if (!categories || !selectedCategoryId) return { name: "Selecione", icon: <Utensils size={20} />, bg: "bg-slate-300" };
     const cat = categories.find(c => c.id === selectedCategoryId);
     if (!cat) return { name: "Desconhecido", icon: <Utensils size={20}/>, bg: "bg-slate-300" };
     
     if (cat.type === "INCOME") return { name: cat.name, icon: <DollarSign size={20}/>, bg: "bg-blue-600" };
     return { name: cat.name, icon: <Utensils size={20}/>, bg: "bg-amber-500" };
  };

  const getActiveAccountInfo = (accId: string | null) => {
     if (!accounts || !accId) return { name: "Selecione a conta" };
     const acc = accounts.find(a => a.id === accId);
     return { name: acc?.name || "Conta Oculta" };
  };

  const handleSubmit = () => {
    if (!amount || amount === "0,00") return;
    if (!selectedAccountId) return;
    
    const parsedAmount = parseFloat(amount.replace(",", "."));
    let type = "DEBIT";
    let isPaid = true;

    if (activeTab === "GASTO") {
       type = paymentMethod === "CREDITO" ? "CREDIT" : "DEBIT";
       if (paymentMethod === "CREDITO") isPaid = false;
    } else if (activeTab === "TRANSFERENCIA") {
       type = "TRANSFER";
    }

    if (activeTab !== "TRANSFERENCIA" && !selectedCategoryId) return alert("Selecione uma categoria");

    const payload: TransactionCreatePayload = {
       account_id: selectedAccountId,
       category_id: activeTab === "TRANSFERENCIA" ? categories?.[0]?.id || "" : selectedCategoryId!,
       amount: parsedAmount,
       description: description || (activeTab === "TRANSFERENCIA" ? "Transferência entre contas" : "Sem descrição"),
       transaction_date: new Date().toISOString().split("T")[0],
       is_paid: isPaid,
       type: type as any
    };

    mutate(payload, {
        onSuccess: () => setOpen(false)
    });
  };

  const catInfo = getActiveCategoryInfo();
  const accInfo = getActiveAccountInfo(selectedAccountId);
  const destAccInfo = getActiveAccountInfo(selectedDestinationAccountId);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
          <motion.div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto" 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={() => setOpen(false)} 
          />

          <motion.div 
            className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl relative pointer-events-auto flex flex-col max-h-[92vh]" 
            initial={{ y: 50, opacity: 0, scale: 0.95 }} 
            animate={{ y: 0, opacity: 1, scale: 1 }} 
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="relative px-6 pt-6 pb-4 border-b border-slate-100 flex gap-6 shrink-0">
               {["GASTO", "GANHO", "TRANSFERENCIA"].map(t => (
                 <button key={t} onClick={() => setActiveTab(t as Tab)} 
                   className={`text-lg font-bold capitalize transition-colors ${activeTab === t ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
                   {t === "TRANSFERENCIA" ? "Transferência" : t.charAt(0) + t.slice(1).toLowerCase()}
                 </button>
               ))}
               <button onClick={() => setOpen(false)} className="absolute right-5 top-6 text-slate-600 hover:text-slate-900 transition-colors">
                 <X size={24} />
               </button>
            </div>

            <div className="px-6 py-6 overflow-y-auto scrollbar-hide flex-1 space-y-6">
              
              {/* Value Input */}
              <div>
                <p className="text-sm font-bold text-slate-800 mb-1">
                  Valor do {activeTab === "TRANSFERENCIA" ? "transferência" : activeTab.toLowerCase()} <span className="text-rose-500">*</span>
                </p>
                <div className="flex items-center">
                  <input 
                    type="text" 
                    inputMode="decimal"
                    placeholder="0,00" 
                    value={amount} 
                    onChange={handleAmountChange}
                    className={`w-full text-5xl font-extrabold bg-transparent outline-none placeholder-slate-200 ${getAmountColor()} focus:ring-0`}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm font-bold text-slate-800 mb-2">Descrição <span className="text-rose-500">*</span></p>
                <input 
                  type="text" 
                  placeholder={activeTab === "GANHO" ? "Digite sua descrição" : "Exemplo: tênis novo"}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-medium transition-colors shadow-sm"
                />
              </div>

              {/* Categorias (Oculto em Transferência) */}
              {activeTab !== "TRANSFERENCIA" && (
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-2">Categoria <span className="text-rose-500">*</span></p>
                  <button className="w-full bg-slate-50/50 border border-slate-100 rounded-xl p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg ${catInfo.bg} flex items-center justify-center text-white shadow-sm`}>
                           {catInfo.icon}
                        </div>
                        <span className="font-bold text-slate-800">{catInfo.name}</span>
                     </div>
                     <ChevronRight size={20} className="text-emerald-600" />
                  </button>
                </div>
              )}

              {/* Conta Selection */}
              <div>
                <p className="text-sm font-bold text-slate-800 mb-2">
                  {activeTab === "TRANSFERENCIA" ? "Conta origem *" : "Conta *"}
                </p>
                <button className="w-full bg-slate-50/50 border border-slate-100 rounded-xl p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                         <Wallet size={20} />
                      </div>
                      <span className="font-bold text-slate-800">{accInfo.name}</span>
                   </div>
                   <ChevronRight size={20} className="text-emerald-600" />
                </button>
              </div>

              {/* Destino Transferência */}
              {activeTab === "TRANSFERENCIA" && (
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-2">Conta destino *</p>
                  <button className="w-full bg-slate-50/50 border border-slate-100 rounded-xl p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center text-white shadow-sm">
                           <Wallet size={20} />
                        </div>
                        <span className="font-bold text-slate-800">{destAccInfo.name}</span>
                     </div>
                     <ChevronRight size={20} className="text-emerald-600" />
                  </button>
                </div>
              )}

              {/* Forma de Pagamento (Apenas Gasto) */}
              {activeTab === "GASTO" && (
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-2">Forma de pagamento <span className="text-rose-500">*</span></p>
                  <div className="flex gap-3">
                    <button onClick={() => setPaymentMethod("CREDITO")} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-colors ${paymentMethod === "CREDITO" ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-white text-slate-700 border border-slate-200'}`}>Cartão de Crédito</button>
                    <button onClick={() => setPaymentMethod("DEBITO")} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-colors ${paymentMethod === "DEBITO" ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-white text-slate-700 border border-slate-200'}`}>Débito</button>
                  </div>
                </div>
              )}

              {/* Condição de Pagamento (Apenas Gasto) */}
              {activeTab === "GASTO" && (
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-2">Condição de pagamento <span className="text-rose-500">*</span></p>
                  <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                    <button onClick={() => setPaymentCondition("A_VISTA")} className={`px-5 py-2.5 shrink-0 rounded-full text-sm font-bold transition-colors ${paymentCondition === "A_VISTA" ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-white text-slate-700 border border-slate-200'}`}>À vista</button>
                    <button onClick={() => setPaymentCondition("PARCELADO")} className={`px-5 py-2.5 shrink-0 rounded-full text-sm font-bold transition-colors ${paymentCondition === "PARCELADO" ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-white text-slate-700 border border-slate-200'}`}>Parcelado</button>
                    <button onClick={() => setPaymentCondition("RECORRENTE")} className={`px-5 py-2.5 shrink-0 rounded-full text-sm font-bold transition-colors ${paymentCondition === "RECORRENTE" ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-white text-slate-700 border border-slate-200'}`}>Recorrente</button>
                  </div>
                </div>
              )}

              {/* Pick Data */}
              {(activeTab === "GANHO" || activeTab === "TRANSFERENCIA") && (
                <div>
                   <p className="text-sm font-bold text-slate-800 mb-2">Data <span className="text-rose-500">*</span></p>
                   <div className="flex gap-3">
                    <button onClick={() => setDateSelection("HOJE")} className={`px-8 py-2.5 rounded-full text-sm font-bold transition-colors ${dateSelection === "HOJE" ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-white text-slate-700 border border-slate-200'}`}>Hoje</button>
                    <button onClick={() => setDateSelection("OUTRO")} className={`px-8 py-2.5 rounded-full text-sm font-bold transition-colors ${dateSelection === "OUTRO" ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-white text-slate-700 border border-slate-200'}`}>Outro</button>
                  </div>
                </div>
              )}

              <div className="pt-2">
                 <motion.button 
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmit}
                    disabled={isPending}
                    className={`w-full py-4 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/30 transition-all bg-[#74CBA8] hover:bg-[#60b08f] ${isPending ? 'opacity-70 pointer-events-none' : ''}`}
                 >
                    {isPending ? <Loader2 className="animate-spin" /> : 
                     activeTab === "GASTO" ? "Registrar gasto" : 
                     activeTab === "GANHO" ? "Registrar ganho" : "Registrar transferência"}
                 </motion.button>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
