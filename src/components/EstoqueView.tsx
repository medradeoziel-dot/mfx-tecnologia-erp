import React, { useState, useEffect } from 'react';
import { ItemEstoque, TipoItem, UnidadeMedida, CategoriaItem } from '../types';
import { ESTOQUE_INICIAL } from '../data/initialData';
import { formatCurrency, formatNumber } from '../utils/formatters';
import {
  Boxes,
  Wrench,
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Receipt,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Filter,
  ArrowRight,
  ShieldAlert,
  Info,
  Clock,
  Calendar,
  Sparkles,
  X,
  FileCheck
} from 'lucide-react';

interface EstoqueViewProps {
  itens?: ItemEstoque[];
  onUpdateItens?: (itens: ItemEstoque[]) => void;
  onAbrirNovaOsComItem?: (item: ItemEstoque) => void;
  onAbrirNovaOs?: () => void;
}

export const EstoqueView: React.FC<EstoqueViewProps> = ({
  itens: itensProp,
  onUpdateItens,
  onAbrirNovaOsComItem,
  onAbrirNovaOs,
}) => {
  // Estado local com persistência no localStorage
  const [localItens, setLocalItens] = useState<ItemEstoque[]>(() => {
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

  const itens = itensProp ?? localItens;

  const setItens = (novo: ItemEstoque[] | ((prev: ItemEstoque[]) => ItemEstoque[])) => {
    if (typeof novo === 'function') {
      const updated = novo(itens);
      if (onUpdateItens) onUpdateItens(updated);
      setLocalItens(updated);
    } else {
      if (onUpdateItens) onUpdateItens(novo);
      setLocalItens(novo);
    }
  };

  // Salvar no localStorage sempre que alterar
  useEffect(() => {
    try {
      localStorage.setItem('mfx_estoque_itens', JSON.stringify(itens));
    } catch (e) {
      console.warn('Erro ao salvar estoque no localStorage:', e);
    }
  }, [itens]);

  // Filtros e busca
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'produto' | 'servico'>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [busca, setBusca] = useState<string>('');

  // Controle do Modal de Cadastro / Edição
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [itemEmEdicao, setItemEmEdicao] = useState<ItemEstoque | null>(null);

  // Estados do formulário do Modal
  const [tipo, setTipo] = useState<TipoItem>('produto');
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<CategoriaItem>('Consumíveis');
  const [unidadeMedida, setUnidadeMedida] = useState<UnidadeMedida>('UN');
  const [precoVenda, setPrecoVenda] = useState<number>(0);
  const [estoqueAtual, setEstoqueAtual] = useState<number>(0);
  const [estoqueMinimo, setEstoqueMinimo] = useState<number>(5);

  // Campos Fiscais NFS-e (Mão de Obra e Serviços)
  const [codigoServicoLc116, setCodigoServicoLc116] = useState('14.01');
  const [descricaoLc116, setDescricaoLc116] = useState(
    'Lubrificação, limpeza, revisão, conserto, restauração, blindagem, manutenção e conservação de máquinas'
  );
  const [codigoTributacaoMunicipal, setCodigoTributacaoMunicipal] = useState('1401-0/01-88');
  const [itemLc116, setItemLc116] = useState('14.01');
  const [aliquotaIss, setAliquotaIss] = useState<number>(3.0);
  const [exigibilidadeIss, setExigibilidadeIss] = useState<'1' | '2' | '3' | '4' | '5' | '6' | '7'>('1');
  const [retencaoIss, setRetencaoIss] = useState<boolean>(false);
  const [cfopServico, setCfopServico] = useState('5933');

  // Campos Fiscais NF-e Mod. 55 (Produtos e Consumíveis)
  const [ncm, setNcm] = useState('8466.93.30');
  const [cstCsosn, setCstCsosn] = useState('0102');
  const [cfopProduto, setCfopProduto] = useState('5102');
  const [origem, setOrigem] = useState<'0' | '1' | '2' | '3' | '5'>('0');
  const [observacoesFiscais, setObservacoesFiscais] = useState('');

  // Abrir Modal para Novo Item
  const handleNovoItem = (tipoInicial: TipoItem = 'produto') => {
    setItemEmEdicao(null);
    setTipo(tipoInicial);
    setCodigo(`MFX-${tipoInicial === 'produto' ? 'CONS' : 'SRV'}-${Date.now().toString().slice(-4)}`);
    setDescricao('');
    setCategoria(tipoInicial === 'produto' ? 'Consumíveis' : 'Serviços Laser');
    setUnidadeMedida(tipoInicial === 'produto' ? 'UN' : 'HR');
    setPrecoVenda(0);
    setEstoqueAtual(tipoInicial === 'produto' ? 10 : 0);
    setEstoqueMinimo(tipoInicial === 'produto' ? 5 : 0);

    // Default fiscais
    if (tipoInicial === 'servico') {
      setCodigoServicoLc116('14.01');
      setDescricaoLc116('Manutenção e conservação de máquinas e equipamentos industriais.');
      setCodigoTributacaoMunicipal('1401-0/01-88');
      setItemLc116('14.01');
      setAliquotaIss(3.0);
      setExigibilidadeIss('1');
      setRetencaoIss(false);
      setCfopServico('5933');
    } else {
      setNcm('9027.90.99');
      setCstCsosn('0102');
      setCfopProduto('5102');
      setOrigem('0');
    }
    setObservacoesFiscais('');
    setModalAberto(true);
  };

  // Abrir Modal para Edição
  const handleEditar = (item: ItemEstoque) => {
    setItemEmEdicao(item);
    setTipo(item.tipo);
    setCodigo(item.codigo);
    setDescricao(item.descricao);
    setCategoria(item.categoria);
    setUnidadeMedida(item.unidadeMedida);
    setPrecoVenda(item.precoVenda);
    setEstoqueAtual(item.estoqueAtual || 0);
    setEstoqueMinimo(item.estoqueMinimo || 0);

    // Fiscais NFS-e
    setCodigoServicoLc116(item.codigoServicoLc116 || '14.01');
    setDescricaoLc116(item.descricaoLc116 || '');
    setCodigoTributacaoMunicipal(item.codigoTributacaoMunicipal || '1401-0/01-88');
    setItemLc116(item.itemLc116 || '14.01');
    setAliquotaIss(item.aliquotaIss ?? 3.0);
    setExigibilidadeIss(item.exigibilidadeIss || '1');
    setRetencaoIss(Boolean(item.retencaoIss));
    setCfopServico(item.cfopServico || '5933');

    // Fiscais NF-e
    setNcm(item.ncm || '');
    setCstCsosn(item.cstCsosn || '0102');
    setCfopProduto(item.cfopProduto || '5102');
    setOrigem(item.origem || '0');
    setObservacoesFiscais(item.observacoesFiscais || '');

    setModalAberto(true);
  };

  // Salvar registro
  const handleSalvarItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (!codigo.trim() || !descricao.trim()) {
      alert('Preencha ao menos o Código e a Descrição do item/serviço.');
      return;
    }

    const itemSalvo: ItemEstoque = {
      id: itemEmEdicao ? itemEmEdicao.id : `est-${Date.now()}`,
      tipo,
      codigo: codigo.trim().toUpperCase(),
      descricao: descricao.trim(),
      categoria,
      unidadeMedida,
      precoVenda: Number(precoVenda) || 0,
      estoqueAtual: tipo === 'produto' ? Number(estoqueAtual) || 0 : 0,
      estoqueMinimo: tipo === 'produto' ? Number(estoqueMinimo) || 0 : 0,

      // Se for serviço, salva dados NFS-e
      ...(tipo === 'servico' && {
        codigoServicoLc116,
        descricaoLc116,
        codigoTributacaoMunicipal,
        itemLc116,
        aliquotaIss: Number(aliquotaIss) || 0,
        exigibilidadeIss,
        retencaoIss,
        cfopServico,
      }),

      // Se for produto, salva dados NF-e
      ...(tipo === 'produto' && {
        ncm: ncm.trim(),
        cstCsosn,
        cfopProduto,
        origem,
      }),

      observacoesFiscais: observacoesFiscais.trim(),
      dataAtualizacao: new Date().toISOString(),
    };

    if (itemEmEdicao) {
      setItens((prev) => prev.map((it) => (it.id === itemEmEdicao.id ? itemSalvo : it)));
    } else {
      setItens((prev) => [itemSalvo, ...prev]);
    }

    setModalAberto(false);
  };

  const handleExcluir = (id: string, desc: string) => {
    if (confirm(`Tem certeza que deseja excluir "${desc}" do catálogo?`)) {
      setItens((prev) => prev.filter((it) => it.id !== id));
    }
  };

  const handleRestaurarPadrao = () => {
    if (confirm('Deseja restaurar os itens e serviços padrão de fábrica da MFx Tecnologia?')) {
      setItens(ESTOQUE_INICIAL);
    }
  };

  // Filtragem dos itens
  const itensFiltrados = itens.filter((it) => {
    if (filtroTipo !== 'todos' && it.tipo !== filtroTipo) return false;
    if (filtroCategoria !== 'todas' && it.categoria !== filtroCategoria) return false;

    if (busca.trim()) {
      const q = busca.toLowerCase();
      const matchCod = it.codigo.toLowerCase().includes(q);
      const matchDesc = it.descricao.toLowerCase().includes(q);
      const matchNcm = it.ncm ? it.ncm.toLowerCase().includes(q) : false;
      const matchLc = it.codigoServicoLc116 ? it.codigoServicoLc116.toLowerCase().includes(q) : false;
      return matchCod || matchDesc || matchNcm || matchLc;
    }
    return true;
  });

  // Métricas
  const totalProdutos = itens.filter((it) => it.tipo === 'produto').length;
  const totalServicos = itens.filter((it) => it.tipo === 'servico').length;
  const saldoFisicoPecas = itens
    .filter((it) => it.tipo === 'produto')
    .reduce((acc, curr) => acc + (curr.estoqueAtual || 0), 0);
  const valorPatrimonialEstoque = itens
    .filter((it) => it.tipo === 'produto')
    .reduce((acc, curr) => acc + (curr.estoqueAtual || 0) * curr.precoVenda, 0);

  return (
    <div className="space-y-5">
      {/* Sub-navegador no padrão OS */}
      <div className="bg-white rounded-xl p-2 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <Boxes className="w-4 h-4 text-amber-600" />
            <span>Catálogo de Produtos & Serviços</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNovoItem('produto')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            title="Novo Produto ou Consumível"
          >
            <Package className="w-3.5 h-3.5" />
            <span>+ Produto</span>
          </button>

          <button
            onClick={() => handleNovoItem('servico')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-700 hover:bg-purple-800 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            title="Novo Serviço ou Mão de Obra"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>+ Serviço</span>
          </button>

          {onAbrirNovaOs && (
            <button
              onClick={onAbrirNovaOs}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              title="Abrir Nova Ordem de Serviço"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Nova OS</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. Header do Módulo */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              Produtos & Serviços
            </span>
            <span className="text-xs text-slate-500 font-medium">| MFx Tecnologia Industrial</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-amber-600" />
            Catálogo de Produtos, Consumíveis & Mão de Obra
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Gestão integrada com diferenciação nativa entre <strong>Produtos (NF-e Mod. 55 / SEFAZ)</strong> e <strong>Serviços / Mão de Obra (NFS-e Municipal / LC 116)</strong> para faturamento assertivo de Ordens de Serviço.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleNovoItem('servico')}
            className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <Wrench className="w-4 h-4" />
            <span>+ Mão de Obra / Serviço</span>
          </button>
          
          <button
            onClick={() => handleNovoItem('produto')}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <Package className="w-4 h-4" />
            <span>+ Produto / Consumível</span>
          </button>

          {onAbrirNovaOs && (
            <button
              onClick={onAbrirNovaOs}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <Receipt className="w-4 h-4" />
              <span>Abrir Nova OS</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Cards de Métricas e Divisão Fiscal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Produtos NF-e */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Produtos & Consumíveis (NF-e)
            </div>
            <div className="text-2xl font-black text-amber-600 font-mono mt-1">
              {totalProdutos} <span className="text-xs text-slate-500 font-sans font-normal">itens ({saldoFisicoPecas} un)</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              NCM / CST / CFOP 5102
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Serviços NFS-e */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Mão de Obra & Serviços (NFS-e)
            </div>
            <div className="text-2xl font-black text-purple-700 font-mono mt-1">
              {totalServicos} <span className="text-xs text-slate-500 font-sans font-normal">especialidades</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              LC 116 (14.01) / ISS Municipal
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Valor Patrimonial Estoque */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Valor Físico em Estoque
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono mt-1">
              {formatCurrency(valorPatrimonialEstoque)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Consumíveis a pronta entrega
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Faturamento Fiscal Duplo */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-xl shadow-md border-l-4 border-amber-500">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Regras Fiscais MFx</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xs text-slate-200 mt-1 space-y-0.5">
            <div>• <strong>NFS-e:</strong> LC 116: 14.01 / ISS Agudos 2%</div>
            <div>• <strong>NF-e:</strong> NCM Peças / CSOSN 0102 / CFOP 5102</div>
          </div>
          <div className="text-[10px] text-amber-400 font-medium mt-2">
            Pronto para split automático na OS
          </div>
        </div>
      </div>

      {/* 3. Filtros, Busca e Tabela Principal */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Barra de Filtros */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Segmented Control: Todos / Produtos / Serviços */}
          <div className="flex items-center gap-1 bg-slate-200 p-1 rounded-lg">
            <button
              onClick={() => setFiltroTipo('todos')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                filtroTipo === 'todos'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Todos</span>
              <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded-full border border-slate-300">
                {itens.length}
              </span>
            </button>

            <button
              onClick={() => setFiltroTipo('produto')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                filtroTipo === 'produto'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-amber-800'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Produtos & Consumíveis (NF-e)</span>
              <span className="text-[10px] bg-black/10 px-1.5 py-0.2 rounded-full">
                {totalProdutos}
              </span>
            </button>

            <button
              onClick={() => setFiltroTipo('servico')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                filtroTipo === 'servico'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-purple-800'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Mão de Obra & Serviços (NFS-e)</span>
              <span className="text-[10px] bg-black/10 px-1.5 py-0.2 rounded-full">
                {totalServicos}
              </span>
            </button>
          </div>

          {/* Busca e Categoria */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Buscar código, descrição, NCM ou LC 116..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
              {busca && (
                <button
                  onClick={() => setBusca('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="text-xs py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-hidden"
            >
              <option value="todas">Todas as Categorias</option>
              <option value="Consumíveis">Consumíveis</option>
              <option value="Serviços Laser">Serviços Laser</option>
              <option value="Serviços Oxicorte">Serviços Oxicorte</option>
              <option value="Serviços Plasma">Serviços Plasma</option>
              <option value="Mão de Obra">Mão de Obra</option>
              <option value="Peças & Acessórios">Peças & Acessórios</option>
            </select>

            <button
              onClick={handleRestaurarPadrao}
              title="Restaurar catálogo padrão de fábrica"
              className="text-xs text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 px-2.5 py-1.5 rounded-lg transition"
            >
              Padrão
            </button>
          </div>

        </div>

        {/* Tabela de Itens */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white uppercase text-[11px] font-bold">
              <tr>
                <th className="py-2.5 px-4 w-[110px]">Tipo</th>
                <th className="py-2.5 px-4 w-[130px]">Código</th>
                <th className="py-2.5 px-4">Descrição do Item / Prestação de Serviço</th>
                <th className="py-2.5 px-4 w-[140px]">Categoria</th>
                <th className="py-2.5 px-4 w-[75px] text-center">Unidade</th>
                <th className="py-2.5 px-4 w-[180px]">Enquadramento Fiscal</th>
                <th className="py-2.5 px-4 w-[90px] text-center">Saldo</th>
                <th className="py-2.5 px-4 w-[110px] text-right">Preço Venda</th>
                <th className="py-2.5 px-4 w-[110px] text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {itensFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <Boxes className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium">Nenhum produto ou serviço encontrado para este filtro.</p>
                    <p className="text-xs text-slate-400 mt-1">Altere os critérios de busca ou cadastre um novo item acima.</p>
                  </td>
                </tr>
              ) : (
                itensFiltrados.map((item) => {
                  const isServico = item.tipo === 'servico';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      {/* 1. Tipo Badge */}
                      <td className="py-2.5 px-4">
                        {isServico ? (
                          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-200">
                            <Wrench className="w-3 h-3" />
                            NFS-e Serviço
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                            <Package className="w-3 h-3" />
                            NF-e Produto
                          </span>
                        )}
                      </td>

                      {/* 2. Código */}
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-800">
                        {item.codigo}
                      </td>

                      {/* 3. Descrição */}
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-900">{item.descricao}</div>
                        {item.observacoesFiscais && (
                          <div className="text-[10px] text-slate-500 mt-0.5 italic">
                            {item.observacoesFiscais}
                          </div>
                        )}
                      </td>

                      {/* 4. Categoria Badge */}
                      <td className="py-2.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          item.categoria === 'Consumíveis'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : item.categoria === 'Mão de Obra'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : item.categoria === 'Serviços Laser'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : item.categoria === 'Serviços Oxicorte'
                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                            : item.categoria === 'Serviços Plasma'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {item.categoria}
                        </span>
                      </td>

                      {/* 5. Unidade */}
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-700">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] border border-slate-200">
                          {item.unidadeMedida}
                        </span>
                      </td>

                      {/* 6. Enquadramento Fiscal (NCM para Produtos ou LC 116 para Serviços) */}
                      <td className="py-2.5 px-4">
                        {isServico ? (
                          <div className="text-[11px] leading-tight">
                            <div className="font-mono font-bold text-purple-900 flex items-center gap-1">
                              <span>LC 116: {item.codigoServicoLc116 || '14.01'}</span>
                              <span className="text-[9px] bg-purple-100 text-purple-800 px-1 rounded font-sans">
                                ISS {item.aliquotaIss || 3}%
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              CFOP: {item.cfopServico || '5933'} | CTISS: {item.codigoTributacaoMunicipal || '1401-0'}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] leading-tight">
                            <div className="font-mono font-bold text-slate-800 flex items-center gap-1">
                              <span>NCM: {item.ncm || '9027.90.99'}</span>
                              <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-sans">
                                CSOSN {item.cstCsosn || '0102'}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              CFOP: {item.cfopProduto || '5102'} | Origem: {item.origem || '0'}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 7. Saldo */}
                      <td className="py-2.5 px-4 text-center font-mono">
                        {isServico ? (
                          <span className="text-[10px] text-slate-400 italic">Mão de Obra</span>
                        ) : (
                          <span className={`font-bold ${
                            item.estoqueAtual <= (item.estoqueMinimo || 5)
                              ? 'text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200'
                              : 'text-slate-800'
                          }`}>
                            {item.estoqueAtual} {item.unidadeMedida}
                          </span>
                        )}
                      </td>

                      {/* 8. Preço Venda */}
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(item.precoVenda)}
                      </td>

                      {/* 9. Ações */}
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {onAbrirNovaOsComItem && (
                            <button
                              onClick={() => onAbrirNovaOsComItem(item)}
                              title="Inserir em Nova Ordem de Serviço"
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditar(item)}
                            title="Editar Dados e Parâmetros Fiscais"
                            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExcluir(item.id, item.descricao)}
                            title="Excluir Item"
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé explicativo da tabela */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              <strong>NF-e:</strong> Produtos/Consumíveis (SEFAZ Estadual)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span>
              <strong>NFS-e:</strong> Mão de Obra e Serviços (Prefeitura Municipal)
            </span>
          </div>
          <div>
            Exibindo <strong>{itensFiltrados.length}</strong> de <strong>{itens.length}</strong> cadastros
          </div>
        </div>

      </div>

      {/* 4. MODAL DE CADASTRO E EDIÇÃO COM SELEÇÃO DINÂMICA ENTRE PRODUTO E SERVIÇO */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-6">
            
            {/* Cabeçalho do Modal */}
            <div className={`px-6 py-4 text-white flex items-center justify-between ${
              tipo === 'servico' ? 'bg-purple-900' : 'bg-slate-900'
            }`}>
              <div className="flex items-center gap-2">
                {tipo === 'servico' ? (
                  <Wrench className="w-5 h-5 text-purple-400" />
                ) : (
                  <Package className="w-5 h-5 text-amber-400" />
                )}
                <div>
                  <h3 className="font-bold text-base">
                    {itemEmEdicao ? 'Editar Cadastro de Item / Serviço' : 'Novo Cadastro no Catálogo'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {tipo === 'servico'
                      ? 'Parâmetros para Nota Fiscal de Serviços Eletrônica (NFS-e Municipal)'
                      : 'Parâmetros para Nota Fiscal Eletrônica de Mercadorias (NF-e Mod. 55)'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalAberto(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSalvarItem} className="p-6 space-y-6">
              
              {/* 1. SELETOR PRINCIPAL: DIFERENCIAÇÃO ENTRE PRODUTO E SERVIÇO */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Tipo de Item <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Opção Produto */}
                  <label
                    onClick={() => {
                      setTipo('produto');
                      if (unidadeMedida === 'HR' || unidadeMedida === 'DIA') {
                        setUnidadeMedida('UN');
                      }
                      if (categoria === 'Mão de Obra') {
                        setCategoria('Consumíveis');
                      }
                    }}
                    className={`cursor-pointer rounded-xl p-3 border-2 transition flex items-start gap-3 ${
                      tipo === 'produto'
                        ? 'border-amber-500 bg-amber-50/50 text-slate-900 ring-2 ring-amber-200'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipoItem"
                      checked={tipo === 'produto'}
                      onChange={() => {}}
                      className="mt-1 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <div className="font-bold text-sm flex items-center gap-1.5 text-slate-900">
                        <Package className="w-4 h-4 text-amber-600" />
                        Produto / Consumível
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Emissão de <strong>NF-e Mod. 55</strong> (Lentes, bicos, cabos, eletrodos, cerâmicas).
                      </div>
                    </div>
                  </label>

                  {/* Opção Serviço */}
                  <label
                    onClick={() => {
                      setTipo('servico');
                      if (unidadeMedida === 'PC' || unidadeMedida === 'CX') {
                        setUnidadeMedida('HR');
                      }
                      if (categoria === 'Consumíveis') {
                        setCategoria('Serviços Laser');
                      }
                    }}
                    className={`cursor-pointer rounded-xl p-3 border-2 transition flex items-start gap-3 ${
                      tipo === 'servico'
                        ? 'border-purple-600 bg-purple-50/50 text-slate-900 ring-2 ring-purple-200'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipoItem"
                      checked={tipo === 'servico'}
                      onChange={() => {}}
                      className="mt-1 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <div className="font-bold text-sm flex items-center gap-1.5 text-slate-900">
                        <Wrench className="w-4 h-4 text-purple-700" />
                        Serviço / Mão de Obra
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Emissão de <strong>NFS-e Municipal</strong> (Manutenção, alinhamento, hora técnica, diária).
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 2. DADOS BÁSICOS (CÓDIGO, DESCRIÇÃO, CATEGORIA, UNIDADE, PREÇO) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Código do Item <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    placeholder="Ex: MFX-LP30-15 ou MFX-MO-HORA"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold uppercase focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="md:col-span-8">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Descrição Completa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Ex: Lente de Proteção Laser D30 Quartzo ou Hora Técnica de Manutenção Mecânica"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Categoria
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as CategoriaItem)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Consumíveis">Consumíveis</option>
                    <option value="Mão de Obra">Mão de Obra</option>
                    <option value="Serviços Laser">Serviços Laser</option>
                    <option value="Serviços Oxicorte">Serviços Oxicorte</option>
                    <option value="Serviços Plasma">Serviços Plasma</option>
                    <option value="Peças & Acessórios">Peças & Acessórios</option>
                  </select>
                </div>

                {/* Unidade de Medida com suporte a HORA (HR), SERVIÇO (UN), DIÁRIA (DIA) */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Unidade de Medida <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={unidadeMedida}
                    onChange={(e) => setUnidadeMedida(e.target.value as UnidadeMedida)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white font-bold"
                  >
                    {tipo === 'servico' ? (
                      <>
                        <option value="HR">HORA (HR) - Apuração por Hora Trabalhada</option>
                        <option value="UN">SERVIÇO (UN) - Valor Fechado por Serviço</option>
                        <option value="DIA">DIÁRIA (DIA) - Diária Técnica em Campo</option>
                      </>
                    ) : (
                      <>
                        <option value="UN">UNIDADE (UN)</option>
                        <option value="PC">PEÇA (PC)</option>
                        <option value="JG">JOGO / KIT (JG)</option>
                        <option value="CX">CAIXA (CX)</option>
                        <option value="MT">METRO (MT)</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Preço Unitário de Venda (R$) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-500 font-bold">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={precoVenda || ''}
                      onChange={(e) => setPrecoVenda(parseFloat(e.target.value) || 0)}
                      placeholder="0,00"
                      className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                {/* Saldo de Estoque (Apenas para Produtos) */}
                {tipo === 'produto' && (
                  <>
                    <div className="md:col-span-6">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Saldo Físico em Estoque
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={estoqueAtual || ''}
                        onChange={(e) => setEstoqueAtual(parseInt(e.target.value, 10) || 0)}
                        placeholder="0"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>

                    <div className="md:col-span-6">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Estoque Mínimo de Alerta
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={estoqueMinimo || ''}
                        onChange={(e) => setEstoqueMinimo(parseInt(e.target.value, 10) || 0)}
                        placeholder="5"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* 3. SEÇÃO FISCAL CONDICIONAL: SE SERVIÇO -> NFS-e; SE PRODUTO -> NF-e */}
              {tipo === 'servico' ? (
                /* ================= BLOCO FISCAL NFS-e (MÃO DE OBRA) ================= */
                <div className="bg-purple-50/70 p-5 rounded-xl border border-purple-200 space-y-4">
                  <div className="flex items-center gap-2 text-purple-900">
                    <Wrench className="w-4 h-4 text-purple-700" />
                    <h4 className="font-bold text-xs uppercase tracking-wider">
                      Campos Fiscais de Prestação de Serviço (NFS-e Municipal / Agudos-SP)
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                    
                    {/* Código LC 116 */}
                    <div className="md:col-span-6">
                      <label className="block font-bold text-slate-700 mb-1">
                        Código do Serviço Municipal / LC 116 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={codigoServicoLc116}
                        onChange={(e) => setCodigoServicoLc116(e.target.value)}
                        placeholder="Ex: 14.01"
                        className="w-full px-2.5 py-1.5 text-xs border border-purple-300 rounded font-mono font-bold bg-white"
                      />
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Ex: 14.01 - Lubrificação, manutenção e conservação de máquinas
                      </span>
                    </div>

                    {/* Código Tributação Municipal (CTISS) */}
                    <div className="md:col-span-6">
                      <label className="block font-bold text-slate-700 mb-1">
                        Código de Tributação Municipal (CTISS / Atividade Municipal)
                      </label>
                      <input
                        type="text"
                        value={codigoTributacaoMunicipal}
                        onChange={(e) => setCodigoTributacaoMunicipal(e.target.value)}
                        placeholder="Ex: 1401-0/01-88"
                        className="w-full px-2.5 py-1.5 text-xs border border-purple-300 rounded font-mono bg-white"
                      />
                    </div>

                    {/* Alíquota ISS (%) */}
                    <div className="md:col-span-3">
                      <label className="block font-bold text-slate-700 mb-1">
                        Alíquota ISS (%) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={aliquotaIss}
                          onChange={(e) => setAliquotaIss(parseFloat(e.target.value) || 0)}
                          placeholder="3.00"
                          className="w-full px-2.5 py-1.5 text-xs border border-purple-300 rounded font-mono font-bold bg-white"
                        />
                        <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-bold">%</span>
                      </div>
                    </div>

                    {/* Exigibilidade do ISS */}
                    <div className="md:col-span-3">
                      <label className="block font-bold text-slate-700 mb-1">
                        Exigibilidade do ISS
                      </label>
                      <select
                        value={exigibilidadeIss}
                        onChange={(e) => setExigibilidadeIss(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 text-xs border border-purple-300 rounded bg-white font-medium"
                      >
                        <option value="1">1 - Exigível</option>
                        <option value="2">2 - Não Incidência</option>
                        <option value="3">3 - Isenção</option>
                        <option value="4">4 - Exportação</option>
                        <option value="5">5 - Imunidade</option>
                        <option value="6">6 - Suspensa Judicial</option>
                        <option value="7">7 - Suspensa Administrativa</option>
                      </select>
                    </div>

                    {/* Retenção de ISS */}
                    <div className="md:col-span-3">
                      <label className="block font-bold text-slate-700 mb-1">
                        Retenção de ISS
                      </label>
                      <select
                        value={retencaoIss ? 'sim' : 'nao'}
                        onChange={(e) => setRetencaoIss(e.target.value === 'sim')}
                        className="w-full px-2.5 py-1.5 text-xs border border-purple-300 rounded bg-white font-medium"
                      >
                        <option value="nao">Não (Retido pelo prestador)</option>
                        <option value="sim">Sim (Retido na fonte pelo tomador)</option>
                      </select>
                    </div>

                    {/* CFOP para Serviços */}
                    <div className="md:col-span-3">
                      <label className="block font-bold text-slate-700 mb-1">
                        CFOP para Serviços
                      </label>
                      <select
                        value={cfopServico}
                        onChange={(e) => setCfopServico(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-purple-300 rounded bg-white font-mono font-bold"
                      >
                        <option value="5933">5933 - Serviço no mesmo município/estado</option>
                        <option value="6933">6933 - Serviço para outro estado</option>
                      </select>
                    </div>

                    {/* Descrição LC 116 detalhada */}
                    <div className="md:col-span-12">
                      <label className="block font-bold text-slate-700 mb-1">
                        Descrição da Atividade (LC 116 / 2003)
                      </label>
                      <input
                        type="text"
                        value={descricaoLc116}
                        onChange={(e) => setDescricaoLc116(e.target.value)}
                        placeholder="Lubrificação, limpeza, revisão, conserto, restauração..."
                        className="w-full px-2.5 py-1.5 text-xs border border-purple-300 rounded bg-white"
                      />
                    </div>

                  </div>
                </div>
              ) : (
                /* ================= BLOCO FISCAL NF-e (PRODUTOS / CONSUMÍVEIS) ================= */
                <div className="bg-amber-50/70 p-5 rounded-xl border border-amber-200 space-y-4">
                  <div className="flex items-center gap-2 text-amber-900">
                    <Package className="w-4 h-4 text-amber-700" />
                    <h4 className="font-bold text-xs uppercase tracking-wider">
                      Campos Fiscais de Produtos e Consumíveis (NF-e Mod. 55 / SEFAZ Estadual)
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                    
                    {/* NCM */}
                    <div className="md:col-span-3">
                      <label className="block font-bold text-slate-700 mb-1">
                        NCM (8 dígitos) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={ncm}
                        onChange={(e) => setNcm(e.target.value)}
                        placeholder="Ex: 9027.90.99"
                        className="w-full px-2.5 py-1.5 text-xs border border-amber-300 rounded font-mono font-bold bg-white"
                      />
                      <span className="text-[10px] text-slate-500 block mt-0.5">Ex: 8466.93.30, 9027.90.99</span>
                    </div>

                    {/* CST / CSOSN */}
                    <div className="md:col-span-3">
                      <label className="block font-bold text-slate-700 mb-1">
                        CST / CSOSN (Simples)
                      </label>
                      <select
                        value={cstCsosn}
                        onChange={(e) => setCstCsosn(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-amber-300 rounded bg-white font-mono font-bold"
                      >
                        <option value="0102">0102 - Tributada pelo Simples s/ crédito</option>
                        <option value="0101">0101 - Tributada pelo Simples c/ crédito</option>
                        <option value="0500">0500 - ICMS cobrado ant. por ST</option>
                        <option value="0400">0400 - Não tributada pelo Simples</option>
                      </select>
                    </div>

                    {/* CFOP */}
                    <div className="md:col-span-3">
                      <label className="block font-bold text-slate-700 mb-1">
                        CFOP (Saída de Mercadoria)
                      </label>
                      <select
                        value={cfopProduto}
                        onChange={(e) => setCfopProduto(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-amber-300 rounded bg-white font-mono font-bold"
                      >
                        <option value="5102">5102 - Venda mercadoria adquirida</option>
                        <option value="5405">5405 - Venda mercadoria c/ Subst. Tributária</option>
                        <option value="6102">6102 - Venda interestadual</option>
                      </select>
                    </div>

                    {/* Origem da Mercadoria */}
                    <div className="md:col-span-3">
                      <label className="block font-bold text-slate-700 mb-1">
                        Origem da Mercadoria
                      </label>
                      <select
                        value={origem}
                        onChange={(e) => setOrigem(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 text-xs border border-amber-300 rounded bg-white font-medium"
                      >
                        <option value="0">0 - Nacional</option>
                        <option value="1">1 - Estrangeira (Importação direta)</option>
                        <option value="2">2 - Estrangeira (Mercado interno)</option>
                        <option value="3">3 - Nacional c/ conteúdo importado &gt; 40%</option>
                      </select>
                    </div>

                  </div>
                </div>
              )}

              {/* Observações Fiscais Adicionais */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Observações Complementares / Fiscais
                </label>
                <input
                  type="text"
                  value={observacoesFiscais}
                  onChange={(e) => setObservacoesFiscais(e.target.value)}
                  placeholder="Ex: Documento emitido por ME ou EPP optante pelo Simples Nacional; Não gera direito a crédito fiscal de IPI."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              {/* Botões do Rodapé */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                >
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>Salvar Dados Fiscais</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
