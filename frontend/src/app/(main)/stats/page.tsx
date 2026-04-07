"use client";
import React from 'react';
import { useMonthlyReport } from '@/hooks/useReports';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Loader2, TrendingDown, TrendingUp, Filter } from 'lucide-react';

export default function StatsPage() {
    const { data: report, isLoading } = useMonthlyReport();

    if (isLoading) return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" /></div>;
    if (!report) return null;

    const net = report.total_income - report.total_expense;

    return (
        <div className="space-y-6 pb-6 animate-in fade-in">
            <div className="bg-slate-900 rounded-[2.5rem] p-6 shadow-xl text-white">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Balanço do Mês (Competência)</p>
                <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-3xl font-black">R$ {net.toFixed(2)}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${net >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>Líquido</span>
                </div>
                
                <div className="flex justify-between items-center bg-slate-800 p-4 rounded-3xl gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-slate-400 mb-1"><TrendingUp size={14} className="text-emerald-400"/><span className="text-[10px] uppercase font-bold tracking-wider">Entradas</span></div>
                        <p className="font-extrabold text-sm">R$ {report.total_income.toFixed(2)}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-700"></div>
                    <div className="flex-1 text-right">
                        <div className="flex items-center gap-1.5 text-slate-400 mb-1 justify-end"><TrendingDown size={14} className="text-rose-400"/><span className="text-[10px] uppercase font-bold tracking-wider">Saídas</span></div>
                        <p className="font-extrabold text-sm">R$ {report.total_expense.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-extrabold text-slate-800">Mapa de Fuga (Gastos)</h3>
                    <Filter size={16} className="text-slate-400" />
                </div>
                
                {report.categories_distribution.length === 0 ? (
                    <div className="text-center p-8 text-slate-400 font-bold text-xs">Sem dados suficientes para mapeamento.</div>
                ) : (
                    <>
                        <div className="h-64 w-full relative mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={report.categories_distribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="amount" stroke="none">
                                        {report.categories_distribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(val: number) => `R$ ${val.toFixed(2)}`} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-black text-slate-800">R$ {report.total_expense.toFixed(0)}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Saídas</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {report.categories_distribution.map(cat => (
                                <div key={cat.name} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: cat.color}}></div>
                                        <span className="text-xs font-bold text-slate-600">{cat.name}</span>
                                    </div>
                                    <span className="text-sm font-extrabold text-slate-800">R$ {cat.amount.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
