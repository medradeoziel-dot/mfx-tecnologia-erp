/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Cliente, OrdemServico, StatusOS, Compra, ItemEstoque, Venda, MovimentoCaixa, Usuario, ContaReceber, ContaPagar, FormaPagamento, NotaFiscalNfe, NotaFiscalNfse } from './types';
import { CLIENTES_INICIAIS, ORDENS_SERVICO_INICIAIS, ESTOQUE_INICIAL, COMPRAS_INICIAIS, VENDAS_INICIAIS, MOVIMENTOS_CAIXA_INICIAIS, USUARIOS_INICIAIS, CONTAS_RECEBER_INICIAIS, CONTAS_PAGAR_INICIAIS, NOTAS_NFE_INICIAIS, NOTAS_NFSE_INICIAIS } from './data/initialData';
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
import { ReceberView } from './components/ReceberView';
import { PagarView } from './components/PagarView';
import { NfeView } from './components/NfeView';
import { NfseView } from './components/NfseView';
import { AcessoView } from './components/AcessoView';
import { LoginView } from './components/LoginView';
import { ConfiguracoesView } from './components/ConfiguracoesView';
import { AjudaView } from './components/AjudaView';

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
      const resetFeito = localStorage.getItem('mfx_estoque_limpo_modelo_v2');
      if (!resetFeito) {
        localStorage.setItem('mfx_estoque_limpo_modelo_v2', 'true');
        localStorage.setItem('mfx_estoque_itens', JSON.stringify(ESTOQUE_INICIAL));
        return ESTOQUE_INICIAL;
      }
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
      const resetFeito = localStorage.getItem('mfx_compras_limpo_v1');
      if (!resetFeito) {
        localStorage.setItem('mfx_compras_limpo_v1', 'true');
        localStorage.setItem('mfx_compras', JSON.stringify([]));
        return [];
      }
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

  // Estado de Contas a Receber (receber.php) com persistência
  const [contasReceber, setContasReceber] = useState<ContaReceber[]>(() => {
    try {
      const salvo = localStorage.getItem('mfx_contas_receber');
      if (salvo) return JSON.parse(salvo);
    } catch (e) {
      console.warn('Erro ao carregar contas a receber do localStorage:', e);
    }
    return CONTAS_RECEBER_INICIAIS;
  });

  // Estado de Contas a Pagar (pagar.php) com persistência
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>(() => {
    try {
      const salvo = localStorage.getItem('mfx_contas_pagar');
      if (salvo) return JSON.parse(salvo);
    } catch (e) {
      console.warn('Erro ao carregar contas a pagar do localStorage:', e);
    }
    return CONTAS_PAGAR_INICIAIS;
  });

  // Estado de NF-e (Produtos) com persistência em localStorage (inicializado vazio sem mock data)
  const [notasNfe, setNotasNfe] = useState<NotaFiscalNfe[]>(() => {
    try {
      const resetFeito = localStorage.getItem('mfx_nfe_limpo_v1');
      if (!resetFeito) {
        localStorage.setItem('mfx_nfe_limpo_v1', 'true');
        localStorage.setItem('mfx_notas_nfe', JSON.stringify([]));
        return [];
      }
      const salvo = localStorage.getItem('mfx_notas_nfe');
      if (salvo) return JSON.parse(salvo);
    } catch (e) {
      console.warn('Erro ao carregar NF-e do localStorage:', e);
    }
    return NOTAS_NFE_INICIAIS;
  });

  // Estado de NFS-e (Serviços) com persistência em localStorage (inicializado vazio sem mock data)
  const [notasNfse, setNotasNfse] = useState<NotaFiscalNfse[]>(() => {
    try {
      const resetFeito = localStorage.getItem('mfx_nfse_limpo_v1');
      if (!resetFeito) {
        localStorage.setItem('mfx_nfse_limpo_v1', 'true');
        localStorage.setItem('mfx_notas_nfse', JSON.stringify([]));
        return [];
      }
      const salvo = localStorage.getItem('mfx_notas_nfse');
      if (salvo) return JSON.parse(salvo);
    } catch (e) {
      console.warn('Erro ao carregar NFS-e do localStorage:', e);
    }
    return NOTAS_NFSE_INICIAIS;
  });

  // Estado de Usuários e Gestão de Acessos com persistência
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => {
    try {
      const salvo = localStorage.getItem('mfx_usuarios');
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Erro ao carregar usuários do localStorage:', e);
    }
    return USUARIOS_INICIAIS;
  });

  // Usuário atualmente autenticado na sessão
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario>(() => {
    try {
      const salvo = localStorage.getItem('mfx_usuario_logado');
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (parsed && parsed.login) return parsed;
      }
    } catch (e) {
      console.warn('Erro ao carregar usuário logado do localStorage:', e);
    }
    return USUARIOS_INICIAIS[0]; // medrade
  });

  // Controle de exibição da tela cheia de login (login.php)
  const [mostrarTelaLogin, setMostrarTelaLogin] = useState<boolean>(false);

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

  useEffect(() => {
    try {
      localStorage.setItem('mfx_contas_receber', JSON.stringify(contasReceber));
    } catch (e) {
      console.warn('Erro ao salvar contas a receber:', e);
    }
  }, [contasReceber]);

  useEffect(() => {
    try {
      localStorage.setItem('mfx_contas_pagar', JSON.stringify(contasPagar));
    } catch (e) {
      console.warn('Erro ao salvar contas a pagar:', e);
    }
  }, [contasPagar]);

  useEffect(() => {
    try {
      localStorage.setItem('mfx_usuarios', JSON.stringify(usuarios));
    } catch (e) {
      console.warn('Erro ao salvar usuários:', e);
    }
  }, [usuarios]);

  useEffect(() => {
    try {
      localStorage.setItem('mfx_usuario_logado', JSON.stringify(usuarioLogado));
    } catch (e) {
      console.warn('Erro ao salvar usuário logado:', e);
    }
  }, [usuarioLogado]);

  useEffect(() => {
    try {
      localStorage.setItem('mfx_notas_nfe', JSON.stringify(notasNfe));
    } catch (e) {
      console.warn('Erro ao salvar NF-e:', e);
    }
  }, [notasNfe]);

  useEffect(() => {
    try {
      localStorage.setItem('mfx_notas_nfse', JSON.stringify(notasNfse));
    } catch (e) {
      console.warn('Erro ao salvar NFS-e:', e);
    }
  }, [notasNfse]);

  // Ações Fiscais: Emissão e Cancelamento de NF-e e NFS-e
  const handleEmitirNfe = (novaNota: NotaFiscalNfe) => {
    setNotasNfe((prev) => [novaNota, ...prev]);
  };

  const handleCancelarNfe = (notaId: string, motivo: string) => {
    const agora = new Date();
    const dataHora = `${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR')}`;
    const protocoloCancelamento = `1352600${Math.floor(1000000 + Math.random() * 9000000)}`;

    setNotasNfe((prev) =>
      prev.map((n) => {
        if (n.id === notaId) {
          return {
            ...n,
            status: 'Cancelada' as const,
            motivoCancelamento: motivo,
            dataCancelamento: dataHora,
            protocoloCancelamento,
          };
        }
        return n;
      })
    );
  };

  const handleEmitirNfse = (novaNota: NotaFiscalNfse) => {
    setNotasNfse((prev) => [novaNota, ...prev]);
  };

  const handleCancelarNfse = (notaId: string, motivo: string) => {
    const agora = new Date();
    const dataHora = `${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR')}`;
    const protocoloCancelamento = `CAN-${agora.getFullYear()}${Math.floor(10000 + Math.random() * 90000)}`;

    setNotasNfse((prev) =>
      prev.map((n) => {
        if (n.id === notaId) {
          return {
            ...n,
            status: 'Cancelada' as const,
            motivoCancelamento: motivo,
            dataCancelamento: dataHora,
            protocoloCancelamento,
          };
        }
        return n;
      })
    );
  };

  // Ações de Gestão de Usuários e Acesso
  const handleAddUsuario = (novoUsuario: Usuario) => {
    setUsuarios((prev) => [...prev, novoUsuario]);
  };

  const handleUpdateUsuario = (usuarioAtualizado: Usuario) => {
    setUsuarios((prev) =>
      prev.map((u) => (u.id === usuarioAtualizado.id ? usuarioAtualizado : u))
    );
    if (usuarioLogado.id === usuarioAtualizado.id) {
      setUsuarioLogado(usuarioAtualizado);
    }
  };

  const handleDeleteUsuario = (id: string) => {
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  };

  const handleLoginSucesso = (usuarioAutenticado: Usuario) => {
    setUsuarioLogado(usuarioAutenticado);
    setMostrarTelaLogin(false);
    setCurrentModule('abertura');
  };

  // Ações de Compras e Atualização Automática de Estoque
  const handleSalvarCompra = (novaCompra: Compra) => {
    setCompras((prev) => [novaCompra, ...prev]);

    // Conexão automática com Contas a Pagar (pagar.php)
    const hoje = new Date().toISOString().split('T')[0];
    const dVenc = new Date();
    dVenc.setDate(dVenc.getDate() + 28);
    const dataVencimento = dVenc.toISOString().split('T')[0];

    const novaContaPagar: ContaPagar = {
      id: `pag-cmp-${novaCompra.id}`,
      fornecedorOuDespesa: novaCompra.fornecedor,
      categoria: 'Insumos / Matéria-Prima',
      origemTipo: 'COMPRA',
      origemNumero: novaCompra.numeroNota || 'NF-e Entrada',
      origemId: novaCompra.id,
      valor: novaCompra.valorTotal,
      dataLancamento: novaCompra.dataCompra || hoje,
      dataVencimento,
      status: 'A Pagar',
      observacoes: novaCompra.observacoes || 'Importação e compra de insumos de corte',
    };
    setContasPagar((prev) => [novaContaPagar, ...prev]);
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

    // 4. Conexão automática com Contas a Receber (Venda Balcão já entra como Pago)
    const novaContaReceber: ContaReceber = {
      id: `rec-vnd-${novaVenda.id}`,
      cliente: novaVenda.clienteNome,
      clienteDocumento: novaVenda.clienteDocumento,
      origemTipo: 'PDV',
      origemNumero: `PDV #${novaVenda.codigoVenda}`,
      origemId: novaVenda.id,
      valorTotal: novaVenda.valorTotal,
      dataLancamento: novaVenda.dataVenda,
      dataVencimento: novaVenda.dataVenda,
      status: 'Pago',
      dataBaixa: novaVenda.dataVenda,
      formaPagamento: novaVenda.formaPagamento,
      observacoes: `Venda balcão (${novaVenda.itens.length} itens)`,
    };
    setContasReceber((prev) => [novaContaReceber, ...prev]);
  };

  const handleAdicionarMovimentoCaixa = (novoMovimento: MovimentoCaixa) => {
    setMovimentosCaixa((prev) => [novoMovimento, ...prev]);
  };

  // Ações de Contas a Receber (receber.php)
  const handleDarBaixaReceber = (
    id: string,
    formaPagamento: FormaPagamento,
    dataBaixa: string,
    observacoes?: string
  ) => {
    const agora = new Date();
    const hora = agora.toTimeString().split(' ')[0].substring(0, 5);
    const dataHora = `${dataBaixa} ${hora}`;

    setContasReceber((prev) =>
      prev.map((conta) => {
        if (conta.id === id) {
          // Lança entrada automática no Caixa Geral
          const novoMov: MovimentoCaixa = {
            id: `mov-${Date.now()}`,
            tipo: 'ENTRADA',
            origem: conta.origemTipo === 'OS' ? 'OS' : (conta.origemTipo === 'PDV' ? 'PDV' : 'MANUAL'),
            referenciaId: conta.origemId || conta.id,
            descricao: `Recebimento: ${conta.origemNumero} - ${conta.cliente}`,
            formaPagamento,
            valor: conta.valorTotal,
            dataHora,
            operador: usuarioLogado?.nome || 'ADM - MEDRADE',
          };
          setMovimentosCaixa((m) => [novoMov, ...m]);

          return {
            ...conta,
            status: 'Pago',
            dataBaixa,
            formaPagamento,
            observacoes: observacoes || conta.observacoes,
          };
        }
        return conta;
      })
    );
  };

  const handleAdicionarContaReceber = (novaConta: ContaReceber) => {
    setContasReceber((prev) => [novaConta, ...prev]);
  };

  // Ações de Contas a Pagar (pagar.php)
  const handleDarBaixaPagar = (
    id: string,
    formaPagamento: FormaPagamento,
    contaSaida: string,
    dataBaixa: string,
    observacoes?: string
  ) => {
    const agora = new Date();
    const hora = agora.toTimeString().split(' ')[0].substring(0, 5);
    const dataHora = `${dataBaixa} ${hora}`;

    setContasPagar((prev) =>
      prev.map((conta) => {
        if (conta.id === id) {
          // Lança saída automática no Caixa Geral
          const novoMov: MovimentoCaixa = {
            id: `mov-${Date.now()}`,
            tipo: 'SAIDA',
            origem: conta.origemTipo === 'COMPRA' ? 'COMPRA' : 'MANUAL',
            referenciaId: conta.origemId || conta.id,
            descricao: `Pagamento: ${conta.fornecedorOuDespesa} (${conta.categoria})`,
            formaPagamento,
            valor: conta.valor,
            dataHora,
            operador: usuarioLogado?.nome || 'ADM - MEDRADE',
          };
          setMovimentosCaixa((m) => [novoMov, ...m]);

          return {
            ...conta,
            status: 'Pago',
            dataBaixa,
            formaPagamento,
            contaSaida,
            observacoes: observacoes || conta.observacoes,
          };
        }
        return conta;
      })
    );
  };

  const handleAdicionarContaPagar = (novaConta: ContaPagar) => {
    setContasPagar((prev) => [novaConta, ...prev]);
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

    // Conexão automática com Contas a Receber (receber.php)
    const hoje = new Date().toISOString().split('T')[0];
    const novaContaReceber: ContaReceber = {
      id: `rec-os-${novaOS.id}`,
      cliente: novaOS.clienteNome,
      clienteDocumento: novaOS.clienteDocumento,
      origemTipo: 'OS',
      origemNumero: novaOS.numeroOS,
      origemId: novaOS.id,
      valorTotal: novaOS.valorTotalGeral,
      dataLancamento: novaOS.dataAbertura || hoje,
      dataVencimento: novaOS.dataPrevisao || hoje,
      status: novaOS.status === 'Faturado' ? 'Pago' : 'Pendente',
      dataBaixa: novaOS.status === 'Faturado' ? (novaOS.dataConclusao || hoje) : undefined,
      formaPagamento: novaOS.status === 'Faturado' ? 'BOLETO' : undefined,
      observacoes: novaOS.observacoesGerais || `${novaOS.equipamentoTipo} - Manutenção & Peças`,
    };
    setContasReceber((prev) => [novaContaReceber, ...prev]);

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

  if (mostrarTelaLogin) {
    return (
      <LoginView
        usuarios={usuarios}
        onLoginSucesso={handleLoginSucesso}
        onCancelar={() => setMostrarTelaLogin(false)}
        onVerCodigoPhp={() => {
          setMostrarTelaLogin(false);
          setCurrentModule('codigo_php');
        }}
      />
    );
  }

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
          usuarioLogado={usuarioLogado}
          onAbrirLogin={() => setMostrarTelaLogin(true)}
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
                  <span>Nova OS</span>
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
                  <span>Imprimir A4</span>
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

            {currentModule === 'receber' && (
              <ReceberView
                contas={contasReceber}
                ordens={ordens}
                vendas={vendas}
                onDarBaixa={handleDarBaixaReceber}
                onAdicionarConta={handleAdicionarContaReceber}
                onIrParaPagar={() => setCurrentModule('pagar')}
                onIrParaCaixa={() => setCurrentModule('financeiro')}
              />
            )}

            {currentModule === 'pagar' && (
              <PagarView
                contas={contasPagar}
                compras={compras}
                onDarBaixa={handleDarBaixaPagar}
                onAdicionarConta={handleAdicionarContaPagar}
                onIrParaReceber={() => setCurrentModule('receber')}
                onIrParaCaixa={() => setCurrentModule('financeiro')}
              />
            )}

            {currentModule === 'financeiro' && (
              <FinanceiroView
                movimentos={movimentosCaixa}
                onAdicionarMovimento={handleAdicionarMovimentoCaixa}
                onIrParaPdv={() => setCurrentModule('pdv')}
                onIrParaReceber={() => setCurrentModule('receber')}
                onIrParaPagar={() => setCurrentModule('pagar')}
              />
            )}

            {currentModule === 'acesso' && (
              <AcessoView
                usuarios={usuarios}
                onAddUsuario={handleAddUsuario}
                onUpdateUsuario={handleUpdateUsuario}
                onDeleteUsuario={handleDeleteUsuario}
                usuarioLogado={usuarioLogado}
                onTrocarUsuarioLogado={(u) => setUsuarioLogado(u)}
                onAbrirLogin={() => setMostrarTelaLogin(true)}
                onIrParaCodigoPhp={() => setCurrentModule('codigo_php')}
              />
            )}

            {currentModule === 'configuracoes' && <ConfiguracoesView />}

            {currentModule === 'ajuda' && (
              <AjudaView
                onNavigate={(mod, extra) => {
                  setCurrentModule(mod);
                  if (mod === 'os') {
                    if (extra === 'nova') setOsSubView('nova');
                    else if (extra === 'imprimir') setOsSubView('imprimir');
                    else setOsSubView('listar');
                  }
                }}
              />
            )}

            {(currentModule === 'nfe' || currentModule === 'fiscal') && (
              <NfeView
                ordens={ordens}
                vendas={vendas}
                notasEmitidas={notasNfe}
                onEmitirNfe={handleEmitirNfe}
                onCancelarNfe={handleCancelarNfe}
              />
            )}

            {currentModule === 'nfse' && (
              <NfseView
                ordens={ordens}
                notasEmitidas={notasNfse}
                onEmitirNfse={handleEmitirNfse}
                onCancelarNfse={handleCancelarNfse}
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
