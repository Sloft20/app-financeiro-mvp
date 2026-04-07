"use client";
import React, { useState } from 'react';
import { useGoals, useCreateGoal, useBudgets, useSetBudget } from '@/hooks/usePlanner';
import { useCategories } from '@/hooks/useAccounts';
import { Target, ShieldCheck, Trophy, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PlannerPage() {
    const [tab, setTab] = useState<"goals" | "planner">("goals");
    const { data: goals = [], isLoading: loadG } = useGoals();
    const { data: budgets = [], isLoading: loadB } = useBudgets();
    const { data: categories = [] } = useCategories();
    
    // Formulários
    const [goalName, setGoalName] = useState("");
    const [goalAmount, setGoalAmount] = useState("");
    const [goalDate, setGoalDate] = useState("");
    
    const [budgetCatId, setBudgetCatId] = useState("");
    const [budgetAmount, setBudgetAmount] = useState("");

    const { mutate: addGoal, isPending: spinGoal } = useCreateGoal();
    const { mutate: setLimit, isPending: spinLim } = useSetBudget();

    const handleGoal = (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(goalAmount.replace(",", "."));
        if (!goalName || !goalDate || isNaN(amt)) return;
        
        addGoal({ name: goalName, target_amount: amt, target_date: goalDate }, {
            onSuccess: () => { setGoalName(""); setGoalAmount(""); setGoalDate(""); }
        });
    };

    const handleLimit = (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(budgetAmount.replace(",", "."));
        if (!budgetCatId || isNaN(amt)) return;

        setLimit({ 
            category_id: budgetCatId, 
            reference_month: new Date().toISOString().split("T")[0], 
            planned_amount: amt 
        }, {
            onSuccess: () => setBudgetAmount("")
        });
    };

    const fixedCategories = categories.filter(c => c.type === 'FIXED_EXPENSE');

    return (
        <div className="space-y-6 pb-6">
            
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-full">
                <button onClick={() => setTab("goals")} className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${tab === "goals" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500"}`}>Cofres de Sonhos</button>
                <button onClick={() => setTab("planner")} className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${tab === "planner" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500"}`}>Teto de Gastos Fixos</button>
            </div>

            {tab === "goals" && (
                <motion.div initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} className="space-y-6">
                    <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-lg shadow-indigo-600/30">
                        <div className="flex items-center gap-2 mb-2">
                           <Trophy size={20} className="text-amber-300" />
                           <h2 className="text-sm font-extrabold">Alvos Ativos</h2>
                        </div>
                        <p className="text-xs text-indigo-200 font-medium leading-relaxed">
                           A mágica atuarial: Todo sonho que você adicionar vai sugar imediatamente um pouquinho do seu "Diário Médio" pro resto do mês. Você paga seu sonho antes de comer a pizza!
                        </p>
                    </div>

                    <form onSubmit={handleGoal} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <input type="text" placeholder="Qual o próximo nível? (Ex: Europa)" value={goalName} onChange={e=>setGoalName(e.target.value)} required className="w-full bg-slate-50 px-4 py-3 rounded-2xl text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                        <div className="flex gap-3">
                            <input type="text" inputMode="decimal" placeholder="Valor (R$)" value={goalAmount} onChange={e=>setGoalAmount(e.target.value)} required className="flex-1 bg-slate-50 px-4 py-3 rounded-2xl text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                            <input type="date" value={goalDate} onChange={e=>setGoalDate(e.target.value)} required className="flex-1 bg-slate-50 px-4 py-3 rounded-2xl text-[11px] font-bold text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 uppercase" />
                        </div>
                        <button disabled={spinGoal} type="submit" className="w-full py-4 bg-indigo-50 text-indigo-600 font-extrabold text-sm rounded-2xl hover:bg-indigo-100 transition-colors flex justify-center">{spinGoal ? <Loader2 size={20} className="animate-spin" /> : "Criar Cofre Intocável"}</button>
                    </form>

                    <div className="space-y-4">
                        {goals.map(g => {
                            const pct = (g.current_saved / g.target_amount) * 100;
                            return (
                                <div key={g.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                                            <div className="p-2 bg-amber-50 rounded-lg text-amber-500"><Sparkles size={16}/></div>
                                            {g.name}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-indigo-600">Alvo: R$ {g.target_amount}</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                        <div className="bg-indigo-500 h-2.5 rounded-full" style={{width: `${Math.min(pct, 100)}%`}}></div>
                                    </div>
                                    <div className="mt-2 text-[10px] uppercase font-bold tracking-widest text-slate-400 flex justify-between">
                                        <span>R$ {g.current_saved} Guardado</span>
                                        <span>Meta: {g.target_date.split("-").reverse().join("/")}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </motion.div>
            )}

            {tab === "planner" && (
                <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} className="space-y-6">
                     <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl">
                        <div className="flex items-center gap-2 mb-2">
                           <ShieldCheck size={20} className="text-emerald-400" />
                           <h2 className="text-sm font-extrabold">Tetos Fixos Mensais</h2>
                        </div>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">
                           Defina exatamente quanto do seu dinheiro será sugado pelos passivos do mês (Aluguel, Luz, Cartões Base). O excedente é que vira seu bolo gamificado.
                        </p>
                    </div>

                    <form onSubmit={handleLimit} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <select value={budgetCatId} onChange={e=>setBudgetCatId(e.target.value)} required className="w-full bg-slate-50 px-4 py-4 rounded-2xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 appearance-none">
                            <option value="">Selecione Custo Fixo...</option>
                            {fixedCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <input type="text" inputMode="decimal" placeholder="Limite Máximo Estimado (R$)" value={budgetAmount} onChange={e=>setBudgetAmount(e.target.value)} required className="w-full bg-slate-50 px-4 py-4 rounded-2xl text-lg font-black placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 text-center" />
                        <button disabled={spinLim} type="submit" className="w-full py-4 bg-emerald-50 text-emerald-600 font-extrabold text-sm rounded-2xl hover:bg-emerald-100 transition-colors flex justify-center">{spinLim ? <Loader2 size={20} className="animate-spin" /> : "Travar Teto Legal"}</button>
                    </form>

                    <div className="space-y-3">
                        {budgets.map(b => (
                            <div key={b.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg"><TrendingUp size={16} className="text-slate-400"/></div>
                                    <span className="text-sm font-bold text-slate-700">{b.categories?.name}</span>
                                </div>
                                <span className="font-black text-rose-500">R$ {parseFloat(b.planned_amount.toString()).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                </motion.div>
            )}

        </div>
    );
}
