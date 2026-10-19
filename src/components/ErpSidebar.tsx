import React from 'react';
import { ErpLogo } from './ErpLogo';
import { TabType } from './Header';

export type ErpModuleType = 
  | 'abertura'
  | 'pessoas' 
  | 'estoque' 
  | 'compras' 
  | 'os' 
  | 'financeiro' 
  | 'fiscal' 
  | 'relatorios' 
  | 'acesso' 
  | 'configuracoes' 
  | 'ajuda'
  | 'codigo_php';

interface ErpSidebarProps {
  currentModule: ErpModuleType;
  onSelectModule: (module: ErpModuleType) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  clientesCount: number;
  osCount: number;
}

export const ErpSidebar: React.FC<ErpSidebarProps> = ({
  currentModule,
  onSelectModule,
  collapsed,
  onToggleCollapsed,
  clientesCount,
  osCount,
}) => {
  const menuItems = [
    {
      id: 'abertura' as ErpModuleType,
      label: 'Início / Capa',
      iconClass: 'fa-solid fa-house',
      badge: null,
      color: 'text-amber-400',
    },
    {
      id: 'pessoas' as ErpModuleType,
      label: 'Pessoas',
      sublabel: 'Clientes / Fornec.',
      iconClass: 'fa-solid fa-users',
      badge: clientesCount,
      color: 'text-blue-400',
    },
    {
      id: 'os' as ErpModuleType,
      label: 'OS & Manutenção',
      sublabel: 'Laser, Plasma, Oxi',
      iconClass: 'fa-solid fa-wrench',
      badge: osCount,
      color: 'text-red-500',
    },
    {
      id: 'estoque' as ErpModuleType,
      label: 'Estoque',
      sublabel: 'Consumíveis & Peças',
      iconClass: 'fa-solid fa-boxes-stacked',
      badge: '18',
      color: 'text-amber-500',
    },
    {
      id: 'compras' as ErpModuleType,
      label: 'Compras',
      sublabel: 'Matéria-prima & Insumos',
      iconClass: 'fa-solid fa-cart-flatbed',
      badge: null,
      color: 'text-emerald-400',
    },
    {
      id: 'financeiro' as ErpModuleType,
      label: 'Financeiro',
      sublabel: 'Contas a Pagar/Rec.',
      iconClass: 'fa-solid fa-hand-holding-dollar',
      badge: null,
      color: 'text-emerald-500',
    },
    {
      id: 'fiscal' as ErpModuleType,
      label: 'Fiscal',
      sublabel: 'NF-e / NFS-e',
      iconClass: 'fa-solid fa-file-contract',
      badge: null,
      color: 'text-indigo-400',
    },
    {
      id: 'relatorios' as ErpModuleType,
      label: 'Relatórios',
      sublabel: 'Desempenho & OS A4',
      iconClass: 'fa-solid fa-chart-pie',
      badge: null,
      color: 'text-purple-400',
    },
    {
      id: 'acesso' as ErpModuleType,
      label: 'Acesso',
      sublabel: 'Usuários & Permissões',
      iconClass: 'fa-solid fa-user-shield',
      badge: null,
      color: 'text-slate-400',
    },
    {
      id: 'configuracoes' as ErpModuleType,
      label: 'Configurações',
      sublabel: 'Empresa & Parâmetros',
      iconClass: 'fa-solid fa-gear',
      badge: null,
      color: 'text-slate-400',
    },
    {
      id: 'ajuda' as ErpModuleType,
      label: 'Ajuda',
      sublabel: 'Manual & Suporte MFx',
      iconClass: 'fa-solid fa-circle-question',
      badge: null,
      color: 'text-sky-400',
    },
    {
      id: 'codigo_php' as ErpModuleType,
      label: 'Código PHP/SQL',
      sublabel: 'Arquivos do Sistema',
      iconClass: 'fa-solid fa-code',
      badge: 'PHP',
      color: 'text-emerald-400',
    },
  ];

  return (
    <aside
      className={`bg-[#212529] text-white flex flex-col border-r border-slate-800 transition-all duration-200 select-none shrink-0 z-30 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header of Sidebar */}
      <div className="h-16 px-4 bg-[#1a1e24] border-b border-slate-800 flex items-center justify-between gap-2">
        {!collapsed ? (
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onSelectModule('abertura')}>
            <ErpLogo size="sm" />
          </div>
        ) : (
          <div className="font-mono font-black text-lg text-white mx-auto cursor-pointer" onClick={() => onSelectModule('abertura')}>
            M<span className="text-red-500">F</span>
          </div>
        )}

        <button
          onClick={onToggleCollapsed}
          className="text-slate-400 hover:text-white p-1.5 rounded hover:bg-slate-800 transition"
          title={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
        >
          <i className={`fa-solid ${collapsed ? 'fa-angles-right' : 'fa-angles-left'} text-xs`}></i>
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-700">
        <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 ${collapsed ? 'text-center' : ''}`}>
          {!collapsed ? 'Módulos do Sistema' : '•••'}
        </div>

        {menuItems.map((item) => {
          const isActive = currentModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs transition text-left group ${
                isActive
                  ? 'bg-red-600 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
              title={collapsed ? `${item.label} (${item.sublabel || ''})` : undefined}
            >
              <div className={`w-5 text-center ${isActive ? 'text-white' : item.color} text-sm`}>
                <i className={item.iconClass}></i>
              </div>

              {!collapsed && (
                <div className="flex-1 truncate">
                  <div className="truncate leading-tight">{item.label}</div>
                  {item.sublabel && (
                    <div className={`text-[10px] truncate ${isActive ? 'text-red-100' : 'text-slate-500'}`}>
                      {item.sublabel}
                    </div>
                  )}
                </div>
              )}

              {!collapsed && item.badge !== null && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white text-red-600' : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Logged User Card (ADM - MEDRADE) */}
      <div className="p-3 bg-[#181c22] border-t border-slate-800 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white font-black text-xs shadow-inner font-mono">
              OM
            </div>
            <span
              className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#181c22] rounded-full"
              title="Operador Ativo"
            ></span>
          </div>

          {!collapsed && (
            <div className="flex-1 truncate">
              <div className="font-bold text-white truncate text-xs flex items-center gap-1.5">
                <span>ADM - MEDRADE</span>
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                <i className="fa-solid fa-shield-halved text-[9px]"></i>
                <span className="truncate">Administrador Master</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
