import React, { useState, useEffect, useRef } from 'react';
import { Compra, ItemCompra, ItemEstoque } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  PackagePlus, 
  Calendar, 
  Receipt, 
  Building2, 
  CheckCircle2, 
  FileText, 
  History, 
  Boxes, 
  Layers,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface ComprasViewProps {
  produtosEstoque: ItemEstoque[];
  onAtualizarEstoque: (atualizacoes: { codigo: string; quantidade: number; novoCusto?: number }[]) => void;
  compras: Compra[];
  onSalvarCompra: (novaCompra: Compra) => void;
  onIrParaEstoque: () => void;
}

// Cria uma linha 100% limpa / zerada
const criarItemEmBranco = (): ItemCompra => ({
  id: `it-cmp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  produtoId: '',
  codigo: '',
  descricao: '',
  categoria: 'Consumíveis',
  unidadeMedida: 'UN',
  quantidade: '' as unknown as number,
  precoCustoUnitario: '' as unknown as number,
  valorTotal: 0,
});

export const ComprasView: React.FC<ComprasViewProps> = ({
  produtosEstoque,
  onAtualizarEstoque,
  compras,
  onSalvarCompra,
  onIrParaEstoque,
}) => {
  // Filtra apenas produtos físicos (exclui serviços de mão de obra)
  const produtosFisicos = produtosEstoque.filter((p) => p.tipo === 'produto');

  // Estado da Guia Ativa: 'novo' ou 'historico'
  const [tabAtiva, setTabAtiva] = useState<'novo' | 'historico'>('novo');

  // Ref para auto-foco
  const fornecedorInputRef = useRef<HTMLInputElement>(null);

  // Dados do Cabeçalho da Compra (iniciam 100% limpos)
  const [fornecedor, setFornecedor] = useState('');
  const [numeroNota, setNumeroNota] = useState('');
  const [dataCompra, setDataCompra] = useState(() => new Date().toISOString().split('T')[0]);
  const [observacoes, setObservacoes] = useState('');

  // Itens da Compra: inicia com 1 linha completamente limpa / zerada
  const [itens, setItens] = useState<ItemCompra[]>([criarItemEmBranco()]);

  // Mensagem de Feedback
  const [sucessoMsg, setSucessoMsg] = useState<string | null>(null);

  // Foco automático ao abrir ou alternar para a guia de novo lançamento
  useEffect(() => {
    if (tabAtiva === 'novo') {
      setTimeout(() => {
        fornecedorInputRef.current?.focus();
      }, 80);
    }
  }, [tabAtiva]);

  // Cálculos Automáticos
  const totalPecas = itens.reduce((acc, it) => acc + (Number(it.quantidade) || 0), 0);
  const valorTotalNota = itens.reduce((acc, it) => acc + (Number(it.valorTotal) || 0), 0);

  // Adicionar nova linha limpa
  const handleAdicionarItemVazio = () => {
    setItens((prev) => [...prev, criarItemEmBranco()]);
  };

  // Atualizar campo do item
  const handleAtualizarItem = (id: string, campo: keyof ItemCompra, valor: any) => {
    setItens((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const itemAtualizado = { ...item, [campo]: valor };

        // Se alterou o produto selecionado no dropdown
        if (campo === 'produtoId') {
          const prod = produtosFisicos.find((p) => p.id === valor);
          if (prod) {
            itemAtualizado.codigo = prod.codigo;
            itemAtualizado.descricao = prod.descricao;
            itemAtualizado.unidadeMedida = prod.unidadeMedida;
            itemAtualizado.categoria = prod.categoria;
            if (!itemAtualizado.precoCustoUnitario || itemAtualizado.precoCustoUnitario === 0) {
              itemAtualizado.precoCustoUnitario = +(prod.precoVenda * 0.55).toFixed(2);
            }
          } else {
            itemAtualizado.codigo = '';
            itemAtualizado.descricao = '';
            itemAtualizado.unidadeMedida = 'UN';
            itemAtualizado.precoCustoUnitario = '' as unknown as number;
          }
        }

        // Recalcular valor total do item
        const qtd = Number(itemAtualizado.quantidade) || 0;
        const custo = Number(itemAtualizado.precoCustoUnitario) || 0;
        itemAtualizado.valorTotal = +(qtd * custo).toFixed(2);

        return itemAtualizado;
      })
    );
  };

  // Remover item da tabela
  const handleRemoverItem = (id: string) => {
    setItens((prev) => {
      const filtrados = prev.filter((it) => it.id !== id);
      return filtrados.length === 0 ? [criarItemEmBranco()] : filtrados;
    });
  };

  // Submissão: Salvar Compra e Atualizar Estoque
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fornecedor.trim()) {
      alert('Informe o nome ou razão social do Fornecedor.');
      fornecedorInputRef.current?.focus();
      return;
    }
    if (!numeroNota.trim()) {
      alert('Informe o Número da Nota Fiscal de Compra.');
      return;
    }

    // Filtrar itens que possuem código, descrição ou quantidade preenchida
    const itensValidos = itens.filter(
      (it) => it.codigo.trim() || it.descricao.trim() || Number(it.quantidade) > 0
    );

    if (itensValidos.length === 0) {
      alert('Adicione ao menos um produto com dados válidos à compra.');
      return;
    }

    for (const it of itensValidos) {
      if (!it.codigo.trim() && !it.descricao.trim()) {
        alert('Informe o código ou descrição de todos os itens.');
        return;
      }
      if (!it.quantidade || Number(it.quantidade) <= 0) {
        alert(`Informe a quantidade comprada do item "${it.codigo || it.descricao}".`);
        return;
      }
    }

    const valorTotalValidos = itensValidos.reduce((acc, it) => acc + (Number(it.valorTotal) || 0), 0);
    const totalPecasValidos = itensValidos.reduce((acc, it) => acc + (Number(it.quantidade) || 0), 0);

    const novaCompra: Compra = {
      id: `cmp-${Date.now()}`,
      numeroNota: numeroNota.trim(),
      fornecedor: fornecedor.trim(),
      dataCompra,
      observacoes: observacoes.trim(),
      itens: [...itensValidos],
      valorTotal: valorTotalValidos,
      dataCadastro: new Date().toISOString(),
    };

    // 1. Salvar no histórico de compras
    onSalvarCompra(novaCompra);

    // 2. Atualizar automaticamente os saldos do estoque correspondente
    const atualizacoes = itensValidos.map((it) => ({
      codigo: it.codigo,
      quantidade: Number(it.quantidade) || 0,
      novoCusto: Number(it.precoCustoUnitario) || undefined,
    }));
    onAtualizarEstoque(atualizacoes);

    // 3. Exibir mensagem de sucesso
    setSucessoMsg(
      `✅ Compra "${novaCompra.numeroNota}" do fornecedor "${novaCompra.fornecedor}" registrada com sucesso! +${totalPecasValidos} unidades adicionadas imediatamente ao estoque físico.`
    );

    // 4. Limpeza automática completa ao salvar compra (Reset limpo):
    // a) Limpa cabeçalho da nota
    setFornecedor('');
    setNumeroNota('');
    setDataCompra(new Date().toISOString().split('T')[0]);
    setObservacoes('');

    // b) Esvazia e reseta tabela de produtos para 1 linha limpa
    setItens([criarItemEmBranco()]);

    // c) Foco automático no campo Fornecedor para iniciar nova entrada imediatamente
    setTimeout(() => {
      fornecedorInputRef.current?.focus();
    }, 60);

    // Role para o topo suavemente
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* 1. Header do Módulo de Compras */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold font-mono uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              Módulo: Compras & Entrada de NF-e
            </span>
            <span className="text-xs text-slate-500 font-medium">| MFx Tecnologia Industrial</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-emerald-600" />
            Lançamento de Compras & Entrada de Insumos
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Entrada ágil de notas fiscais de peças e consumíveis para Laser Fibra, Plasma e Oxicorte com atualização imediata de estoque.
          </p>
        </div>

        {/* Abas e Atalho para Estoque */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTabAtiva('novo')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              tabAtiva === 'novo'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <PackagePlus className="w-4 h-4" />
            <span>Lançar Nova Compra</span>
          </button>

          <button
            type="button"
            onClick={() => setTabAtiva('historico')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              tabAtiva === 'historico'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Histórico ({compras.length})</span>
          </button>

          <button
            type="button"
            onClick={onIrParaEstoque}
            className="px-3.5 py-2 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 bg-white transition flex items-center gap-1.5"
            title="Abrir Tabela de Estoque"
          >
            <Boxes className="w-4 h-4 text-amber-600" />
            <span>Ver Saldo de Estoque</span>
          </button>
        </div>
      </div>

      {/* Alerta de Feedback de Sucesso */}
      {sucessoMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start justify-between gap-3 text-emerald-900 animate-fadeIn">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">Estoque Atualizado com Sucesso!</div>
              <p className="text-xs text-emerald-800 mt-0.5">{sucessoMsg}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSucessoMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1 rounded hover:bg-emerald-100 transition"
          >
            Dispensar
          </button>
        </div>
      )}

      {/* GUIA 1: FORMULÁRIO DE LANÇAMENTO DE COMPRAS */}
      {tabAtiva === 'novo' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* BLOCO 1: DADOS DA COMPRA (CABEÇALHO) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-[11px] flex items-center justify-center font-mono font-bold text-slate-950">
                  1
                </span>
                <h2 className="text-sm font-bold uppercase tracking-wider">
                  Dados da Compra / Nota Fiscal de Entrada
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                Linha Industrial: Laser • Plasma • Oxicorte
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Fornecedor */}
                <div className="md:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    Fornecedor / Razão Social <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={fornecedorInputRef}
                    type="text"
                    required
                    value={fornecedor}
                    onChange={(e) => setFornecedor(e.target.value)}
                    placeholder="Ex: Raytools Óptica & Laser Co. ou Hypertherm do Brasil"
                    className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  />
                </div>

                {/* Número da Nota Fiscal */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-slate-500" />
                    Nº da Nota Fiscal / Chave <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={numeroNota}
                    onChange={(e) => setNumeroNota(e.target.value)}
                    placeholder="Ex: NF-e 049.882"
                    className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Número ou série da NF de entrada</span>
                </div>

                {/* Data da Compra */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Data da Compra <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dataCompra}
                    onChange={(e) => setDataCompra(e.target.value)}
                    className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Data de emissão da NF-e</span>
                </div>

                {/* Observações da Compra */}
                <div className="md:col-span-12">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Observações / Condições Comerciais (Opcional)
                  </label>
                  <input
                    type="text"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Ex: Pedido de importação via despachante Santos, 28/56 DDL, lote de reposição preventiva para clientes Laser Fibra."
                    className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  />
                </div>

              </div>
            </div>
          </div>

          {/* BLOCO 2: LANÇAMENTO DE ITENS ADQUIRIDOS (ITENS DA NOTA) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-[11px] flex items-center justify-center font-mono font-bold text-slate-950">
                  2
                </span>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider">
                    Itens Adquiridos na Nota Fiscal
                  </h2>
                  <div className="text-[10px] text-slate-400">
                    O saldo dos itens será somado automaticamente ao estoque após a gravação
                  </div>
                </div>
              </div>

              {/* Botão Único Limpo para Adicionar Item */}
              <button
                type="button"
                onClick={handleAdicionarItemVazio}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Adicionar Item</span>
              </button>
            </div>

            {/* Tabela de Itens */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800 text-white uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 w-[45px] text-center">#</th>
                    <th className="py-2.5 px-3 w-[260px]">Produto / Insumo Cadastrado</th>
                    <th className="py-2.5 px-3 w-[130px]">Código MFx</th>
                    <th className="py-2.5 px-3">Descrição Completa na Nota</th>
                    <th className="py-2.5 px-3 w-[70px] text-center">Unid.</th>
                    <th className="py-2.5 px-3 w-[100px] text-center">Estoque Atual</th>
                    <th className="py-2.5 px-3 w-[110px] text-center">Qtd Comprada</th>
                    <th className="py-2.5 px-3 w-[130px] text-right">Custo Unit. (R$)</th>
                    <th className="py-2.5 px-3 w-[130px] text-right">Total Item (R$)</th>
                    <th className="py-2.5 px-3 w-[45px] text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {itens.map((item, idx) => {
                    const prodCadastrado = produtosFisicos.find(
                      (p) => p.id === item.produtoId || (item.codigo && p.codigo === item.codigo)
                    );
                    const saldoAtual = prodCadastrado?.estoqueAtual ?? 0;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        {/* Índice */}
                        <td className="py-2.5 px-3 text-center font-mono text-slate-400 font-bold">
                          {idx + 1}
                        </td>

                        {/* Seleção do Produto Cadastrado */}
                        <td className="py-2.5 px-3">
                          <select
                            value={item.produtoId}
                            onChange={(e) => handleAtualizarItem(item.id, 'produtoId', e.target.value)}
                            className="w-full text-xs py-1.5 px-2 border border-slate-300 rounded font-medium bg-white focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="" disabled>-- Selecione o Produto / Insumo --</option>
                            {produtosFisicos.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.codigo} - {p.descricao.substring(0, 38)}... (Saldo: {p.estoqueAtual} {p.unidadeMedida})
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Código */}
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            required
                            value={item.codigo}
                            onChange={(e) => handleAtualizarItem(item.id, 'codigo', e.target.value)}
                            placeholder="Ex: MFX-LP30-15"
                            className="w-full text-xs font-mono font-bold py-1 px-2 border border-slate-300 rounded bg-white text-slate-900"
                          />
                        </td>

                        {/* Descrição */}
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            required
                            value={item.descricao}
                            onChange={(e) => handleAtualizarItem(item.id, 'descricao', e.target.value)}
                            placeholder="Descrição completa conforme NF-e..."
                            className="w-full text-xs py-1 px-2 border border-slate-300 rounded bg-white"
                          />
                        </td>

                        {/* Unidade */}
                        <td className="py-2.5 px-3 text-center">
                          <select
                            value={item.unidadeMedida}
                            onChange={(e) => handleAtualizarItem(item.id, 'unidadeMedida', e.target.value)}
                            className="w-full text-xs py-1 px-1 border border-slate-300 rounded font-mono font-bold text-center bg-white"
                          >
                            <option value="UN">UN</option>
                            <option value="PC">PC</option>
                            <option value="JG">JG</option>
                            <option value="CX">CX</option>
                            <option value="MT">MT</option>
                          </select>
                        </td>

                        {/* Saldo Atual em Estoque */}
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                              !prodCadastrado || !item.codigo
                                ? 'bg-slate-100 text-slate-400'
                                : saldoAtual <= 5
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                            title="Saldo físico atual deste item antes da entrada desta compra"
                          >
                            {prodCadastrado && item.codigo ? `${saldoAtual} ${item.unidadeMedida}` : '-'}
                          </span>
                        </td>

                        {/* Quantidade Comprada */}
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            required
                            value={item.quantidade === 0 || !item.quantidade ? '' : item.quantidade}
                            onChange={(e) =>
                              handleAtualizarItem(
                                item.id,
                                'quantidade',
                                e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="0"
                            className="w-full text-xs py-1 px-2 text-center font-mono font-bold border border-emerald-300 bg-emerald-50/40 rounded focus:ring-1 focus:ring-emerald-500"
                          />
                        </td>

                        {/* Preço de Custo Unitário */}
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            value={item.precoCustoUnitario === 0 || !item.precoCustoUnitario ? '' : item.precoCustoUnitario}
                            onChange={(e) =>
                              handleAtualizarItem(
                                item.id,
                                'precoCustoUnitario',
                                e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="0,00"
                            className="w-full text-xs py-1 px-2 text-right font-mono font-bold border border-slate-300 rounded bg-white focus:ring-1 focus:ring-emerald-500"
                          />
                        </td>

                        {/* Total do Item */}
                        <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 bg-slate-50">
                          {formatCurrency(item.valorTotal)}
                        </td>

                        {/* Remover */}
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoverItem(item.id)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded transition cursor-pointer"
                            title="Remover linha"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={6} className="py-3 px-4 text-right uppercase text-xs">
                      Resumo da Nota Fiscal:
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-emerald-800 text-sm font-black">
                      +{totalPecas} un
                    </td>
                    <td className="py-3 px-3 text-right text-xs uppercase text-slate-600">
                      Total da Compra:
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-700 text-base font-black">
                      {formatCurrency(valorTotalNota)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Painel inferior de Ação & Conclusão (Sem botão duplicado) */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-medium">
                  {itens.filter((it) => it.codigo.trim() || it.descricao.trim()).length} {itens.filter((it) => it.codigo.trim() || it.descricao.trim()).length === 1 ? 'item lançado' : 'itens lançados'} na NF
                </span>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                <div className="text-right hidden sm:block">
                  <div className="text-[11px] text-slate-500 uppercase font-semibold">Valor Total Líquido</div>
                  <div className="text-xl font-black font-mono text-emerald-700">{formatCurrency(valorTotalNota)}</div>
                </div>

                {/* BOTÃO DE CONCLUSÃO */}
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition transform active:scale-95 cursor-pointer"
                >
                  <PackagePlus className="w-5 h-5" />
                  <span>Salvar Compra e Atualizar Estoque</span>
                </button>
              </div>
            </div>

          </div>

        </form>
      )}

      {/* GUIA 2: HISTÓRICO DE COMPRAS REGISTRADAS */}
      {tabAtiva === 'historico' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="bg-slate-900 text-white px-6 py-3.5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider">
                Histórico de Compras e Entradas Físicas de Estoque
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono font-bold">
              {compras.length} Compras Registradas
            </span>
          </div>

          {compras.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <div className="font-bold text-slate-700">Nenhuma compra registrada ainda.</div>
              <p className="text-xs text-slate-500 mt-1">
                Utilize a aba "Lançar Nova Compra" para registrar as notas fiscais de peças e consumíveis.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {compras.map((compra) => {
                const totalQtdPecas = compra.itens.reduce((acc, it) => acc + (Number(it.quantidade) || 0), 0);

                return (
                  <div key={compra.id} className="p-6 hover:bg-slate-50/70 transition">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                            {compra.numeroNota}
                          </span>
                          <span className="font-bold text-slate-900 text-base">{compra.fornecedor}</span>
                        </div>
                        {compra.observacoes && (
                          <p className="text-xs text-slate-500 mt-1">Obs: {compra.observacoes}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-left lg:text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Data da Compra</span>
                          <span className="font-mono text-xs font-bold text-slate-700">{compra.dataCompra}</span>
                        </div>

                        <div className="text-left lg:text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Peças Entradas</span>
                          <span className="font-mono text-xs font-bold text-emerald-700">+{totalQtdPecas} un</span>
                        </div>

                        <div className="text-left lg:text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Valor Total</span>
                          <span className="font-mono text-base font-black text-slate-900">{formatCurrency(compra.valorTotal)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tabela dos Itens daquela Compra */}
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 mt-2">
                      <div className="text-[11px] font-bold text-slate-700 uppercase mb-2 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-500" />
                        Itens Adquiridos nesta Nota:
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="text-[10px] uppercase text-slate-500 font-bold border-b border-slate-200">
                            <tr>
                              <th className="py-1 px-2">Código</th>
                              <th className="py-1 px-2">Descrição</th>
                              <th className="py-1 px-2 text-center">Unid.</th>
                              <th className="py-1 px-2 text-center">Quantidade</th>
                              <th className="py-1 px-2 text-right">Custo Unitário</th>
                              <th className="py-1 px-2 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200/60 font-mono">
                            {compra.itens.map((it) => (
                              <tr key={it.id}>
                                <td className="py-1 px-2 font-bold text-slate-800">{it.codigo}</td>
                                <td className="py-1 px-2 font-sans text-slate-700">{it.descricao}</td>
                                <td className="py-1 px-2 text-center text-slate-600">{it.unidadeMedida}</td>
                                <td className="py-1 px-2 text-center font-bold text-emerald-700">+{it.quantidade}</td>
                                <td className="py-1 px-2 text-right text-slate-700">{formatCurrency(it.precoCustoUnitario)}</td>
                                <td className="py-1 px-2 text-right font-bold text-slate-900">{formatCurrency(it.valorTotal)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
