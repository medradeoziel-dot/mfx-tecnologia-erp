import React, { useState, useMemo } from 'react';
import { ContaPagar, CategoriaDespesa, FormaPagamento, StatusContaPagar, Compra } from '../types';
import { formatCurrency } from '../utils/formatters';
import { 
  ArrowUpRight, 
  Search, 
  Plus, 
  CheckCircle2, 
  Receipt, 
  Wallet, 
  Calendar, 
  X, 
  ArrowDownLeft, 
  Building2, 
  Tag, 
  Check,
  CreditCard
} from 'lucide-react';

interface PagarViewProps {
  contas: ContaPagar[];
  compras?: Compra[];
  onDarBaixa: (id: string, formaPagamento: FormaPagamento, contaSaida: string, dataBaixa: string, observacoes?: string) => void;
  onAdicionarConta: (conta: ContaPagar) => void;
  onIrParaReceber: () => void;
  onIrParaCaixa: () => void;
}

const CATEGORIAS_PADRAO: CategoriaDespesa[] = [
  'Insumos / Matéria-Prima',
  'Aluguel',
  'Energia / Água',
  'Frete / Logística',
  'Peças de Reposição',
  'Folha / Pró-labore',
  'Manutenção',
  'Impostos / Taxas',
  'Outros',
];

export const PagarView: React.FC<PagarViewProps> = ({
  contas,
  onDarBaixa,
  onAdicionarConta,
  onIrParaReceber,
  onIrParaCaixa,
}) => {
  // Filtros
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'A_PAGAR' | 'PAGOS'>('TODOS');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [busca, setBusca] = useState('');

  // Modal de Baixa / Liquidação
  const [contaSelecionadaBaixa, setContaSelecionadaBaixa] = useState<ContaPagar | null>(null);
  const [formaBaixa, setFormaBaixa] = useState<FormaPagamento>('PIX');
  const [contaSaida, setContaSaida] = useState<string>('Banco Principal / PIX MFx');
  const [dataBaixa, setDataBaixa] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [obsBaixa, setObsBaixa] = useState<string>('');

  // Modal de Nova Despesa Manual
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [novoFornecedor, setNovoFornecedor] = useState('');
  const [novaCategoria, setNovaCategoria] = useState<CategoriaDespesa>('Aluguel');
  const [novoDoc, setNovoDoc] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [novoVencimento, setNovoVencimento] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split('T')[0];
  });
  const [novaObs, setNovaObs] = useState('');

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const exibirToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Indicadores do Topo
  const indicadores = useMemo(() => {
    let aPagarValor = 0;
    let aPagarQtd = 0;
    let pagoValor = 0;
    let pagoQtd = 0;

    contas.forEach((c) => {
      if (c.status === 'A Pagar') {
        aPagarValor += c.valor;
        aPagarQtd++;
      } else if (c.status === 'Pago') {
        pagoValor += c.valor;
        pagoQtd++;
      }
    });

    const totalGeral = aPagarValor + pagoValor;

    return {
      aPagarValor,
      aPagarQtd,
      pagoValor,
      pagoQtd,
      totalGeral,
    };
  }, [contas]);

  // Contas Filtradas
  const contasFiltradas = useMemo(() => {
    return contas.filter((item) => {
      // Status
      if (filtroStatus === 'A_PAGAR' && item.status !== 'A Pagar') return false;
      if (filtroStatus === 'PAGOS' && item.status !== 'Pago') return false;

      // Categoria
      if (filtroCategoria !== 'TODAS' && item.categoria !== filtroCategoria) return false;

      // Busca
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const noForn = item.fornecedorOuDespesa.toLowerCase().includes(termo);
        const noNum = item.origemNumero ? item.origemNumero.toLowerCase().includes(termo) : false;
        const noCat = item.categoria.toLowerCase().includes(termo);
        return noForn || noNum || noCat;
      }

      return true;
    });
  }, [contas, filtroStatus, filtroCategoria, busca]);

  // Handler de Baixa / Liquidação
  const handleConfirmarLiquidacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contaSelecionadaBaixa) return;

    onDarBaixa(
      contaSelecionadaBaixa.id,
      formaBaixa,
      contaSaida,
      dataBaixa,
      obsBaixa.trim() || undefined
    );

    exibirToast(`Pagamento liquidado! ${formatCurrency(contaSelecionadaBaixa.valor)} debitado no Caixa Geral.`);
    setContaSelecionadaBaixa(null);
    setObsBaixa('');
  };

  // Handler de Criação de Despesa
  const handleCriarDespesa = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(novoValor.replace(',', '.'));
    if (!novoFornecedor.trim() || !val || val <= 0) {
      alert('Preencha o favorecido/fornecedor e um valor válido.');
      return;
    }

    const hoje = new Date().toISOString().split('T')[0];
    const novaConta: ContaPagar = {
      id: `pag-${Date.now()}`,
      fornecedorOuDespesa: novoFornecedor.trim(),
      categoria: novaCategoria,
      origemTipo: 'MANUAL',
      origemNumero: novoDoc.trim() || `DESP #${Date.now().toString().slice(-4)}`,
      valor: val,
      dataLancamento: hoje,
      dataVencimento: novoVencimento || hoje,
      status: 'A Pagar',
      observacoes: novaObs.trim() || undefined,
    };

    onAdicionarConta(novaConta);
    exibirToast('Despesa lançada com sucesso em Contas a Pagar!');
    setModalNovoAberto(false);
    setNovoFornecedor('');
    setNovoDoc('');
    setNovoValor('');
    setNovaObs('');
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12 font-sans">
      
      {/* Toast Notificação */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-medium flex items-center gap-2.5 border border-slate-700 animate-fadeIn">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
            ✓
          </div>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Switcher Navigation: Receber / Pagar / Caixa */}
      <div className="bg-white rounded-xl p-2 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onIrParaReceber}
            className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Contas a Receber"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
            <span>Contas a Receber</span>
          </button>

          <button
            className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
            title="Contas a Pagar"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Contas a Pagar</span>
          </button>

          <button
            onClick={onIrParaCaixa}
            className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5 text-slate-500" />
            <span>Fluxo de Caixa Geral</span>
          </button>
        </div>

        <button
          onClick={() => setModalNovoAberto(true)}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-2xs transition cursor-pointer ml-auto"
        >
          <Plus className="w-3.5 h-3.5 text-red-400" />
          <span>+ Nova Despesa a Pagar</span>
        </button>
      </div>

      {/* Cabeçalho Limpo e Minimalista */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-mono">
              FINANCEIRO • SAÍDAS
            </span>
            <span className="text-xs text-slate-400">MFx Tecnologia Industrial</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Contas a Pagar & Despesas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Conexão automática de compras de insumos e controle de despesas operacionais (aluguel, energia, fretes).
          </p>
        </div>

        {/* Resumo em Cards Finos no Topo */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full sm:w-auto">
          {/* Card 1: Total A Pagar */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 min-w-[150px]">
            <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              <span>Total a Pagar</span>
              <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded font-mono">
                {indicadores.aPagarQtd} pend.
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-red-600 mt-1">
              {formatCurrency(indicadores.aPagarValor)}
            </div>
          </div>

          {/* Card 2: Total Pago */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 min-w-[150px]">
            <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              <span>Total Quitado</span>
              <span className="text-[10px] bg-slate-200 text-slate-800 font-bold px-1.5 py-0.2 rounded font-mono">
                {indicadores.pagoQtd} pagos
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-slate-800 mt-1">
              {formatCurrency(indicadores.pagoValor)}
            </div>
          </div>

          {/* Card 3: Total Geral */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 min-w-[150px] col-span-2 sm:col-span-1">
            <div className="text-[11px] font-medium text-slate-500">
              Total de Despesas
            </div>
            <div className="text-lg font-bold font-mono text-slate-900 mt-1">
              {formatCurrency(indicadores.totalGeral)}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros Limpos e Busca */}
      <div className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filtros de Status Sutis */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto flex-wrap">
          <button
            onClick={() => setFiltroStatus('TODOS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filtroStatus === 'TODOS'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos ({contas.length})
          </button>

          <button
            onClick={() => setFiltroStatus('A_PAGAR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filtroStatus === 'A_PAGAR'
                ? 'bg-red-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>A Pagar</span>
            <span className="text-[10px] font-mono font-bold bg-red-500/30 px-1.5 py-0.2 rounded text-white">
              {indicadores.aPagarQtd}
            </span>
          </button>

          <button
            onClick={() => setFiltroStatus('PAGOS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filtroStatus === 'PAGOS'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Pagos / Quitados</span>
            <span className="text-[10px] font-mono font-bold bg-slate-700/30 px-1.5 py-0.2 rounded text-white">
              {indicadores.pagoQtd}
            </span>
          </button>

          {/* Filtro por Categoria */}
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-slate-400"
          >
            <option value="TODAS">Todas as Categorias</option>
            {CATEGORIAS_PADRAO.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Campo de Busca Rápida */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar fornecedor, despesa..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition"
          />
          {busca && (
            <button
              onClick={() => setBusca('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Tabela de Contas a Pagar */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Fornecedor / Despesa</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4 text-right">Valor</th>
                <th className="py-3 px-4">Data Vencimento</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    Nenhuma conta a pagar encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                contasFiltradas.map((conta) => {
                  const isAPagar = conta.status === 'A Pagar';
                  const isPago = conta.status === 'Pago';

                  return (
                    <tr 
                      key={conta.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Fornecedor / Despesa */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900 leading-snug">
                          {conta.fornecedorOuDespesa}
                        </div>
                        {conta.origemNumero && (
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                            <Receipt className="w-3 h-3 text-slate-400" />
                            <span>{conta.origemNumero}</span>
                          </div>
                        )}
                      </td>

                      {/* Categoria */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded">
                          {conta.categoria}
                        </span>
                        {conta.observacoes && (
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs" title={conta.observacoes}>
                            {conta.observacoes}
                          </div>
                        )}
                      </td>

                      {/* Valor */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-slate-900">
                        {formatCurrency(conta.valor)}
                      </td>

                      {/* Vencimento */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 font-medium flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(conta.dataVencimento + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                        </div>
                        {conta.dataBaixa && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Quitado em: {new Date(conta.dataBaixa + 'T12:00:00').toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isAPagar && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            A Pagar
                          </span>
                        )}
                        {isPago && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                            Pago ({conta.contaSaida || conta.formaPagamento || 'PIX'})
                          </span>
                        )}
                      </td>

                      {/* Ação: Botão Inteligente de Baixa */}
                      <td className="py-3.5 px-4 text-right">
                        {isAPagar ? (
                          <button
                            onClick={() => {
                              setContaSelecionadaBaixa(conta);
                              setDataBaixa(new Date().toISOString().split('T')[0]);
                              setObsBaixa('');
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                            title="Liquidar e dar baixa no pagamento"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Liquidar</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Liquidado
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL INTELIGENTE DE LIQUIDAÇÃO / BAIXA DO PAGAMENTO */}
      {contaSelecionadaBaixa && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Liquidar Pagamento (Baixa)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {contaSelecionadaBaixa.categoria}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setContaSelecionadaBaixa(null)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmarLiquidacao} className="mt-4 space-y-4">
              {/* Resumo da Conta */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Favorecido:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[240px]">
                    {contaSelecionadaBaixa.fornecedorOuDespesa}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500 font-medium">Valor a Liquidar:</span>
                  <span className="font-mono text-base font-bold text-red-600">
                    {formatCurrency(contaSelecionadaBaixa.valor)}
                  </span>
                </div>
              </div>

              {/* Conta de Saída / Origem dos Recursos */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Conta de Saída / Origem dos Recursos:
                </label>
                <select
                  value={contaSaida}
                  onChange={(e) => setContaSaida(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-slate-50 font-medium"
                >
                  <option value="Banco Principal / PIX MFx">Banco Itaú (PIX Chave MFx)</option>
                  <option value="Conta Corrente PJ">Conta Corrente Banco do Brasil</option>
                  <option value="Caixa Interno Operacional">Caixa Interno em Espécie</option>
                  <option value="Cartão de Crédito Corporativo">Cartão de Crédito Corporativo MFx</option>
                </select>
              </div>

              {/* Forma de Pagamento */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Método de Quitação:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['PIX', 'BOLETO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'DINHEIRO'] as FormaPagamento[]).map((forma) => {
                    const ativo = formaBaixa === forma;
                    const labels: Record<FormaPagamento, string> = {
                      PIX: 'PIX',
                      BOLETO: 'Boleto',
                      CARTAO_CREDITO: 'Crédito',
                      CARTAO_DEBITO: 'Débito',
                      DINHEIRO: 'Dinheiro',
                    };
                    return (
                      <button
                        key={forma}
                        type="button"
                        onClick={() => setFormaBaixa(forma)}
                        className={`py-2 px-2 rounded-lg border text-xs font-medium transition cursor-pointer text-center ${
                          ativo
                            ? 'bg-red-50 border-red-500 text-red-800 font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        {labels[forma]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Data da Quitação */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data da Quitação:
                </label>
                <input
                  type="date"
                  value={dataBaixa}
                  onChange={(e) => setDataBaixa(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-slate-50"
                  required
                />
              </div>

              {/* Destino do Caixa */}
              <div className="p-2.5 rounded-lg bg-red-50/60 border border-red-200 text-[11px] text-red-800 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  O valor será registrado como <strong>SAÍDA</strong> no Caixa Geral do sistema.
                </span>
              </div>

              {/* Observação Opcional */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Observações / Autenticação Bancária (opcional):
                </label>
                <input
                  type="text"
                  value={obsBaixa}
                  onChange={(e) => setObsBaixa(e.target.value)}
                  placeholder="Ex: Autenticação internet banking Itaú 982173"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                />
              </div>

              {/* Ações */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setContaSelecionadaBaixa(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition shadow-2xs"
                >
                  Confirmar Quitação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE NOVA DESPESA MANUAL */}
      {modalNovoAberto && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Nova Despesa / Conta a Pagar
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Cadastrar despesa fixa, fornecedor ou custo operacional
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalNovoAberto(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCriarDespesa} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Fornecedor / Favorecido: *
                </label>
                <input
                  type="text"
                  value={novoFornecedor}
                  onChange={(e) => setNovoFornecedor(e.target.value)}
                  placeholder="Ex: CPFL Paulista, Imobiliária, Transportadora"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-slate-50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Categoria da Despesa:
                  </label>
                  <select
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value as CategoriaDespesa)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-slate-50 font-medium"
                  >
                    {CATEGORIAS_PADRAO.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nº do Documento / Fatura:
                  </label>
                  <input
                    type="text"
                    value={novoDoc}
                    onChange={(e) => setNovoDoc(e.target.value)}
                    placeholder="Ex: Boleto 8920, NF-e 104"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Valor (R$): *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={novoValor}
                    onChange={(e) => setNovoValor(e.target.value)}
                    placeholder="0,00"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 font-mono font-bold text-slate-900 bg-slate-50"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Data de Vencimento: *
                  </label>
                  <input
                    type="date"
                    value={novoVencimento}
                    onChange={(e) => setNovoVencimento(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-slate-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">
                  Descrição / Observações:
                </label>
                <input
                  type="text"
                  value={novaObs}
                  onChange={(e) => setNovaObs(e.target.value)}
                  placeholder="Ex: Mensalidade aluguel galpão industrial Agudos"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-slate-50"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNovoAberto(false)}
                  className="px-3.5 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition shadow-2xs"
                >
                  Lançar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
