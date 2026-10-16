import React, { useState, useEffect } from 'react';
import { MFX_COMPANY } from '../data/company';

export const ErpStatusBar: React.FC = () => {
  const [dataHora, setDataHora] = useState<string>('');

  useEffect(() => {
    const atualizarDataHora = () => {
      const agora = new Date();
      const formatado = agora.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }) + ' ' + agora.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setDataHora(formatado);
    };

    atualizarDataHora();
    const interval = setInterval(atualizarDataHora, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="no-print h-7 bg-[#1c2128] text-slate-300 border-t border-slate-700/80 px-3 sm:px-4 text-[11px] font-mono select-none flex items-center justify-between z-20 shrink-0">
      
      {/* Lado Esquerdo: Versão, Licenciamento e Usuário */}
      <div className="flex items-center gap-3 sm:gap-4 truncate">
        
        {/* Versão do Sistema */}
        <div className="flex items-center gap-1.5 font-bold text-slate-200">
          <i className="fa-solid fa-code-branch text-[10px] text-amber-500"></i>
          <span>Versão 1.0.0</span>
          <span className="hidden md:inline text-[9px] text-slate-500 font-normal">(Build 2026.10)</span>
        </div>

        <span className="text-slate-600 hidden sm:inline">•</span>

        {/* Licenciamento Oficial */}
        <div className="hidden sm:flex items-center gap-1.5 text-slate-300 truncate">
          <i className="fa-solid fa-certificate text-[10px] text-emerald-400"></i>
          <span className="truncate">
            Licenciado para: <strong className="text-white font-sans">{MFX_COMPANY.nomeFantasia}</strong> (CNPJ: {MFX_COMPANY.cnpj})
          </span>
        </div>

        <span className="text-slate-600 hidden lg:inline">•</span>

        {/* Usuário Logado */}
        <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
          <i className="fa-solid fa-user-tie text-[10px] text-blue-400"></i>
          <span>Operador: <strong className="text-slate-200">ADM - MEDRADE</strong></span>
        </div>
      </div>

      {/* Lado Direito: Terminal IP, Data/Hora e Status de Conexão */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0 font-medium">
        
        {/* Endereço IP da Máquina / Terminal */}
        <div className="hidden md:flex items-center gap-1.5 text-slate-400">
          <i className="fa-solid fa-network-wired text-[10px] text-slate-400"></i>
          <span>IP: <strong className="text-slate-300">192.168.1.105</strong></span>
        </div>

        <span className="text-slate-600 hidden md:inline">•</span>

        {/* Data e Hora Atual */}
        <div className="flex items-center gap-1.5 text-slate-300">
          <i className="fa-regular fa-clock text-[10px] text-amber-400"></i>
          <span className="tabular-nums font-semibold">{dataHora}</span>
        </div>

        <span className="text-slate-600">•</span>

        {/* Status de Conexão: ● Internet ON */}
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/60">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
          <span className="tracking-tight">Internet ON</span>
        </div>

      </div>

    </footer>
  );
};
