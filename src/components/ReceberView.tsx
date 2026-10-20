import React, { useState, useMemo } from 'react';
import { ContaReceber, FormaPagamento, StatusContaReceber, OrdemServico, Venda } from '../types';
import { formatCurrency } from '../utils/formatters';
import { 
  ArrowDownLeft, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Receipt, 
  CreditCard, 
  QrCode, 
  Banknote, 
  FileText, 
  Filter, 
  X,
  Building,
  Calendar,
  Layers,
  ArrowUpRight,
  Wallet
} from 'lucide-react';

interface ReceberViewProps {
  contas: ContaReceber[];
  ordens?: OrdemServico[];
  vendas?: Venda[];
  onDarBaixa: (id: string, formaPagamento: FormaPagamento, dataBaixa: string, observacoes?: string) => void;
  onAdicionarConta: (conta: ContaReceber) => void;
  onIrParaPagar: () => void;
  onIrParaCaixa: () => void;
}

export const ReceberView: React.FC<ReceberViewProps> = ({
  contas,
  onDarBaixa,
  onAdicionarConta,
  onIrParaPagar,
  onIrParaCaixa,
}) => {
  // Filtros
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'PENDENTES' | 'PAGOS'>('TODOS');
  const [busca, setBusca] = useState('');

  // Modal de Baixa
  const [contaSelecionadaBaixa, setContaSelecionadaBaixa] = useState<ContaReceber | null>(null);
  const [formaBaixa, setFormaBaixa] = useState<FormaPagamento>('PIX');
  const [dataBaixa, setDataBaixa] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [obsBaixa, setObsBaixa] = useState<string>('');

  // Modal de Novo Título Manual
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [novoCliente, setNovoCliente] = useState('');
  const [novoDoc, setNovoDoc] = useState('');
  const [novaOrigem, setNovaOrigem] = useState<'OS' | 'PDV' | 'COTACAO' | 'MANUAL'>('COTACAO');
  const [novoNumero, setNovoNumero] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [novoVencimento, setNovoVencimento] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [novaObs, setNovaObs] = useState('');

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const exibirToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Resumo de Indicadores
  const indicadores = useMemo(() => {
    let pendenteValor = 0;
    let pendenteQtd = 0;
    let recebidoValor = 0;
    let recebidoQtd = 0;

    contas.forEach((c) => {
      if (c.status === 'Pendente') {
        pendenteValor += c.valorTotal;
        pendenteQtd++;
      } else if (c.status === 'Pago') {
        recebidoValor += c.valorTotal;
        recebidoQtd++;
      }
    });

    const totalPrevisto = pendenteValor + recebidoValor;

    return {
      pendenteValor,
      pendenteQtd,
      recebidoValor,
      recebidoQtd,
      totalPrevisto,
    };
  }, [contas]);

  // Contas filtradas
  const contasFiltradas = useMemo(() => {
    return contas.filter((item) => {
      // Filtro status
      if (filtroStatus === 'PENDENTES' && item.status !== 'Pendente') return false;
      if (filtroStatus === 'PAGOS' && item.status !== 'Pago') return false;

      // Filtro busca
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const noCliente = item.cliente.toLowerCase().includes(termo);
        const noNumero = item.origemNumero.toLowerCase().includes(termo);
        const noDoc = item.clienteDocumento ? item.clienteDocumento.includes(termo) : false;
        return noCliente || noNumero || noDoc;
      }

      return true;
    });
  }, [contas, filtroStatus, busca]);

  // Handler de Baixa
  const handleConfirmarBaixa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contaSelecionadaBaixa) return;

    onDarBaixa(
      contaSelecionadaBaixa.id,
      formaBaixa,
      dataBaixa,
      obsBaixa.trim() || undefined
    );

    exibirToast(`Baixa confirmada! ${formatCurrency(contaSelecionadaBaixa.valorTotal)} creditado no Caixa Geral.`);
    setContaSelecionadaBaixa(null);
    setObsBaixa('');
  };

  // Handler de Criação de Título
  const handleCriarTitulo = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(novoValor.replace(',', '.'));
    if (!novoCliente.trim() || !val || val <= 0) {
      alert('Preencha o nome do cliente e um valor válido.');
      return;
    }

    const hoje = new Date().toISOString().split('T')[0];
    const novaConta: ContaReceber = {
      id: `rec-${Date.now()}`,
      cliente: novoCliente.trim(),
      clienteDocumento: novoDoc.trim() || undefined,
      origemTipo: novaOrigem,
      origemNumero: novoNumero.trim() || `${novaOrigem} #${Date.now().toString().slice(-4)}`,
      valorTotal: val,
      dataLancamento: hoje,
      dataVencimento: novoVencimento || hoje,
      status: 'Pendente',
      observacoes: novaObs.trim() || undefined,
    };

    onAdicionarConta(novaConta);
    exibirToast('Novo título a receber cadastrado com sucesso!');
    setModalNovoAberto(false);
    setNovoCliente('');
    setNovoDoc('');
    setNovoNumero('');
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
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
            title="Contas a Receber"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Contas a Receber</span>
          </button>

          <button
            onClick={onIrParaPagar}
            className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Contas a Pagar"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />
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
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>+ Novo Título a Receber</span>
        </button>
      </div>

      {/* Cabeçalho Limpo e Minimalista */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-mono">
              FINANCEIRO • ENTRADAS
            </span>
            <span className="text-xs text-slate-400">MFx Tecnologia Industrial</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Contas a Receber
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Conexão direta de Ordens de Serviço faturadas, vendas de balcão (PDV) e cotações aprovadas.
          </p>
        </div>

        {/* Resumo em Cards Finos no Topo */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full sm:w-auto">
          {/* Card 1: Total A Receber */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 min-w-[150px]">
            <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              <span>Total a Receber</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded font-mono">
                {indicadores.pendenteQtd} pend.
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-amber-600 mt-1">
              {formatCurrency(indicadores.pendenteValor)}
            </div>
          </div>

          {/* Card 2: Total Recebido */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 min-w-[150px]">
            <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              <span>Total Recebido</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded font-mono">
                {indicadores.recebidoQtd} pagos
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-emerald-600 mt-1">
              {formatCurrency(indicadores.recebidoValor)}
            </div>
          </div>

          {/* Card 3: Total Geral */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 min-w-[150px] col-span-2 sm:col-span-1">
            <div className="text-[11px] font-medium text-slate-500">
              Total Faturado
            </div>
            <div className="text-lg font-bold font-mono text-slate-900 mt-1">
              {formatCurrency(indicadores.totalPrevisto)}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros Limpos e Busca */}
      <div className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filtros de Status Sutis */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
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
            onClick={() => setFiltroStatus('PENDENTES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filtroStatus === 'PENDENTES'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Pendentes</span>
            <span className="text-[10px] font-mono font-bold bg-amber-500/30 px-1.5 py-0.2 rounded text-white">
              {indicadores.pendenteQtd}
            </span>
          </button>

          <button
            onClick={() => setFiltroStatus('PAGOS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filtroStatus === 'PAGOS'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Recebidos</span>
            <span className="text-[10px] font-mono font-bold bg-emerald-500/30 px-1.5 py-0.2 rounded text-white">
              {indicadores.recebidoQtd}
            </span>
          </button>
        </div>

        {/* Campo de Busca Rápida */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por cliente, OS ou valor..."
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

      {/* Tabela de Contas a Receber */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Origem</th>
                <th className="py-3 px-4 text-right">Valor Total</th>
                <th className="py-3 px-4">Vencimento</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    Nenhum título encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                contasFiltradas.map((conta) => {
                  const isPendente = conta.status === 'Pendente';
                  const isPago = conta.status === 'Pago';

                  return (
                    <tr 
                      key={conta.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Cliente */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900 leading-snug">
                          {conta.cliente}
                        </div>
                        {conta.clienteDocumento && (
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {conta.clienteDocumento}
                          </div>
                        )}
                      </td>

                      {/* Origem */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded">
                          <Receipt className="w-3 h-3 text-slate-500" />
                          <span>{conta.origemNumero}</span>
                        </div>
                        {conta.observacoes && (
                          <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs" title={conta.observacoes}>
                            {conta.observacoes}
                          </div>
                        )}
                      </td>

                      {/* Valor Total */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-slate-900">
                        {formatCurrency(conta.valorTotal)}
                      </td>

                      {/* Vencimento */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 font-medium flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(conta.dataVencimento + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                        </div>
                        {conta.dataBaixa && (
                          <div className="text-[10px] text-emerald-600 mt-0.5">
                            Baixado em: {new Date(conta.dataBaixa + 'T12:00:00').toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isPendente && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Pendente
                          </span>
                        )}
                        {isPago && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Pago ({conta.formaPagamento || 'PIX'})
                          </span>
                        )}
                      </td>

                      {/* Ação: Botão Inteligente de Baixa */}
                      <td className="py-3.5 px-4 text-right">
                        {isPendente ? (
                          <button
                            onClick={() => {
                              setContaSelecionadaBaixa(conta);
                              setDataBaixa(new Date().toISOString().split('T')[0]);
                              setObsBaixa('');
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                            title="Confirmar recebimento do valor"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Dar Baixa</span>
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

      {/* MODAL INTELIGENTE DE BAIXA / CONFIRMAR RECEBIMENTO */}
      {contaSelecionadaBaixa && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Confirmar Recebimento (Baixa)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {contaSelecionadaBaixa.origemNumero}
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

            <form onSubmit={handleConfirmarBaixa} className="mt-4 space-y-4">
              {/* Resumo do Título */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Cliente:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[240px]">
                    {contaSelecionadaBaixa.cliente}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500 font-medium">Valor a Receber:</span>
                  <span className="font-mono text-base font-bold text-emerald-600">
                    {formatCurrency(contaSelecionadaBaixa.valorTotal)}
                  </span>
                </div>
              </div>

              {/* Forma de Pagamento */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Forma de Pagamento:
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
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        {labels[forma]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Data da Baixa */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data do Recebimento:
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
              <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  O valor será creditado automaticamente no <strong>Caixa Geral</strong> com histórico detalhado.
                </span>
              </div>

              {/* Observação Opcional */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Observações da Quitação (opcional):
                </label>
                <input
                  type="text"
                  value={obsBaixa}
                  onChange={(e) => setObsBaixa(e.target.value)}
                  placeholder="Ex: Comprovante enviado via WhatsApp"
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-2xs"
                >
                  Confirmar Recebimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE NOVO TÍTULO A RECEBER */}
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
                    Novo Título a Receber
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Lançamento de cotação aprovada, duplicata ou recebível manual
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

            <form onSubmit={handleCriarTitulo} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cliente / Razão Social: *
                </label>
                <input
                  type="text"
                  value={novoCliente}
                  onChange={(e) => setNovoCliente(e.target.value)}
                  placeholder="Nome do cliente ou empresa"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-slate-50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    CNPJ ou CPF:
                  </label>
                  <input
                    type="text"
                    value={novoDoc}
                    onChange={(e) => setNovoDoc(e.target.value)}
                    placeholder="00.000.000/0000-00"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Origem do Lançamento:
                  </label>
                  <select
                    value={novaOrigem}
                    onChange={(e) => setNovaOrigem(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-slate-50"
                  >
                    <option value="COTACAO">Cotação / Orçamento</option>
                    <option value="OS">Ordem de Serviço (OS)</option>
                    <option value="PDV">Venda PDV / Balcão</option>
                    <option value="MANUAL">Duplicata / Contrato Manual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nº do Documento / Cotação:
                  </label>
                  <input
                    type="text"
                    value={novoNumero}
                    onChange={(e) => setNovoNumero(e.target.value)}
                    placeholder="Ex: Cotação #2026-0091"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Valor Total (R$): *
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

              <div>
                <label className="block font-medium text-slate-600 mb-1">
                  Descrição / Observações:
                </label>
                <input
                  type="text"
                  value={novaObs}
                  onChange={(e) => setNovaObs(e.target.value)}
                  placeholder="Ex: 50% de entrada na aprovação do projeto"
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
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition shadow-2xs"
                >
                  Salvar Título
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
