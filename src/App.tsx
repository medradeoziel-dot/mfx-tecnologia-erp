/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Cliente, OrdemServico, StatusOS } from './types';
import { CLIENTES_INICIAIS, ORDENS_SERVICO_INICIAIS } from './data/initialData';
import { ErpSidebar, ErpModuleType } from './components/ErpSidebar';
import { ErpTopbar } from './components/ErpTopbar';
import { ErpStatusBar } from './components/ErpStatusBar';
import { ErpWelcomeScreen } from './components/ErpWelcomeScreen';
import { ErpModuleWorkspace } from './components/ErpModuleWorkspace';
import { ClientesView } from './components/ClientesView';
import { NovaOsView } from './components/NovaOsView';
import { ListarOsView } from './components/ListarOsView';
import { ImprimirOsView } from './components/ImprimirOsView';
import { DashboardView } from './components/DashboardView';
import { PhpSourceExportView } from './components/PhpSourceExportView';

export default function App() {
  // Estado de Clientes com persistência em localStorage
  const [clientes, setClientes] = useState<Cliente[]>(() => {
    try {
      const salvo = localStorage.getItem('mfx_clientes');
      if (salvo) return JSON.parse(salvo);
    } catch (e) {
      console.warn('Erro ao carregar clientes do localStorage:', e);
    }
    return CLIENTES_INICIAIS;
  });

  // Estado de Ordens de Serviço com persistência em localStorage
  const [ordens, setOrdens] = useState<OrdemServico[]>(() => {
    try {
      const salvo = localStorage.getItem('mfx_ordens');
      if (salvo) return JSON.parse(salvo);
    } catch (e) {
      console.warn('Erro ao carregar ordens do localStorage:', e);
    }
    return ORDENS_SERVICO_INICIAIS;
  });

  // Navegação do ERP: Módulo ativo e sub-visão
  const [currentModule, setCurrentModule] = useState<ErpModuleType>('abertura');
  const [osSubView, setOsSubView] = useState<'listar' | 'nova' | 'imprimir'>('listar');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Seleções para edição e impressão
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<string>('');
  const [osSelecionadaId, setOsSelecionadaId] = useState<string>(
    ordens.length > 0 ? ordens[0].id : ''
  );

  // Sincronizar com localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mfx_clientes', JSON.stringify(clientes));
    } catch (e) {
      console.warn('Erro ao salvar clientes:', e);
    }
  }, [clientes]);

  useEffect(() => {
    try {
      localStorage.setItem('mfx_ordens', JSON.stringify(ordens));
    } catch (e) {
      console.warn('Erro ao salvar ordens:', e);
    }
  }, [ordens]);

  // Ações de Clientes
  const handleAddCliente = (novoCliente: Cliente) => {
    setClientes((prev) => [novoCliente, ...prev]);
  };

  const handleDeleteCliente = (id: string) => {
    setClientes((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCriarOsParaCliente = (clienteId: string) => {
    setClienteSelecionadoId(clienteId);
    setCurrentModule('os');
    setOsSubView('nova');
  };

  // Ações de Ordens de Serviço
  const handleSalvarOS = (novaOS: OrdemServico, abrirImpressao = true) => {
    setOrdens((prev) => [novaOS, ...prev]);
    setOsSelecionadaId(novaOS.id);
    setCurrentModule('os');
    if (abrirImpressao) {
      setOsSubView('imprimir');
    } else {
      setOsSubView('listar');
    }
  };

  const handleDeleteOs = (id: string) => {
    setOrdens((prev) => prev.filter((o) => o.id !== id));
  };

  const handleChangeStatus = (osId: string, novoStatus: StatusOS) => {
    setOrdens((prev) =>
      prev.map((o) => (o.id === osId ? { ...o, status: novoStatus } : o))
    );
  };

  const handleImprimirOs = (osId: string) => {
    setOsSelecionadaId(osId);
    setCurrentModule('os');
    setOsSubView('imprimir');
  };

  // Navegação a partir de atalhos e tela de abertura
  const handleNavigateFromWelcome = (module: ErpModuleType, viewExtra?: string) => {
    setCurrentModule(module);
    if (module === 'os') {
      if (viewExtra === 'nova') {
        setOsSubView('nova');
      } else if (viewExtra === 'imprimir') {
        setOsSubView('imprimir');
      } else {
        setOsSubView('listar');
      }
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === 'nova_os') {
      setCurrentModule('os');
      setOsSubView('nova');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#eef2f6] text-slate-800 antialiased font-sans">
      
      {/* 1. Barra Lateral Esquerda (Sidebar com menu retrátil e perfil ADM - MEDRADE) */}
      <ErpSidebar
        currentModule={currentModule}
        onSelectModule={(mod) => {
          setCurrentModule(mod);
          if (mod === 'os' && osSubView === 'imprimir') {
            setOsSubView('listar');
          }
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
        clientesCount={clientes.length}
        osCount={ordens.length}
      />

      {/* Estrutura Principal Direita: Topbar + Workspace + StatusBar */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* 2. Barra Superior (Navbar / Ribbon Toolbar de Atalhos Rápidos) */}
        <ErpTopbar
          onQuickAction={handleQuickAction}
          onSelectModule={(mod) => {
            setCurrentModule(mod);
            if (mod === 'os') setOsSubView('listar');
          }}
        />

        {/* 3. Área Central (Content Workspace / Tela de Abertura) */}
        <main className="flex-1 overflow-y-auto bg-[#eef2f6] p-4 sm:p-6">
          
          {/* Sub-navegador quando dentro do módulo OS */}
          {currentModule === 'os' && (
            <div className="no-print max-w-7xl mx-auto mb-4 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => setCurrentModule('abertura')}
                  className="px-2.5 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition font-medium flex items-center gap-1"
                >
                  <i className="fa-solid fa-house"></i>
                  <span>Início</span>
                </button>
                <span className="text-slate-300">/</span>
                <span className="font-bold text-slate-800">Ordens de Serviço e Manutenção</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOsSubView('listar')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    osSubView === 'listar'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <i className="fa-solid fa-list-check"></i>
                  <span>Listar OS</span>
                </button>

                <button
                  onClick={() => {
                    setClienteSelecionadoId('');
                    setOsSubView('nova');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    osSubView === 'nova'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  <i className="fa-solid fa-plus-circle"></i>
                  <span>Nova OS (nova_os.php)</span>
                </button>

                <button
                  onClick={() => setOsSubView('imprimir')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    osSubView === 'imprimir'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <i className="fa-solid fa-print"></i>
                  <span>Relatório A4 (imprimir_os.php)</span>
                </button>
              </div>
            </div>
          )}

          {/* Módulos do Sistema */}
          <div className="max-w-7xl mx-auto">
            {currentModule === 'abertura' && (
              <ErpWelcomeScreen
                onNavigate={handleNavigateFromWelcome}
                clientes={clientes}
                ordens={ordens}
              />
            )}

            {currentModule === 'pessoas' && (
              <ClientesView
                clientes={clientes}
                onAddCliente={handleAddCliente}
                onDeleteCliente={handleDeleteCliente}
                onCriarOsParaCliente={handleCriarOsParaCliente}
              />
            )}

            {currentModule === 'os' && osSubView === 'nova' && (
              <NovaOsView
                clientes={clientes}
                clienteSelecionadoId={clienteSelecionadoId}
                onSalvarOS={handleSalvarOS}
                onCancelar={() => setOsSubView('listar')}
              />
            )}

            {currentModule === 'os' && osSubView === 'listar' && (
              <ListarOsView
                ordens={ordens}
                onNovaOsClick={() => {
                  setClienteSelecionadoId('');
                  setOsSubView('nova');
                }}
                onImprimirClick={handleImprimirOs}
                onDeleteOs={handleDeleteOs}
                onChangeStatus={handleChangeStatus}
              />
            )}

            {currentModule === 'os' && osSubView === 'imprimir' && (
              <ImprimirOsView
                ordens={ordens}
                ordemSelecionadaId={osSelecionadaId}
                onVoltarParaLista={() => setOsSubView('listar')}
              />
            )}

            {currentModule === 'relatorios' && (
              <DashboardView
                clientes={clientes}
                ordens={ordens}
                setActiveTab={(tab) => {
                  if (tab === 'nova_os') {
                    setCurrentModule('os');
                    setOsSubView('nova');
                  } else if (tab === 'clientes') {
                    setCurrentModule('pessoas');
                  } else if (tab === 'imprimir_os') {
                    setCurrentModule('os');
                    setOsSubView('imprimir');
                  } else if (tab === 'codigo_php') {
                    setCurrentModule('codigo_php');
                  } else if (tab === 'listar_os') {
                    setCurrentModule('os');
                    setOsSubView('listar');
                  }
                }}
                onImprimirOs={handleImprimirOs}
              />
            )}

            {currentModule === 'codigo_php' && <PhpSourceExportView />}

            {(currentModule === 'estoque' ||
              currentModule === 'fiscal' ||
              currentModule === 'compras' ||
              currentModule === 'vendas' ||
              currentModule === 'orcamento' ||
              currentModule === 'financeiro' ||
              currentModule === 'acesso' ||
              currentModule === 'configuracoes' ||
              currentModule === 'ajuda') && (
              <ErpModuleWorkspace
                module={currentModule}
                onNavigate={(mod) => setCurrentModule(mod)}
                onAbrirNovaOs={() => {
                  setCurrentModule('os');
                  setOsSubView('nova');
                }}
              />
            )}
          </div>

        </main>

        {/* 4. Rodapé Inferior (Status Bar com versão, live time, IP, licença e Internet ON) */}
        <ErpStatusBar />

      </div>

    </div>
  );
}
