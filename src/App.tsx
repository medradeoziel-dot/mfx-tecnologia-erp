/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Cliente, OrdemServico, StatusOS, Compra, ItemEstoque, Venda, MovimentoCaixa } from './types';
import { CLIENTES_INICIAIS, ORDENS_SERVICO_INICIAIS, ESTOQUE_INICIAL, COMPRAS_INICIAIS, VENDAS_INICIAIS, MOVIMENTOS_CAIXA_INICIAIS } from './data/initialData';
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
import { EstoqueView } from './components/EstoqueView';
import { ComprasView } from './components/ComprasView';
import { PdvView } from './components/PdvView';
import { FinanceiroView } from './components/FinanceiroView';

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

  // Estado de Estoque de Produtos e Serviços com persistência
  const [estoqueItens, setEstoqueItens] = useState<ItemEstoque[]>(() => {
    try {
      const salvo = localStorage.getItem('mfx_estoque_itens');
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Erro ao carregar estoque do localStorage:', e);
    }
    return ESTOQUE_INICIAL;
  });

  // Estado de Compras / Notas Fiscais de Entrada com persistência
  const [compras, setCompras] = useState<Compra[]>(() => {
    try {
      const salvo = localStorage.getItem('mfx_compras');
      if (salvo) return JSON.parse(salvo);
    } catch (e) {
      console.warn('Erro ao carregar compras do localStorage:', e);
    }
    return COMPRAS_INICIAIS;
  });

  // Estado de Vendas do PDV com persistência
  const [vendas, setVendas] = useState<Venda[]>(() => {
    try {
      const salvo = localStorage.getItem('mfx_vendas');
      if (salvo) return JSON.parse(salvo);
    } catch (e) {
      console.warn('Erro ao carregar vendas do localStorage:', e);
    }
    return VENDAS_INICIAIS;
  });

  // Estado de Movimentações de Caixa / Financeiro com persistência
  const [movimentosCaixa, setMovimentosCaixa] = useState<MovimentoCaixa[]>(() => {
    try {
      const salvo = localStorage.getItem('mfx_caixa_movimentos');
      if (salvo) return JSON.parse(salvo);
    } catch (e) {
      console.warn('Erro ao carregar movimentos de caixa do localStorage:', e);
    }
    return MOVIMENTOS_CAIXA_INICIAIS;
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

  useEffect(() => {
    try {
      localStorage.setItem('mfx_estoque_itens', JSON.stringify(estoqueItens));
    } catch (e) {
      console.warn('Erro ao salvar estoque:', e);
    }
  }, [estoqueItens]);

  useEffect(() => {
    try {
      localStorage.setItem('mfx_compras', JSON.stringify(compras));
    } catch (e) {
      console.warn('Erro ao salvar compras:', e);
    }
  }, [compras]);

  useEffect(() => {
    try {
      localStorage.setItem('mfx_vendas', JSON.stringify(vendas));
    } catch (e) {
      console.warn('Erro ao salvar vendas:', e);
    }
  }, [vendas]);

  useEffect(() => {
    try {
      localStorage.setItem('mfx_caixa_movimentos', JSON.stringify(movimentosCaixa));
    } catch (e) {
      console.warn('Erro ao salvar movimentos de caixa:', e);
    }
  }, [movimentosCaixa]);

  // Ações de Compras e Atualização Automática de Estoque
  const handleSalvarCompra = (novaCompra: Compra) => {
    setCompras((prev) => [novaCompra, ...prev]);
  };

  const handleAtualizarEstoquePorCompra = (
    atualizacoes: { codigo: string; quantidade: number; novoCusto?: number }[]
  ) => {
    setEstoqueItens((prev) =>
      prev.map((item) => {
        const at = atualizacoes.find((a) => a.codigo === item.codigo);
        if (at) {
          return {
            ...item,
            estoqueAtual: (item.estoqueAtual || 0) + at.quantidade,
            dataAtualizacao: new Date().toISOString(),
          };
        }
        return item;
      })
    );
  };

  // Ações do PDV: Finalizar Venda com baixa física no estoque e lançamento no caixa
  const handleFinalizarVenda = (
    novaVenda: Venda,
    atualizacoesEstoque: { codigo: string; quantidade: number }[]
  ) => {
    // 1. Registra a venda
    setVendas((prev) => [novaVenda, ...prev]);

    // 2. Dá baixa física automática no saldo de cada produto do estoque
    setEstoqueItens((prev) =>
      prev.map((item) => {
        const at = atualizacoesEstoque.find((a) => a.codigo === item.codigo);
        if (at) {
          const novoSaldo = Math.max(0, (item.estoqueAtual || 0) - at.quantidade);
          return {
            ...item,
            estoqueAtual: novoSaldo,
            dataAtualizacao: new Date().toISOString(),
          };
        }
        return item;
      })
    );

    // 3. Lança a entrada de receita no Financeiro / Caixa
    const novoMovimento: MovimentoCaixa = {
      id: `mov-${Date.now()}`,
      tipo: 'ENTRADA',
      origem: 'PDV',
      referenciaId: novaVenda.id,
      descricao: `Venda Balcão ${novaVenda.codigoVenda} - ${novaVenda.clienteNome}`,
      formaPagamento: novaVenda.formaPagamento,
      valor: novaVenda.valorTotal,
      dataHora: `${novaVenda.dataVenda} ${novaVenda.horaVenda}`,
      operador: novaVenda.operador || 'ADM - MEDRADE',
    };
    setMovimentosCaixa((prev) => [novoMovimento, ...prev]);
  };

  const handleAdicionarMovimentoCaixa = (novoMovimento: MovimentoCaixa) => {
    setMovimentosCaixa((prev) => [novoMovimento, ...prev]);
  };

  // Ações de Clientes
  const handleAddCliente = (novoCliente: Cliente) => {
    setClientes((prev) => [novoCliente, ...prev]);
  };

  const handleUpdateCliente = (clienteAtualizado: Cliente) => {
    setClientes((prev) =>
      prev.map((c) => (c.id === clienteAtualizado.id ? clienteAtualizado : c))
    );
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
  const handleSalvarOS = (novaOS: OrdemServico, abrirImpressao = true, manterNaTela = false) => {
    setOrdens((prev) => [novaOS, ...prev]);
    setOsSelecionadaId(novaOS.id);
    if (!manterNaTela) {
      setCurrentModule('os');
      if (abrirImpressao) {
        setOsSubView('imprimir');
      } else {
        setOsSubView('listar');
      }
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
                onUpdateCliente={handleUpdateCliente}
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

            {currentModule === 'estoque' && (
              <EstoqueView
                itens={estoqueItens}
                onUpdateItens={setEstoqueItens}
                onAbrirNovaOs={() => {
                  setCurrentModule('os');
                  setOsSubView('nova');
                }}
                onAbrirNovaOsComItem={() => {
                  setCurrentModule('os');
                  setOsSubView('nova');
                }}
              />
            )}

            {currentModule === 'compras' && (
              <ComprasView
                produtosEstoque={estoqueItens}
                onAtualizarEstoque={handleAtualizarEstoquePorCompra}
                compras={compras}
                onSalvarCompra={handleSalvarCompra}
                onIrParaEstoque={() => setCurrentModule('estoque')}
              />
            )}

            {currentModule === 'pdv' && (
              <PdvView
                produtosEstoque={estoqueItens}
                clientes={clientes}
                vendas={vendas}
                onFinalizarVenda={handleFinalizarVenda}
                onIrParaEstoque={() => setCurrentModule('estoque')}
                onIrParaFinanceiro={() => setCurrentModule('financeiro')}
              />
            )}

            {currentModule === 'financeiro' && (
              <FinanceiroView
                movimentos={movimentosCaixa}
                onAdicionarMovimento={handleAdicionarMovimentoCaixa}
                onIrParaPdv={() => setCurrentModule('pdv')}
              />
            )}

            {(currentModule === 'fiscal' ||
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
