import React from 'react';
import { ErpLogo } from './ErpLogo';
import { ErpModuleType } from './ErpSidebar';
import { Cliente, OrdemServico } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ErpWelcomeScreenProps {
  onNavigate: (module: ErpModuleType, viewExtra?: string) => void;
  clientes: Cliente[];
  ordens: OrdemServico[];
}

export const ErpWelcomeScreen: React.FC<ErpWelcomeScreenProps> = ({
  onNavigate,
  clientes,
  ordens,
}) => {
  const totalFaturamento = ordens.reduce((acc, os) => acc + (os.valorTotalGeral || 0), 0);
  const totalConcluidas = ordens.filter((o) => o.status === 'Concluído').length;

  return (
    <div className="min-h-full flex flex-col justify-between py-8 px-4 sm:px-8 select-none">
      
      {/* Top Welcome Title */}
      <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600"></span>
          <span className="font-semibold text-slate-700">Sistema Integrado de Gestão Empresarial (ERP)</span>
          <span className="text-slate-400">| MFx Tecnologia Industrial</span>
        </div>
        <div className="font-mono text-[11px]">
          Terminal Agudos/SP • Operador: <strong className="text-slate-800">ADM - MEDRADE</strong>
        </div>
      </div>

      {/* CENTRO EXATO: Logo MFx Tecnologia como Tela de Capa */}
      <div className="my-auto py-12 flex flex-col items-center justify-center text-center">
        
        {/* Logo Central Estilizado Conforme Modelo Visual */}
        <div className="p-6 sm:p-10 rounded-2xl bg-white/60 backdrop-blur-xs border border-slate-200/60 shadow-xs max-w-2xl w-full flex flex-col items-center">
          <ErpLogo size="hero" showSubtitle={true} />

          {/* Slogan & Especialidade */}
          <div className="mt-8 text-xs sm:text-sm text-slate-600 max-w-lg leading-relaxed">
            Assistência Técnica Especializada, Retrofit CNC, Venda de Máquinas e Fornecimento de Consumíveis para Corte Industrial.
          </div>
        </div>

      </div>

      {/* Cartões Rápidos de Status no Rodapé da Tela de Capa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200/80">
        
        {/* Clientes */}
        <div 
          onClick={() => onNavigate('pessoas')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition cursor-pointer flex items-center justify-between"
        >
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Clientes Ativos</div>
            <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{clientes.length}</div>
            <div className="text-[10px] text-blue-600 mt-0.5 font-medium">Consultar base →</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <i className="fa-solid fa-building text-sm"></i>
          </div>
        </div>

        {/* Ordens de Serviço */}
        <div 
          onClick={() => onNavigate('os', 'listar')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition cursor-pointer flex items-center justify-between"
        >
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Ordens de Serviço</div>
            <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{ordens.length}</div>
            <div className="text-[10px] text-emerald-600 mt-0.5 font-medium">{totalConcluidas} concluídas →</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
            <i className="fa-solid fa-wrench text-sm"></i>
          </div>
        </div>

        {/* Faturamento */}
        <div 
          onClick={() => onNavigate('relatorios')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition cursor-pointer flex items-center justify-between"
        >
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Volume Faturado</div>
            <div className="text-base font-black text-slate-900 font-mono mt-0.5">{formatCurrency(totalFaturamento)}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Laser, Plasma & Oxi</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <i className="fa-solid fa-dollar-sign text-sm"></i>
          </div>
        </div>

        {/* Suporte Técnico */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Plantão MFx</div>
            <div className="text-xs font-bold text-slate-900 mt-0.5">(14) 99845-7721</div>
            <div className="text-[10px] text-emerald-600 font-medium">WhatsApp Técnico ON</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <i className="fa-brands fa-whatsapp text-base"></i>
          </div>
        </div>

      </div>

    </div>
  );
};
