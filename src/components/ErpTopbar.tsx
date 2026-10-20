import React, { useState } from 'react';
import { ErpModuleType } from './ErpSidebar';

import { Usuario } from '../types';

interface ErpTopbarProps {
  onQuickAction: (action: string) => void;
  onSelectModule: (module: ErpModuleType) => void;
  usuarioLogado?: Usuario;
  onAbrirLogin?: () => void;
}

export const ErpTopbar: React.FC<ErpTopbarProps> = ({
  onQuickAction,
  onSelectModule,
  usuarioLogado,
  onAbrirLogin,
}) => {
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);

  const quickButtons = [
    { id: 'produtos', label: 'Produtos', icon: 'fa-solid fa-box-open', color: 'hover:text-blue-600', module: 'estoque' as ErpModuleType },
    { id: 'compras', label: 'Compras', icon: 'fa-solid fa-cart-shopping', color: 'hover:text-emerald-600', module: 'compras' as ErpModuleType },
    { id: 'pdv', label: 'PDV - Vendas', icon: 'fa-solid fa-cash-register', iconColor: 'text-amber-600', color: 'hover:text-amber-700', module: 'pdv' as ErpModuleType },
    { id: 'caixa', label: 'Caixa', icon: 'fa-solid fa-vault', color: 'hover:text-slate-800', module: 'financeiro' as ErpModuleType },
    { id: 'nfe', label: 'NF-e', icon: 'fa-solid fa-receipt', color: 'hover:text-cyan-600', module: 'nfe' as ErpModuleType },
    { id: 'nfse', label: 'NFS-e', icon: 'fa-solid fa-file-invoice', color: 'hover:text-teal-600', module: 'nfse' as ErpModuleType },
    { id: 'receber', label: 'Receber', icon: 'fa-solid fa-arrow-down', iconColor: 'text-emerald-600', color: 'hover:text-emerald-700', module: 'receber' as ErpModuleType },
    { id: 'pagar', label: 'Pagar', icon: 'fa-solid fa-arrow-up', iconColor: 'text-red-600', color: 'hover:text-red-700', module: 'pagar' as ErpModuleType },
    { id: 'nova_os', label: 'Nova OS', icon: 'fa-solid fa-plus-circle', iconColor: 'text-red-600', color: 'hover:text-red-700', action: 'nova_os' },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between gap-3 shadow-2xs select-none z-20">
      
      {/* Atalhos Rápidos (Ribbon Icons) */}
      <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 scrollbar-none">
        {quickButtons.map((btn) => (
          <button
            key={btn.id}
            onClick={() => {
              if (btn.action) {
                onQuickAction(btn.action);
              } else if (btn.module) {
                onSelectModule(btn.module);
              }
            }}
            className={`flex flex-col items-center justify-center min-w-[50px] sm:min-w-[56px] h-12 px-1.5 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-700 transition ${btn.color} group`}
            title={`Acesso rápido: ${btn.label}`}
          >
            <div className={`text-sm ${btn.iconColor || 'text-slate-600 group-hover:scale-110'} transition-transform`}>
              <i className={btn.icon}></i>
            </div>
            <span className="text-[10px] font-semibold tracking-tight text-slate-600 mt-0.5 truncate max-w-full">
              {btn.label}
            </span>
          </button>
        ))}
      </div>

      {/* Lado Direito: Notificações, Operador e Botão Sair */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* Notificações */}
        <div className="relative">
          <button
            onClick={() => setNotificacoesAbertas(!notificacoesAbertas)}
            className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 relative transition"
            title="Notificações do Sistema"
          >
            <i className="fa-solid fa-bell text-sm"></i>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center shadow">
              3
            </span>
          </button>

          {/* Dropdown de Notificações */}
          {notificacoesAbertas && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 text-xs">
              <div className="font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Notificações</span>
                <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-mono font-bold">
                  3 novas
                </span>
              </div>
              <div className="space-y-2 py-2">
                <div className="p-2 bg-slate-50 rounded border border-slate-100 text-[11px]">
                  <div className="font-bold text-slate-800">Estoque de Bicos Laser</div>
                  <div className="text-slate-500 text-[10px]">Lote MFX-LP30-15 com 4 unidades restantes.</div>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100 text-[11px]">
                  <div className="font-bold text-slate-800">OS #2026-0101 Concluída</div>
                  <div className="text-slate-500 text-[10px]">Aguardando faturamento e envio de boleto.</div>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100 text-[11px]">
                  <div className="font-bold text-slate-800">Backup Realizado</div>
                  <div className="text-slate-500 text-[10px]">Base mfx_sistema sincronizada com sucesso.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Informações da Empresa / Operador */}
        <div className="hidden sm:flex items-center gap-2.5">
          <button
            onClick={() => {
              if (onAbrirLogin) {
                onAbrirLogin();
              } else {
                onSelectModule('acesso');
              }
            }}
            className="flex items-center gap-2 text-right hover:opacity-85 transition p-1 rounded-lg group"
            title="Clique para trocar de usuário ou gerenciar acessos"
          >
            <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-500/20 text-red-600 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-red-600 group-hover:text-white transition">
              {usuarioLogado ? usuarioLogado.nome.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="flex flex-col text-right text-xs leading-none">
              <span className="font-bold text-slate-800 text-[11px] truncate max-w-[130px]">
                {usuarioLogado ? usuarioLogado.nome : 'Eng. Marcos Medrade'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                {usuarioLogado ? `${usuarioLogado.login} (${usuarioLogado.perfil})` : 'ADM - MEDRADE'}
              </span>
            </div>
          </button>
        </div>

        {/* Botão de Trocar / Sair */}
        <button
          onClick={() => {
            if (onAbrirLogin) {
              onAbrirLogin();
            } else if (confirm('Deseja realmente encerrar a sessão do ERP MFx Tecnologia?')) {
              onSelectModule('abertura');
            }
          }}
          className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
          title="Encerrar sessão ou trocar operador"
        >
          <i className="fa-solid fa-right-from-bracket"></i>
          <span className="hidden sm:inline">Sair / Login</span>
        </button>

      </div>
    </header>
  );
};
