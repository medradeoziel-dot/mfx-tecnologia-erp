import React, { useState, useMemo } from 'react';
import { ItemEstoque, Cliente, Venda, ItemVenda, FormaPagamento, MovimentoCaixa } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Search, 
  User, 
  CreditCard, 
  DollarSign, 
  QrCode, 
  FileText, 
  Printer, 
  RotateCcw, 
  TrendingUp, 
  Clock, 
  Boxes, 
  AlertTriangle,
  Receipt,
  Copy,
  Check,
  Building,
  Sparkles,
  ShoppingBag,
  Barcode
} from 'lucide-react';

interface PdvViewProps {
  produtosEstoque: ItemEstoque[];
  clientes: Cliente[];
  vendas: Venda[];
  onFinalizarVenda: (novaVenda: Venda, atualizacoesEstoque: { codigo: string; quantidade: number }[]) => void;
  onIrParaEstoque: () => void;
  onIrParaFinanceiro: () => void;
}

export const PdvView: React.FC<PdvViewProps> = ({
  produtosEstoque,
  clientes,
  vendas,
  onFinalizarVenda,
  onIrParaEstoque,
  onIrParaFinanceiro,
}) => {
  // Apenas produtos físicos para venda no PDV balcão (serviços podem ser faturados ou vendidos avulsos)
  const produtosDisponiveis = useMemo(() => {
    return produtosEstoque.filter(p => p.tipo === 'produto');
  }, [produtosEstoque]);

  // Tab ativa: 'caixa' (faturamento) ou 'historico' (vendas do dia)
  const [tabAtiva, setTabAtiva] = useState<'caixa' | 'historico'>('caixa');

  // Lançamento de produto no caixa
  const [buscaOuCodigo, setBuscaOuCodigo] = useState('');
  const [produtoLancamentoId, setProdutoLancamentoId] = useState('');
  const [quantidadeLancamento, setQuantidadeLancamento] = useState<number>(1);
  const [sugestoesAbertas, setSugestoesAbertas] = useState(false);

  // Cliente da venda
  const [tipoCliente, setTipoCliente] = useState<'balcao' | 'cadastrado'>('balcao');
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<string>('');
  const [documentoConsumidor, setDocumentoConsumidor] = useState<string>('');
  const [nomeConsumidor, setNomeConsumidor] = useState<string>('Consumidor Final / Venda Balcão');

  // Itens da venda atual (Carrinho limpo para novo lançamento)
  const [carrinho, setCarrinho] = useState<ItemVenda[]>([]);

  // Desconto e Acréscimo
  const [tipoDesconto, setTipoDesconto] = useState<'reais' | 'porcento'>('reais');
  const [valorDescontoInput, setValorDescontoInput] = useState<number>(0);

  // Forma de Pagamento selecionada
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('PIX');
  const [valorRecebidoDinheiro, setValorRecebidoDinheiro] = useState<string>('');
  const [parcelasCartao, setParcelasCartao] = useState<number>(1);
  const [bandeiraCartao, setBandeiraCartao] = useState<string>('Visa');
  const [tipoCartao, setTipoCartao] = useState<'CREDITO' | 'DEBITO'>('CREDITO');
  const [prazoBoleto, setPrazoBoleto] = useState<string>('28 DDL');
  const [observacoesVenda, setObservacoesVenda] = useState<string>('');

  // Estados de feedback e modal de cupom
  const [chaveCopiada, setChaveCopiada] = useState(false);
  const [vendaConcluida, setVendaConcluida] = useState<Venda | null>(null);
  const [modalCupomAberto, setModalCupomAberto] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  // Cálculos financeiros do carrinho
  const subtotalCarrinho = useMemo(() => {
    return carrinho.reduce((acc, it) => acc + it.valorTotal, 0);
  }, [carrinho]);

  const totalDescontoCalculado = useMemo(() => {
    if (tipoDesconto === 'porcento') {
      return (subtotalCarrinho * (valorDescontoInput || 0)) / 100;
    }
    return Math.min(valorDescontoInput || 0, subtotalCarrinho);
  }, [subtotalCarrinho, tipoDesconto, valorDescontoInput]);

  const valorTotalVenda = useMemo(() => {
    return Math.max(0, subtotalCarrinho - totalDescontoCalculado);
  }, [subtotalCarrinho, totalDescontoCalculado]);

  // Cálculo do Troco em Dinheiro
  const trocoCalculado = useMemo(() => {
    if (formaPagamento !== 'DINHEIRO') return 0;
    const recebido = parseFloat(valorRecebidoDinheiro) || 0;
    return Math.max(0, recebido - valorTotalVenda);
  }, [formaPagamento, valorRecebidoDinheiro, valorTotalVenda]);

  // Produto selecionado no formulário de inserção direta
  const produtoSelecionado = useMemo(() => {
    if (produtoLancamentoId) {
      return produtosDisponiveis.find(p => p.id === produtoLancamentoId);
    }
    const termo = buscaOuCodigo.trim().toLowerCase();
    if (!termo) return undefined;
    return produtosDisponiveis.find(p => p.codigo.toLowerCase() === termo);
  }, [produtosDisponiveis, produtoLancamentoId, buscaOuCodigo]);

  // Sugestões para o campo de busca / bip do leitor
  const produtosSugeridos = useMemo(() => {
    const termo = buscaOuCodigo.trim().toLowerCase();
    if (!termo) return produtosDisponiveis.slice(0, 10);
    return produtosDisponiveis.filter(p => 
      p.codigo.toLowerCase().includes(termo) ||
      p.descricao.toLowerCase().includes(termo)
    ).slice(0, 12);
  }, [produtosDisponiveis, buscaOuCodigo]);

  // Totais do histórico de vendas do dia
  const estatisticasVendas = useMemo(() => {
    const totalVendas = vendas.length;
    const faturamentoTotal = vendas.reduce((acc, v) => acc + v.valorTotal, 0);
    const ticketMedio = totalVendas > 0 ? faturamentoTotal / totalVendas : 0;
    return { totalVendas, faturamentoTotal, ticketMedio };
  }, [vendas]);

  // Adicionar produto ao carrinho
  const handleAdicionarAoCarrinho = (prod: ItemEstoque, qtdAdicional = 1) => {
    const quantidadeValida = Math.max(1, qtdAdicional || 1);
    const existenteIndex = carrinho.findIndex(it => it.codigo === prod.codigo);
    if (existenteIndex >= 0) {
      // Incrementa quantidade
      const novoCarrinho = [...carrinho];
      const itemExistente = novoCarrinho[existenteIndex];
      const novaQtd = itemExistente.quantidade + quantidadeValida;
      novoCarrinho[existenteIndex] = {
        ...itemExistente,
        quantidade: novaQtd,
        valorTotal: novaQtd * itemExistente.precoUnitario,
      };
      setCarrinho(novoCarrinho);
    } else {
      // Adiciona novo item
      const novoItem: ItemVenda = {
        id: `it-cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        produtoId: prod.id,
        codigo: prod.codigo,
        descricao: prod.descricao,
        categoria: prod.categoria,
        unidadeMedida: prod.unidadeMedida,
        quantidade: quantidadeValida,
        precoUnitario: prod.precoVenda,
        valorTotal: prod.precoVenda * quantidadeValida,
      };
      setCarrinho([...carrinho, novoItem]);
    }
  };

  // Inserir item no carrinho através do formulário de bip/seleção direta
  const handleInserirItemDireto = (produtoEspecifico?: ItemEstoque) => {
    let prod = produtoEspecifico || produtoSelecionado;

    if (!prod && buscaOuCodigo.trim()) {
      const termo = buscaOuCodigo.trim().toLowerCase();
      prod = produtosDisponiveis.find(p => p.codigo.toLowerCase() === termo) ||
             produtosDisponiveis.find(p => p.codigo.toLowerCase().includes(termo) || p.descricao.toLowerCase().includes(termo));
    }

    if (!prod) {
      if (buscaOuCodigo.trim() && produtosSugeridos.length > 0) {
        prod = produtosSugeridos[0];
      } else {
        alert('Por favor, selecione ou digite o código de um produto válido cadastrado no estoque.');
        return;
      }
    }

    const qtd = Math.max(1, quantidadeLancamento || 1);
    handleAdicionarAoCarrinho(prod, qtd);

    // Limpa campos para o próximo lançamento
    setBuscaOuCodigo('');
    setProdutoLancamentoId('');
    setQuantidadeLancamento(1);
    setSugestoesAbertas(false);
  };

  // Alterar quantidade de um item no carrinho
  const handleAlterarQuantidade = (id: string, novaQtd: number) => {
    if (novaQtd <= 0) {
      handleRemoverDoCarrinho(id);
      return;
    }
    setCarrinho(carrinho.map(it => {
      if (it.id === id) {
        return {
          ...it,
          quantidade: novaQtd,
          valorTotal: novaQtd * it.precoUnitario,
        };
      }
      return it;
    }));
  };

  // Remover item do carrinho
  const handleRemoverDoCarrinho = (id: string) => {
    setCarrinho(carrinho.filter(it => it.id !== id));
  };

  // Limpar carrinho
  const handleLimparCarrinho = () => {
    if (carrinho.length === 0) return;
    if (window.confirm('Deseja realmente limpar todos os itens da venda atual?')) {
      setCarrinho([]);
      setValorDescontoInput(0);
      setValorRecebidoDinheiro('');
    }
  };

  // Copiar chave PIX
  const handleCopiarPix = () => {
    navigator.clipboard.writeText('52.148.963/0001-44');
    setChaveCopiada(true);
    setTimeout(() => setChaveCopiada(false), 2500);
  };

  // Finalizar a Venda
  const handleConcluirVenda = () => {
    if (carrinho.length === 0) {
      alert('Adicione pelo menos um item ao carrinho antes de finalizar a venda.');
      return;
    }

    if (formaPagamento === 'DINHEIRO') {
      const recebido = parseFloat(valorRecebidoDinheiro) || 0;
      if (recebido > 0 && recebido < valorTotalVenda) {
        alert(`O valor recebido em dinheiro (R$ ${recebido.toFixed(2)}) é inferior ao total da venda (R$ ${valorTotalVenda.toFixed(2)}).`);
        return;
      }
    }

    // Definir nome do cliente
    let finalClienteNome = 'Consumidor Final / Venda Balcão';
    let finalClienteDoc = documentoConsumidor || 'Não informado';
    let finalClienteId: string | undefined = undefined;

    if (tipoCliente === 'cadastrado' && clienteSelecionadoId) {
      const cli = clientes.find(c => c.id === clienteSelecionadoId);
      if (cli) {
        finalClienteNome = cli.nomeFantasia ? `${cli.nomeFantasia} (${cli.nome})` : cli.nome;
        finalClienteDoc = cli.documento;
        finalClienteId = cli.id;
      }
    } else if (nomeConsumidor.trim()) {
      finalClienteNome = nomeConsumidor.trim();
    }

    // Detalhe do pagamento
    let detalhePag = '';
    if (formaPagamento === 'DINHEIRO') {
      const recebido = parseFloat(valorRecebidoDinheiro) || valorTotalVenda;
      detalhePag = `Dinheiro (Recebido: R$ ${recebido.toFixed(2)} - Troco: R$ ${trocoCalculado.toFixed(2)})`;
    } else if (formaPagamento === 'PIX') {
      detalhePag = 'PIX Instantâneo - Chave CNPJ MFx';
    } else if (formaPagamento === 'CARTAO_CREDITO') {
      detalhePag = `Cartão de Crédito ${bandeiraCartao} ${parcelasCartao}x de R$ ${(valorTotalVenda / parcelasCartao).toFixed(2)}`;
    } else if (formaPagamento === 'CARTAO_DEBITO') {
      detalhePag = `Cartão de Débito ${bandeiraCartao} à vista`;
    } else if (formaPagamento === 'BOLETO') {
      detalhePag = `Boleto Bancário / Faturado (${prazoBoleto})`;
    }

    const agora = new Date();
    const codigoVenda = `VND-${agora.getFullYear()}-${String(vendas.length + 44).padStart(4, '0')}`;
    const dataVenda = agora.toISOString().split('T')[0];
    const horaVenda = agora.toTimeString().split(' ')[0].substring(0, 5);

    const novaVenda: Venda = {
      id: `vnd-${Date.now()}`,
      codigoVenda,
      clienteId: finalClienteId,
      clienteNome: finalClienteNome,
      clienteDocumento: finalClienteDoc,
      dataVenda,
      horaVenda,
      formaPagamento,
      detalhePagamento: detalhePag,
      valorSubtotal: subtotalCarrinho,
      valorDesconto: totalDescontoCalculado,
      valorTotal: valorTotalVenda,
      valorRecebido: formaPagamento === 'DINHEIRO' ? (parseFloat(valorRecebidoDinheiro) || valorTotalVenda) : valorTotalVenda,
      valorTroco: trocoCalculado,
      observacoes: observacoesVenda,
      operador: 'ADM - MEDRADE',
      itens: [...carrinho],
    };

    // Montar baixa de estoque
    const atualizacoesEstoque = carrinho.map(item => ({
      codigo: item.codigo,
      quantidade: item.quantidade, // será subtraída
    }));

    // Chamar callback do App.tsx
    onFinalizarVenda(novaVenda, atualizacoesEstoque);

    // Guardar para o modal de cupom
    setVendaConcluida(novaVenda);
    setModalCupomAberto(true);
    setMensagemSucesso(`Venda ${novaVenda.codigoVenda} finalizada com sucesso! Baixa de estoque efetuada.`);

    // Limpar formulário de venda atual
    setCarrinho([]);
    setValorDescontoInput(0);
    setValorRecebidoDinheiro('');
    setObservacoesVenda('');
    setTipoCliente('balcao');
    setClienteSelecionadoId('');
  };

  // Abrir reimpressão do cupom a partir do histórico
  const handleReimprimirVenda = (venda: Venda) => {
    setVendaConcluida(venda);
    setModalCupomAberto(true);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Cabeçalho Corporativo MFx PDV (Tema Dark Industrial) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-950/40 text-xl">
              <i className="fa-solid fa-cash-register"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded font-mono">
                  MÓDULO PDV & BALCÃO
                </span>
                <span className="text-xs text-slate-400 font-medium">| MFx Tecnologia Industrial</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  CAIXA ABERTO
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1 flex items-center gap-2">
                Ponto de Venda & Faturamento Rápido
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Venda ágil de consumíveis, bicos, lentes, periféricos e peças industriais com baixa física imediata no estoque.
              </p>
            </div>
          </div>

          {/* Cards de Métricas e Navegação */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg px-3.5 py-2 text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Faturamento Hoje</div>
              <div className="text-sm font-black font-mono text-emerald-400">
                {formatCurrency(estatisticasVendas.faturamentoTotal)}
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-lg px-3.5 py-2 text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Vendas Feitas</div>
              <div className="text-sm font-black font-mono text-amber-400">
                {estatisticasVendas.totalVendas} vendas
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setTabAtiva('caixa')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                  tabAtiva === 'caixa'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <i className="fa-solid fa-cart-shopping"></i>
                <span>Novo Atendimento</span>
              </button>

              <button
                onClick={() => setTabAtiva('historico')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                  tabAtiva === 'historico'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <i className="fa-solid fa-clock-rotate-left"></i>
                <span>Histórico ({vendas.length})</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Alerta de Feedback de Operação Concluída */}
      {mensagemSucesso && (
        <div className="bg-emerald-950/80 border border-emerald-600/60 text-emerald-200 px-4 py-3 rounded-xl flex items-center justify-between gap-3 text-xs shadow-md animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{mensagemSucesso}</span>
          </div>
          <div className="flex items-center gap-2">
            {vendaConcluida && (
              <button
                onClick={() => setModalCupomAberto(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3 py-1 rounded text-xs transition flex items-center gap-1 shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Reabrir Cupom</span>
              </button>
            )}
            <button
              onClick={() => setMensagemSucesso(null)}
              className="text-emerald-400 hover:text-white text-xs px-2 py-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 1: CAIXA / VENDA BALCÃO */}
      {tabAtiva === 'caixa' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* COLUNA ESQUERDA: LANÇAMENTO DIRETO & TABELA DE ITENS DA VENDA (7 colunas) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Bloco de Lançamento Direto do Item (Formulário Rápido de Bip / Digitação) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Barcode className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Lançamento de Produto / Código de Barras
                  </span>
                </div>
                {produtoSelecionado && (
                  <span className="text-[11px] font-mono text-slate-400">
                    Estoque disponível: <strong className="text-emerald-400 font-bold">{produtoSelecionado.estoqueAtual} {produtoSelecionado.unidadeMedida}</strong>
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {/* Linha 1: Input de Código / Busca com Autocomplete e Seletor Rápido */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-7 relative">
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Código ou Descrição (Bipar ou Digitar)
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={buscaOuCodigo}
                        onChange={(e) => {
                          setBuscaOuCodigo(e.target.value);
                          setSugestoesAbertas(true);
                          const exato = produtosDisponiveis.find(p => p.codigo.toLowerCase() === e.target.value.trim().toLowerCase());
                          if (exato) {
                            setProdutoLancamentoId(exato.id);
                          }
                        }}
                        onFocus={() => setSugestoesAbertas(true)}
                        onBlur={() => {
                          setTimeout(() => setSugestoesAbertas(false), 250);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleInserirItemDireto();
                          }
                        }}
                        placeholder="Ex: MFX-LP30-15 ou bipe o código de barras..."
                        className="w-full bg-slate-950 text-white placeholder-slate-500 text-xs rounded-lg pl-9 pr-8 py-2.5 border border-slate-700 focus:border-amber-500 focus:outline-none font-mono"
                      />
                      {buscaOuCodigo && (
                        <button
                          type="button"
                          onClick={() => {
                            setBuscaOuCodigo('');
                            setProdutoLancamentoId('');
                            setSugestoesAbertas(false);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1"
                          title="Limpar"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Dropdown de Autocomplete / Sugestões rápidas */}
                    {sugestoesAbertas && produtosSugeridos.length > 0 && (
                      <div className="absolute z-30 left-0 right-0 mt-1 bg-slate-950 border border-slate-700 rounded-lg shadow-2xl max-h-56 overflow-y-auto divide-y divide-slate-800">
                        {produtosSugeridos.map(p => (
                          <div
                            key={p.id}
                            onMouseDown={() => {
                              setProdutoLancamentoId(p.id);
                              setBuscaOuCodigo(p.codigo);
                              setSugestoesAbertas(false);
                            }}
                            className="p-2.5 hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs transition"
                          >
                            <div className="flex-1 min-w-0 pr-3">
                              <span className="font-mono font-bold text-amber-400 text-xs block">{p.codigo}</span>
                              <span className="text-slate-300 truncate block text-[11px]">{p.descricao}</span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-mono font-bold text-emerald-400 text-xs block">{formatCurrency(p.precoVenda)}</span>
                              <span className="text-[10px] text-slate-400 font-mono">Estq: {p.estoqueAtual} {p.unidadeMedida}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dropdown de Seleção de Produto Alternativo */}
                  <div className="md:col-span-5">
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Ou Selecione da Lista
                    </label>
                    <select
                      value={produtoLancamentoId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setProdutoLancamentoId(id);
                        const sel = produtosDisponiveis.find(p => p.id === id);
                        if (sel) {
                          setBuscaOuCodigo(sel.codigo);
                        } else {
                          setBuscaOuCodigo('');
                        }
                      }}
                      className="w-full bg-slate-950 text-white text-xs rounded-lg px-2.5 py-2.5 border border-slate-700 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">-- Escolher produto cadastrado --</option>
                      {produtosDisponiveis.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.codigo} - {p.descricao.substring(0, 32)}... ({formatCurrency(p.precoVenda)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Linha 2: Quantidade, Preço Unitário, Subtotal e Botão Inserir */}
                <div className="grid grid-cols-2 sm:grid-cols-12 gap-3 items-end pt-1">
                  {/* Quantidade */}
                  <div className="sm:col-span-3">
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Quantidade
                    </label>
                    <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setQuantidadeLancamento(prev => Math.max(1, prev - 1))}
                        className="px-2.5 py-2 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={quantidadeLancamento}
                        onChange={(e) => setQuantidadeLancamento(Math.max(1, parseInt(e.target.value) || 1))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleInserirItemDireto();
                          }
                        }}
                        className="w-full bg-transparent text-center font-mono font-bold text-white text-xs focus:outline-none py-2"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantidadeLancamento(prev => prev + 1)}
                        className="px-2.5 py-2 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Valor Unitário Preview */}
                  <div className="sm:col-span-3">
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Vlr. Unitário
                    </label>
                    <div className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-right">
                      <span className="font-mono font-bold text-slate-200 text-xs">
                        {produtoSelecionado ? formatCurrency(produtoSelecionado.precoVenda) : 'R$ 0,00'}
                      </span>
                    </div>
                  </div>

                  {/* Subtotal Linha Preview */}
                  <div className="sm:col-span-3">
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Subtotal Linha
                    </label>
                    <div className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-right">
                      <span className="font-mono font-bold text-emerald-400 text-xs">
                        {produtoSelecionado ? formatCurrency(produtoSelecionado.precoVenda * quantidadeLancamento) : 'R$ 0,00'}
                      </span>
                    </div>
                  </div>

                  {/* Botão Adicionar Item */}
                  <div className="sm:col-span-3 col-span-2">
                    <button
                      type="button"
                      onClick={() => handleInserirItemDireto()}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 px-3 rounded-lg text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Inserir Item</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela de Itens da Venda */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Itens da Venda ({carrinho.length})
                  </span>
                </div>
                {carrinho.length > 0 && (
                  <button
                    type="button"
                    onClick={handleLimparCarrinho}
                    className="text-[11px] text-red-400 hover:text-red-300 font-bold hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpar Venda</span>
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-950/70">
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3 w-28">Código</th>
                      <th className="py-2.5 px-3">Descrição</th>
                      <th className="py-2.5 px-3 w-28 text-center">Quantidade</th>
                      <th className="py-2.5 px-3 w-28 text-right">Unitário</th>
                      <th className="py-2.5 px-3 w-28 text-right">Subtotal</th>
                      <th className="py-2.5 px-3 w-16 text-center">Excluir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {carrinho.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          <ShoppingBag className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-60" />
                          <p className="font-semibold text-slate-300 text-xs">Nenhum item lançado na venda atual.</p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Utilize o formulário de código ou leitor de código de barras acima para inserir itens.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      carrinho.map((item, idx) => {
                        const estoqueRef = produtosEstoque.find(p => p.codigo === item.codigo);
                        const saldo = estoqueRef ? estoqueRef.estoqueAtual : 99;
                        const alertaEstoque = saldo < item.quantidade;

                        return (
                          <tr key={item.id} className="hover:bg-slate-950/40 transition">
                            <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-amber-400 text-xs whitespace-nowrap">
                              {item.codigo}
                            </td>
                            <td className="py-2.5 px-3 text-slate-200">
                              <div className="font-medium text-xs">{item.descricao}</div>
                              {alertaEstoque && (
                                <div className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5 font-mono">
                                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                                  <span>Qtd maior que saldo físico ({saldo} {item.unidadeMedida}).</span>
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <div className="inline-flex items-center bg-slate-950 border border-slate-700 rounded px-1 py-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleAlterarQuantidade(item.id, item.quantidade - 1)}
                                  className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-slate-800 text-xs font-bold"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantidade}
                                  onChange={(e) => handleAlterarQuantidade(item.id, parseInt(e.target.value) || 1)}
                                  className="w-10 bg-transparent text-center font-mono font-bold text-white text-xs focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAlterarQuantidade(item.id, item.quantidade + 1)}
                                  className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-slate-800 text-xs font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-300 whitespace-nowrap">
                              {formatCurrency(item.precoUnitario)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                              {formatCurrency(item.valorTotal)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoverDoCarrinho(item.id)}
                                className="p-1 text-slate-500 hover:text-red-400 transition rounded hover:bg-slate-800"
                                title="Excluir linha"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  {carrinho.length > 0 && (
                    <tfoot>
                      <tr className="border-t-2 border-slate-800 text-xs font-bold bg-slate-950/70">
                        <td colSpan={3} className="py-2.5 px-3 text-slate-400">
                          Total: <span className="text-white font-mono">{carrinho.length}</span> itens ({carrinho.reduce((acc, it) => acc + it.quantidade, 0)} volumes)
                        </td>
                        <td colSpan={2} className="py-2.5 px-3 text-right text-slate-400 uppercase text-[10px] tracking-wider">
                          Subtotal da Venda:
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-400">
                          {formatCurrency(subtotalCarrinho)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

          </div>

          {/* COLUNA DIREITA: PAINEL DE FECHAMENTO (5 colunas) */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
              
              {/* Identificação do Cliente */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Cliente / Destinatário
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setTipoCliente('balcao');
                        setClienteSelecionadoId('');
                      }}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded ${
                        tipoCliente === 'balcao'
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Balcão
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoCliente('cadastrado')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded ${
                        tipoCliente === 'cadastrado'
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Cadastrado
                    </button>
                  </div>
                </div>

                {tipoCliente === 'balcao' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                        Nome do Cliente
                      </label>
                      <input
                        type="text"
                        value={nomeConsumidor}
                        onChange={(e) => setNomeConsumidor(e.target.value)}
                        placeholder="Consumidor Final / Balcão"
                        className="w-full bg-slate-900 text-white text-xs rounded px-2.5 py-1.5 border border-slate-700 focus:border-amber-500 focus:outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                        CPF / CNPJ (Opcional)
                      </label>
                      <input
                        type="text"
                        value={documentoConsumidor}
                        onChange={(e) => setDocumentoConsumidor(e.target.value)}
                        placeholder="00.000.000/0000-00"
                        className="w-full bg-slate-900 text-white text-xs rounded px-2.5 py-1.5 border border-slate-700 focus:border-amber-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-2">
                    <label className="text-[10px] text-slate-400 uppercase font-bold block">
                      Selecione o Cliente Cadastrado na Base MFx
                    </label>
                    <select
                      value={clienteSelecionadoId}
                      onChange={(e) => setClienteSelecionadoId(e.target.value)}
                      className="w-full bg-slate-900 text-white text-xs rounded px-2.5 py-1.5 border border-slate-700 focus:border-amber-500 focus:outline-none font-medium"
                    >
                      <option value="">-- Selecione uma empresa ou cliente --</option>
                      {clientes.map(cli => (
                        <option key={cli.id} value={cli.id}>
                          {cli.nomeFantasia || cli.nome} ({cli.documento} - {cli.cidade}/{cli.estado})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Ajuste de Desconto */}
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Desconto:</span>
                  <div className="flex rounded border border-slate-700 overflow-hidden text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setTipoDesconto('reais')}
                      className={`px-1.5 py-0.5 ${tipoDesconto === 'reais' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}
                    >
                      R$
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoDesconto('porcento')}
                      className={`px-1.5 py-0.5 ${tipoDesconto === 'porcento' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}
                    >
                      %
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step={tipoDesconto === 'reais' ? '1.00' : '1'}
                    value={valorDescontoInput || ''}
                    onChange={(e) => setValorDescontoInput(parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                    className="w-24 bg-slate-900 text-right text-white text-xs rounded px-2 py-1 border border-slate-700 focus:border-amber-500 focus:outline-none font-mono"
                  />
                  {totalDescontoCalculado > 0 && (
                    <span className="text-[11px] font-mono font-bold text-red-400">
                      - {formatCurrency(totalDescontoCalculado)}
                    </span>
                  )}
                </div>
              </div>

              {/* Box de Totais */}
              <div className="bg-slate-950 border-2 border-amber-500/60 rounded-xl p-3.5 space-y-1.5 shadow-inner">
                <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                  <span>Subtotal Itens:</span>
                  <span>{formatCurrency(subtotalCarrinho)}</span>
                </div>
                {totalDescontoCalculado > 0 && (
                  <div className="flex justify-between items-center text-xs text-red-400 font-mono">
                    <span>Desconto Concedido:</span>
                    <span>- {formatCurrency(totalDescontoCalculado)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                  <span className="text-xs uppercase font-black tracking-wider text-slate-200">
                    TOTAL A PAGAR:
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                    {formatCurrency(valorTotalVenda)}
                  </span>
                </div>
              </div>

              {/* Formas de Pagamento */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-2">
                  Forma de Pagamento
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'DINHEIRO' as FormaPagamento, label: 'Dinheiro', icon: 'fa-solid fa-money-bill-wave', color: 'hover:border-emerald-500' },
                    { id: 'PIX' as FormaPagamento, label: 'PIX', icon: 'fa-solid fa-bolt', color: 'hover:border-amber-500' },
                    { id: 'CARTAO_CREDITO' as FormaPagamento, label: 'Cartão', icon: 'fa-solid fa-credit-card', color: 'hover:border-blue-500' },
                    { id: 'BOLETO' as FormaPagamento, label: 'Boleto/Fat.', icon: 'fa-solid fa-file-invoice-dollar', color: 'hover:border-purple-500' },
                  ].map(fp => (
                    <button
                      key={fp.id}
                      type="button"
                      onClick={() => setFormaPagamento(fp.id)}
                      className={`p-2 rounded-lg border text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                        formaPagamento === fp.id
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md font-black'
                          : 'bg-slate-950 text-slate-300 border-slate-800 ' + fp.color
                      }`}
                    >
                      <i className={`${fp.icon} text-sm`}></i>
                      <span className="text-[11px]">{fp.label}</span>
                    </button>
                  ))}
                </div>

                {/* Detalhes específicos de cada forma de pagamento */}
                <div className="mt-3 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                  
                  {/* Dinheiro */}
                  {formaPagamento === 'DINHEIRO' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <label className="text-[11px] text-slate-400 font-bold">
                          Valor Recebido do Cliente:
                        </label>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-mono">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={valorRecebidoDinheiro}
                            onChange={(e) => setValorRecebidoDinheiro(e.target.value)}
                            placeholder={valorTotalVenda.toFixed(2)}
                            className="w-28 bg-slate-900 text-right text-white text-xs rounded px-2.5 py-1.5 border border-slate-700 focus:border-amber-500 focus:outline-none font-mono font-bold"
                          />
                        </div>
                      </div>

                      {/* Atalhos rápidos de notas */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-slate-500 font-mono">Atalhos:</span>
                        {[50, 100, 200, 300, 500].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setValorRecebidoDinheiro(val.toFixed(2))}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-300 hover:text-white hover:border-amber-500"
                          >
                            R$ {val}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setValorRecebidoDinheiro(valorTotalVenda.toFixed(2))}
                          className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-mono font-bold hover:bg-amber-500 hover:text-slate-950"
                        >
                          Exato
                        </button>
                      </div>

                      {/* Exibição do Troco */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                        <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                          Troco a Devolver:
                        </span>
                        <span className={`font-mono font-black text-sm ${trocoCalculado > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {formatCurrency(trocoCalculado)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* PIX */}
                  {formaPagamento === 'PIX' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[11px] font-bold text-amber-400">
                            Chave PIX Oficial MFx Tecnologia
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            CNPJ: 52.148.963/0001-44 (Banco Santander)
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleCopiarPix}
                          className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/40 text-[11px] font-bold transition flex items-center gap-1 font-mono"
                        >
                          {chaveCopiada ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar Chave</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-2 bg-slate-900 rounded border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Confirmação em tempo real. Solicite o comprovante na tela do cliente.</span>
                      </div>
                    </div>
                  )}

                  {/* Cartão de Crédito / Débito */}
                  {formaPagamento === 'CARTAO_CREDITO' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                            Tipo de Operação
                          </label>
                          <select
                            value={tipoCartao}
                            onChange={(e) => setTipoCartao(e.target.value as 'CREDITO' | 'DEBITO')}
                            className="w-full bg-slate-900 text-white text-xs rounded px-2 py-1.5 border border-slate-700 focus:outline-none"
                          >
                            <option value="CREDITO">Crédito</option>
                            <option value="DEBITO">Débito</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                            Bandeira
                          </label>
                          <select
                            value={bandeiraCartao}
                            onChange={(e) => setBandeiraCartao(e.target.value)}
                            className="w-full bg-slate-900 text-white text-xs rounded px-2 py-1.5 border border-slate-700 focus:outline-none"
                          >
                            <option value="Visa">Visa</option>
                            <option value="Mastercard">Mastercard</option>
                            <option value="Elo">Elo</option>
                            <option value="Hipercard">Hipercard</option>
                            <option value="Amex">American Express</option>
                          </select>
                        </div>
                      </div>

                      {tipoCartao === 'CREDITO' && (
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                            Parcelamento
                          </label>
                          <select
                            value={parcelasCartao}
                            onChange={(e) => setParcelasCartao(parseInt(e.target.value) || 1)}
                            className="w-full bg-slate-900 text-white text-xs rounded px-2 py-1.5 border border-slate-700 focus:outline-none font-mono"
                          >
                            <option value="1">1x de {formatCurrency(valorTotalVenda)} (À vista)</option>
                            <option value="2">2x de {formatCurrency(valorTotalVenda / 2)} sem juros</option>
                            <option value="3">3x de {formatCurrency(valorTotalVenda / 3)} sem juros</option>
                            <option value="4">4x de {formatCurrency(valorTotalVenda / 4)} sem juros</option>
                            <option value="6">6x de {formatCurrency(valorTotalVenda / 6)} sem juros</option>
                            <option value="10">10x de {formatCurrency(valorTotalVenda / 10)} sem juros</option>
                            <option value="12">12x de {formatCurrency(valorTotalVenda / 12)} sem juros</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Boleto Bancário */}
                  {formaPagamento === 'BOLETO' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-[11px] text-slate-400 font-bold">
                          Prazo de Faturamento:
                        </label>
                        <select
                          value={prazoBoleto}
                          onChange={(e) => setPrazoBoleto(e.target.value)}
                          className="bg-slate-900 text-white text-xs rounded px-2.5 py-1.5 border border-slate-700 focus:outline-none font-mono"
                        >
                          <option value="À Vista">À Vista (Vencimento 3 dias)</option>
                          <option value="14 DDL">14 DDL (Dias)</option>
                          <option value="28 DDL">28 DDL (Padrão Indústria)</option>
                          <option value="30/60 DDL">30 / 60 DDL (2 Parcelas)</option>
                          <option value="30/60/90 DDL">30 / 60 / 90 DDL (3 Parcelas)</option>
                        </select>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        O boleto será registrado no Contas a Receber do Financeiro da MFx.
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Botão de Finalizar Venda */}
              <button
                type="button"
                onClick={handleConcluirVenda}
                disabled={carrinho.length === 0}
                className={`w-full py-3.5 px-4 rounded-xl font-black text-sm tracking-wide uppercase transition flex items-center justify-center gap-2 shadow-xl ${
                  carrinho.length === 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 border border-emerald-400 shadow-emerald-950/40 cursor-pointer active:scale-[0.99]'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-slate-950" />
                <span>Finalizar Venda & Baixar Estoque</span>
              </button>

            </div>

          </div>

        </div>
      )}

      {/* CONTEÚDO DA ABA 2: HISTÓRICO DE VENDAS */}
      {tabAtiva === 'historico' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-clock-rotate-left text-amber-500"></i>
                Histórico de Vendas Balcão & Faturamento
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Registro de todas as vendas emitidas pelo PDV com baixa de consumíveis e lançamentos de caixa.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onIrParaFinanceiro}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold transition flex items-center gap-1.5"
              >
                <DollarSign className="w-4 h-4" />
                <span>Ver Movimentações no Financeiro / Caixa</span>
              </button>
            </div>
          </div>

          {vendas.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <Receipt className="w-12 h-12 mx-auto text-slate-600 mb-2" />
              <p className="font-semibold text-slate-300">Nenhuma venda realizada até o momento.</p>
              <p className="text-[11px] text-slate-500 mt-1">Conclua o primeiro atendimento na aba 'Novo Atendimento'.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-300 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Código / Data</th>
                    <th className="py-3 px-4">Cliente / Destinatário</th>
                    <th className="py-3 px-4">Forma de Pagamento</th>
                    <th className="py-3 px-4 text-center">Itens Vendidos</th>
                    <th className="py-3 px-4 text-right">Total Geral</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {vendas.map((vnd) => (
                    <tr key={vnd.id} className="hover:bg-slate-950/60 transition">
                      <td className="py-3 px-4">
                        <div className="font-mono font-black text-amber-400">{vnd.codigoVenda}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{vnd.dataVenda} às {vnd.horaVenda}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{vnd.clienteNome}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {vnd.clienteDocumento || 'Consumidor Final'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                          {vnd.formaPagamento === 'DINHEIRO' && <DollarSign className="w-3 h-3 text-emerald-400" />}
                          {vnd.formaPagamento === 'PIX' && <QrCode className="w-3 h-3 text-amber-400" />}
                          {vnd.formaPagamento === 'CARTAO_CREDITO' && <CreditCard className="w-3 h-3 text-blue-400" />}
                          {vnd.formaPagamento === 'BOLETO' && <FileText className="w-3 h-3 text-purple-400" />}
                          <span>{vnd.formaPagamento}</span>
                        </span>
                        {vnd.detalhePagamento && (
                          <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                            {vnd.detalhePagamento}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-bold bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                          {vnd.itens.length} {vnd.itens.length === 1 ? 'item' : 'itens'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="font-mono font-black text-emerald-400 text-sm">
                          {formatCurrency(vnd.valorTotal)}
                        </div>
                        {vnd.valorDesconto > 0 && (
                          <div className="text-[10px] text-red-400 font-mono">
                            Desc: -{formatCurrency(vnd.valorDesconto)}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleReimprimirVenda(vnd)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 text-[11px] font-bold transition flex items-center gap-1 mx-auto"
                          title="Visualizar e Imprimir Cupom Não Fiscal"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cupom</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* MODAL DE COMPROVANTE DE VENDA / CUPOM NÃO FISCAL MFx */}
      {modalCupomAberto && vendaConcluida && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-300 overflow-hidden animate-fadeIn my-6">
            
            {/* Topo do Modal com Ações */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs uppercase tracking-wider">
                  Cupom de Venda Balcão • MFx Industrial
                </span>
              </div>
              <button
                onClick={() => setModalCupomAberto(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Espelho do Cupom Térmico / Recibo */}
            <div className="p-6 space-y-4 font-mono text-xs bg-slate-50/50">
              
              {/* Cabeçalho do Cupom */}
              <div className="text-center border-b border-dashed border-slate-300 pb-3">
                <div className="font-black text-sm tracking-tight text-slate-900">
                  MFx TECNOLOGIA INDUSTRIAL LTDA
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5">
                  CNPJ: 52.148.963/0001-44 • IE: 209.632.131.114
                </div>
                <div className="text-[10px] text-slate-600">
                  Av. das Indústrias, 1450 - Agudos / Bauru - SP
                </div>
                <div className="text-[10px] text-slate-600">
                  Tel: (14) 3104-5000 • WhatsApp: (14) 99712-4488
                </div>
                <div className="text-[11px] font-bold text-slate-800 mt-2 uppercase">
                  COMPROVANTE NÃO FISCAL - VENDA BALCÃO
                </div>
              </div>

              {/* Informações da Venda */}
              <div className="border-b border-dashed border-slate-300 pb-2 text-[11px] space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Documento:</span>
                  <span className="font-bold text-slate-900">{vendaConcluida.codigoVenda}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Emissão:</span>
                  <span>{vendaConcluida.dataVenda} {vendaConcluida.horaVenda}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Operador:</span>
                  <span>{vendaConcluida.operador}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cliente:</span>
                  <span className="font-bold truncate max-w-[220px] text-right">{vendaConcluida.clienteNome}</span>
                </div>
                {vendaConcluida.clienteDocumento && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">CPF/CNPJ:</span>
                    <span>{vendaConcluida.clienteDocumento}</span>
                  </div>
                )}
              </div>

              {/* Lista Discriminada de Itens */}
              <div className="border-b border-dashed border-slate-300 pb-3">
                <div className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 flex justify-between">
                  <span>ITEM / DESCRIÇÃO</span>
                  <span>QTD x UNIT = TOTAL</span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  {vendaConcluida.itens.map((it, idx) => (
                    <div key={idx} className="flex flex-col">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{String(idx + 1).padStart(2, '0')} {it.codigo}</span>
                        <span>{formatCurrency(it.valorTotal)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-600">
                        <span className="truncate max-w-[200px]">{it.descricao}</span>
                        <span>{it.quantidade} {it.unidadeMedida} x {formatCurrency(it.precoUnitario)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totais do Cupom */}
              <div className="border-b border-dashed border-slate-300 pb-2 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal dos Itens:</span>
                  <span className="font-mono">{formatCurrency(vendaConcluida.valorSubtotal)}</span>
                </div>
                {vendaConcluida.valorDesconto > 0 && (
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>Desconto Concedido:</span>
                    <span>- {formatCurrency(vendaConcluida.valorDesconto)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-200">
                  <span>TOTAL PAGO:</span>
                  <span>{formatCurrency(vendaConcluida.valorTotal)}</span>
                </div>
              </div>

              {/* Pagamento e Troco */}
              <div className="border-b border-dashed border-slate-300 pb-2 text-[11px] space-y-0.5">
                <div className="flex justify-between font-bold">
                  <span>Forma de Pagamento:</span>
                  <span>{vendaConcluida.formaPagamento}</span>
                </div>
                {vendaConcluida.detalhePagamento && (
                  <div className="text-[10px] text-slate-600">
                    {vendaConcluida.detalhePagamento}
                  </div>
                )}
                {vendaConcluida.valorRecebido !== undefined && vendaConcluida.formaPagamento === 'DINHEIRO' && (
                  <>
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>Valor Entregue:</span>
                      <span>{formatCurrency(vendaConcluida.valorRecebido)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold text-emerald-700">
                      <span>Troco:</span>
                      <span>{formatCurrency(vendaConcluida.valorTroco || 0)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Rodapé e Mensagem de Agradecimento */}
              <div className="text-center text-[10px] text-slate-500 pt-1">
                <div>Obrigado pela preferência!</div>
                <div>Garantia técnica conforme Código de Defesa do Consumidor.</div>
                <div className="mt-1 font-mono text-[9px] text-slate-400">
                  MFx ERP v2.6.4 • Automação e Corte Industrial
                </div>
              </div>

            </div>

            {/* Botões do Rodapé do Modal */}
            <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Cupom / Salvar PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setModalCupomAberto(false);
                  setTabAtiva('caixa');
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Venda</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
