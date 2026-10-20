import React, { useState, useMemo } from 'react';
import { MovimentoCaixa, FormaPagamento } from '../types';
import { formatCurrency } from '../utils/formatters';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  TrendingUp, 
  Receipt, 
  Plus, 
  Clock, 
  Calendar, 
  Filter, 
  CreditCard, 
  QrCode, 
  ShoppingCart,
  FileSpreadsheet
} from 'lucide-react';

interface FinanceiroViewProps {
  movimentos: MovimentoCaixa[];
  onAdicionarMovimento: (novoMovimento: MovimentoCaixa) => void;
  onIrParaPdv: () => void;
  onIrParaReceber?: () => void;
  onIrParaPagar?: () => void;
}

export const FinanceiroView: React.FC<FinanceiroViewProps> = ({
  movimentos,
  onAdicionarMovimento,
  onIrParaPdv,
  onIrParaReceber,
  onIrParaPagar,
}) => {
  const [filtroOrigem, setFiltroOrigem] = useState<string>('TODOS');
  const [modalSuprimentoAberto, setModalSuprimentoAberto] = useState(false);
  const [tipoLancamento, setTipoLancamento] = useState<'ENTRADA' | 'SAIDA'>('ENTRADA');
  const [descricaoLancamento, setDescricaoLancamento] = useState('');
  const [valorLancamento, setValorLancamento] = useState('');
  const [formaLancamento, setFormaLancamento] = useState<FormaPagamento>('DINHEIRO');

  // Cálculos financeiros
  const totais = useMemo(() => {
    let entradas = 0;
    let saidas = 0;

    movimentos.forEach((m) => {
      if (m.tipo === 'ENTRADA') entradas += m.valor;
      else if (m.tipo === 'SAIDA') saidas += m.valor;
    });

    const saldoAtual = entradas - saidas;
    return { entradas, saidas, saldoAtual };
  }, [movimentos]);

  const movimentosFiltrados = useMemo(() => {
    if (filtroOrigem === 'TODOS') return movimentos;
    return movimentos.filter((m) => m.origem === filtroOrigem);
  }, [movimentos, filtroOrigem]);

  const handleSalvarLancamento = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(valorLancamento);
    if (!val || val <= 0 || !descricaoLancamento.trim()) {
      alert('Informe uma descrição e um valor válido.');
      return;
    }

    const agora = new Date();
    const dataHora = `${agora.toISOString().split('T')[0]} ${agora.toTimeString().split(' ')[0].substring(0, 5)}`;

    const novo: MovimentoCaixa = {
      id: `mov-${Date.now()}`,
      tipo: tipoLancamento,
      origem: 'MANUAL',
      descricao: descricaoLancamento.trim(),
      formaPagamento: formaLancamento,
      valor: val,
      dataHora,
      operador: 'ADM - MEDRADE',
    };

    onAdicionarMovimento(novo);
    setModalSuprimentoAberto(false);
    setDescricaoLancamento('');
    setValorLancamento('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Switcher Navigation: Receber / Pagar / Caixa */}
      <div className="bg-white rounded-xl p-2 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {onIrParaReceber && (
            <button
              onClick={onIrParaReceber}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="Ir para Contas a Receber"
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
              <span>Contas a Receber</span>
            </button>
          )}

          {onIrParaPagar && (
            <button
              onClick={onIrParaPagar}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="Ir para Contas a Pagar"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />
              <span>Contas a Pagar</span>
            </button>
          )}

          <button
            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
            title="Fluxo de Caixa Geral"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Fluxo de Caixa</span>
          </button>
        </div>

        <button
          onClick={onIrParaPdv}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer ml-auto"
          title="Ir para PDV / Vendas"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>PDV / Vendas</span>
        </button>
      </div>

      {/* Cabeçalho do Módulo Financeiro */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-slate-950 font-black shadow-md text-xl">
              <i className="fa-solid fa-hand-holding-dollar"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-mono">
                  MÓDULO FINANCEIRO & CAIXA
                </span>
                <span className="text-xs text-slate-400 font-medium">| MFx Tecnologia Industrial</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                Controle de Caixa & Fluxo Financeiro
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Recebimentos automáticos de vendas de balcão (PDV), faturamento de OS e controle de caixa operacional.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalSuprimentoAberto(true)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition flex items-center gap-1.5 border border-slate-700 shadow cursor-pointer"
              title="Novo Lançamento Manual no Caixa"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>+ Novo Lançamento</span>
            </button>

            <button
              onClick={onIrParaPdv}
              className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow cursor-pointer"
              title="Acessar Ponto de Venda"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>PDV / Vendas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Saldo e Indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Saldo Atual em Caixa</span>
            <Wallet className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {formatCurrency(totais.saldoAtual)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Caixa Operacional MFx • Conciliação Ativa
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Entradas / Recebimentos</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-300">
            {formatCurrency(totais.entradas)}
          </div>
          <div className="text-[11px] text-emerald-500/80 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Vendas PDV e Ordens de Serviço</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Saídas / Despesas</span>
            <ArrowUpRight className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black font-mono text-red-400">
            {formatCurrency(totais.saidas)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Pagamentos e sangrias registradas
          </div>
        </div>

      </div>

      {/* Tabela de Movimentações */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-list-check text-amber-500"></i>
              Extrato de Movimentações Financeiras ({movimentosFiltrados.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Histórico detalhado de entradas e saídas com identificação de origem e operador.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 text-[10px] uppercase font-bold px-2">Filtro:</span>
            {['TODOS', 'PDV', 'OS', 'MANUAL'].map((orig) => (
              <button
                key={orig}
                onClick={() => setFiltroOrigem(orig)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                  filtroOrigem === orig
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {orig === 'TODOS' ? 'Todos' : orig}
              </button>
            ))}
          </div>
        </div>

        {movimentosFiltrados.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <Receipt className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-slate-300">Nenhuma movimentação para o filtro selecionado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-300 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Data / Hora</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Origem</th>
                  <th className="py-3 px-4">Descrição do Lançamento</th>
                  <th className="py-3 px-4">Forma</th>
                  <th className="py-3 px-4 text-right">Valor (R$)</th>
                  <th className="py-3 px-4 text-center">Operador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {movimentosFiltrados.map((mov) => {
                  const isEntrada = mov.tipo === 'ENTRADA';
                  return (
                    <tr key={mov.id} className="hover:bg-slate-950/60 transition">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {mov.dataHora}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded font-mono ${
                          isEntrada
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : 'bg-red-950 text-red-400 border border-red-800/60'
                        }`}>
                          {isEntrada ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {mov.tipo}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-slate-300">
                          {mov.origem}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-white">
                        {mov.descricao}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] text-slate-400">
                          {mov.formaPagamento}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-mono font-black text-sm ${
                        isEntrada ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {isEntrada ? '+' : '-'} {formatCurrency(mov.valor)}
                      </td>
                      <td className="py-3 px-4 text-center text-[10px] font-mono text-slate-500">
                        {mov.operador}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Modal de Lançamento Manual / Suprimento / Sangria */}
      {modalSuprimentoAberto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-fadeIn">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Novo Lançamento no Caixa</span>
              </h3>
              <button
                onClick={() => setModalSuprimentoAberto(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarLancamento} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Tipo de Movimentação
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipoLancamento('ENTRADA')}
                    className={`p-2 rounded-lg font-bold border transition ${
                      tipoLancamento === 'ENTRADA'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    + Entrada / Suprimento
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoLancamento('SAIDA')}
                    className={`p-2 rounded-lg font-bold border transition ${
                      tipoLancamento === 'SAIDA'
                        ? 'bg-red-500 text-white border-red-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    - Saída / Sangria
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Descrição do Lançamento
                </label>
                <input
                  type="text"
                  required
                  value={descricaoLancamento}
                  onChange={(e) => setDescricaoLancamento(e.target.value)}
                  placeholder="Ex: Suprimento inicial de troco, Pagamento de frete, etc."
                  className="w-full bg-slate-950 text-white rounded px-3 py-2 border border-slate-700 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={valorLancamento}
                    onChange={(e) => setValorLancamento(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-950 text-white rounded px-3 py-2 border border-slate-700 focus:border-amber-500 focus:outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Forma
                  </label>
                  <select
                    value={formaLancamento}
                    onChange={(e) => setFormaLancamento(e.target.value as FormaPagamento)}
                    className="w-full bg-slate-950 text-white rounded px-3 py-2 border border-slate-700 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="DINHEIRO">Dinheiro</option>
                    <option value="PIX">PIX</option>
                    <option value="CARTAO_DEBITO">Cartão Débito</option>
                    <option value="CARTAO_CREDITO">Cartão Crédito</option>
                    <option value="BOLETO">Boleto</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalSuprimentoAberto(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-black"
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
