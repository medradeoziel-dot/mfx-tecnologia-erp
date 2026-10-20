import React from 'react';
import { MFX_COMPANY } from '../data/company';
import { Flame, Users, FilePlus2, Printer, Code2, LayoutDashboard, FileText } from 'lucide-react';

export type TabType = 'dashboard' | 'clientes' | 'nova_os' | 'listar_os' | 'imprimir_os' | 'codigo_php';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  osCount: number;
  clientesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  osCount,
  clientesCount,
}) => {
  return (
    <header className="bg-slate-950 text-white border-b-4 border-amber-500 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          
          {/* Logo & Company Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-red-600 via-orange-600 to-amber-500 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center relative overflow-hidden">
                <Flame className="w-6 h-6 text-amber-500 animate-pulse" />
                <span className="absolute -bottom-1 -right-1 text-[9px] font-black tracking-tighter text-red-500">MFx</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white font-mono">
                  MF<span className="text-red-500">x</span>
                </span>
                <span className="text-sm font-semibold text-slate-200 tracking-wide uppercase">
                  Tecnologia Industrial
                </span>
                <span className="hidden sm:inline-block text-[10px] bg-red-950/80 text-red-400 border border-red-800/60 px-2 py-0.5 rounded font-mono font-medium">
                  CNPJ: {MFX_COMPANY.cnpj}
                </span>
              </div>
              <div className="text-[11px] text-amber-400/90 font-medium tracking-wider flex items-center gap-2">
                <span>LASER FIBRA</span>
                <span className="text-slate-600">•</span>
                <span>PLASMA</span>
                <span className="text-slate-600">•</span>
                <span>OXI-CORTE</span>
                <span className="hidden lg:inline text-slate-400 font-normal">| Agudos - SP</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={() => setActiveTab('nova_os')}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded shadow transition"
              title="Abrir Nova Ordem de Serviço"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>Nova OS</span>
            </button>
            <button
              onClick={() => setActiveTab('codigo_php')}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 text-xs font-semibold px-3 py-2 rounded transition"
              title="Ver e Baixar Arquivos PHP / MySQL"
            >
              <Code2 className="w-4 h-4" />
              <span className="hidden sm:inline">Código</span> PHP & SQL
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex overflow-x-auto gap-1 border-t border-slate-800/80 pt-1.5 pb-1 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-2 font-medium rounded-t border-b-2 transition whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-amber-500 text-amber-400 bg-slate-900/90 font-bold'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Painel Geral</span>
          </button>

          <button
            onClick={() => setActiveTab('clientes')}
            className={`flex items-center gap-1.5 px-3 py-2 font-medium rounded-t border-b-2 transition whitespace-nowrap ${
              activeTab === 'clientes'
                ? 'border-amber-500 text-amber-400 bg-slate-900/90 font-bold'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Clientes</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full font-mono">
              {clientesCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('nova_os')}
            className={`flex items-center gap-1.5 px-3 py-2 font-medium rounded-t border-b-2 transition whitespace-nowrap ${
              activeTab === 'nova_os'
                ? 'border-amber-500 text-amber-400 bg-slate-900/90 font-bold'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <FilePlus2 className="w-4 h-4" />
            <span>Nova OS</span>
          </button>

          <button
            onClick={() => setActiveTab('listar_os')}
            className={`flex items-center gap-1.5 px-3 py-2 font-medium rounded-t border-b-2 transition whitespace-nowrap ${
              activeTab === 'listar_os'
                ? 'border-amber-500 text-amber-400 bg-slate-900/90 font-bold'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Ordens de Serviço</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full font-mono">
              {osCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('imprimir_os')}
            className={`flex items-center gap-1.5 px-3 py-2 font-medium rounded-t border-b-2 transition whitespace-nowrap ${
              activeTab === 'imprimir_os'
                ? 'border-amber-500 text-amber-400 bg-slate-900/90 font-bold'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <Printer className="w-4 h-4 text-red-400" />
            <span>Imprimir A4</span>
          </button>

          <button
            onClick={() => setActiveTab('codigo_php')}
            className={`flex items-center gap-1.5 px-3 py-2 font-medium rounded-t border-b-2 transition whitespace-nowrap ml-auto ${
              activeTab === 'codigo_php'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900/90 font-bold'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>Arquivos PHP & MySQL</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
