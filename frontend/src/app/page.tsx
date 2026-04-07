import React from 'react';

export default function HomePage() {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      
      {/* Aviso de Setup Concluído */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-1">UI Engine Ativa!</h2>
        <p className="text-sm text-slate-500 leading-relaxed font-medium">
          O App-Financeiro está perfeitamente instanciado. O controle de estado emocional (Zustand) domina nosso header dinamicamente.
        </p>
      </div>

      {/* Lista Mockada Simulando Lógica */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-base font-extrabold text-slate-800 mb-5">Transações Recentes</h2>
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <span className="text-lg">🛒</span>
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-700">Mercado Teste {i}</p>
                  <p className="text-[11px] font-semibold text-slate-400">Cartão de Crédito</p>
                </div>
              </div>
              <p className="font-bold text-sm text-slate-800">- R$ 1{i}5,00</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
