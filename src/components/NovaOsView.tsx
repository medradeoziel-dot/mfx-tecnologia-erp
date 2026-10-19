import React, { useState, useEffect, useRef } from 'react';
import { Cliente, ItemOS, OrdemServico, CategoriaItem, StatusOS } from '../types';
import { MFX_COMPANY, CATALOGO_PREDEFINIDO } from '../data/company';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { 
  FilePlus2, 
  Plus, 
  Trash2, 
  Calculator, 
  Car, 
  Clock, 
  Utensils, 
  Hotel, 
  Receipt, 
  ShoppingBag, 
  Wrench, 
  Check, 
  AlertTriangle,
  ArrowRight,
  Zap,
  Package,
  Building2,
  MapPin,
  Phone,
  Flame,
  CornerDownLeft
} from 'lucide-react';

interface NovaOsViewProps {
  clientes: Cliente[];
  clienteSelecionadoId?: string;
  onSalvarOS: (novaOS: OrdemServico, abrirImpressao?: boolean, manterNaTela?: boolean) => void;
  onCancelar?: () => void;
}

export const NovaOsView: React.FC<NovaOsViewProps> = ({
  clientes,
  clienteSelecionadoId,
  onSalvarOS,
  onCancelar,
}) => {
  // Cliente e Identificação (inicia TOTALMENTE LIMPO / ZERADO)
  const [clienteId, setClienteId] = useState<string>(
    clienteSelecionadoId || ''
  );

  // Equipamento (inicia limpo sem valores pré-definidos)
  const [equipamentoTipo, setEquipamentoTipo] = useState<'Laser Fibra' | 'Plasma' | 'Oxicorte' | 'Mesa CNC Multifunção' | 'Outro'>('Laser Fibra');
  const [modeloEquipamento, setModeloEquipamento] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [potenciaFonte, setPotenciaFonte] = useState('');

  // Status e Datas
  const [status, setStatus] = useState<StatusOS>('Orçamento');
  const hoje = new Date().toISOString().split('T')[0];
  const [dataAbertura, setDataAbertura] = useState(hoje);
  const dataPrevisaoPadrao = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const [dataPrevisao, setDataPrevisao] = useState(dataPrevisaoPadrao);

  // Custos Operacionais
  const [kmRodados, setKmRodados] = useState<number>(0);
  const [valorUnitarioKm, setValorUnitarioKm] = useState<number>(MFX_COMPANY.valorKmPadrao); // R$ 2,50
  const [horasTrabalhadas, setHorasTrabalhadas] = useState<number>(0);
  const [valorHoraTecnica, setValorHoraTecnica] = useState<number>(MFX_COMPANY.valorHoraPadrao); // R$ 100,00
  const [despesaAlimentacao, setDespesaAlimentacao] = useState<number>(0);
  const [despesaEstadia, setDespesaEstadia] = useState<number>(0);
  const [outrasDespesas, setOutrasDespesas] = useState<number>(0);
  const [descricaoDespesas, setDescricaoDespesas] = useState<string>('');

  // Tabela Dinâmica de Itens (inicia COMPLETAMENTE LIMPA conforme solicitado)
  const [itens, setItens] = useState<ItemOS[]>([]);

  // Linha de Lançamento Rápido de Itens (suporte à tecla ENTER para confirmação contínua)
  const [novoItemTipo, setNovoItemTipo] = useState<'produto' | 'servico'>('produto');
  const [novoItemCodigo, setNovoItemCodigo] = useState('');
  const [novoItemDescricao, setNovoItemDescricao] = useState('');
  const [novoItemUnidade, setNovoItemUnidade] = useState('UN');
  const [novoItemQuantidade, setNovoItemQuantidade] = useState<number>(1);
  const [novoItemPreco, setNovoItemPreco] = useState<string>('');
  const [novoItemCategoria, setNovoItemCategoria] = useState<CategoriaItem>('Consumíveis');

  const clienteSelectRef = useRef<HTMLSelectElement>(null);
  const codigoInputRef = useRef<HTMLInputElement>(null);
  const quantidadeInputRef = useRef<HTMLInputElement>(null);
  const precoInputRef = useRef<HTMLInputElement>(null);
  const [toastMensagem, setToastMensagem] = useState<string | null>(null);

  // Foco inicial automático no primeiro campo ("CLIENTE CADASTRADO")
  useEffect(() => {
    clienteSelectRef.current?.focus();
  }, []);

  // 1. LIMPEZA AUTOMÁTICA DOS CAMPOS AO SALVAR (RESET COMPLETO):
  const resetFormularioOS = () => {
    // 1.c) Limpe todos os campos do cabeçalho
    setClienteId('');
    setModeloEquipamento('');
    setPotenciaFonte('');
    setNumeroSerie('');
    setEquipamentoTipo('Laser Fibra');
    setStatus('Orçamento');
    setDataAbertura(new Date().toISOString().split('T')[0]);
    setDataPrevisao(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);

    // 1.d) Limpe os campos numéricos e subtotais dos Custos Operacionais voltando para R$ 0,00
    setKmRodados(0);
    setHorasTrabalhadas(0);
    setDespesaAlimentacao(0);
    setDespesaEstadia(0);
    setOutrasDespesas(0);
    setDescricaoDespesas('');

    // 1.e) Esvazie completamente a Tabela de Consumíveis e Serviços
    setItens([]);

    // Linha rápida
    setNovoItemCodigo('');
    setNovoItemDescricao('');
    setNovoItemQuantidade(1);
    setNovoItemPreco('');

    // 1.f) Painel "TOTAL DA OS" no topo é derivado e volta para R$ 0,00 automaticamente

    // 2. FOCO INICIAL APÓS LIMPEZA: Reposicione o foco do cursor no primeiro campo ("CLIENTE CADASTRADO")
    setTimeout(() => {
      clienteSelectRef.current?.focus();
    }, 60);
  };

  // Informações Complementares
  const [condicoesPagamento, setCondicoesPagamento] = useState('28 DDL Boleto Bancário Faturado PJ');
  const [prazoGarantia, setPrazoGarantia] = useState('90 dias para serviços técnicos / Garantia fabril para consumíveis');
  const [tecnicoResponsavel, setTecnicoResponsavel] = useState('Oziel Medrade - Especialista Técnico MFx');
  const [observacoesGerais, setObservacoesGerais] = useState(
    'Alinhamento de feixe óptico, inspeção da gaveta de lentes, calibração do sensor capacitivo de altura e teste de corte em chapa de aço carbono 6.35mm.'
  );

  // Selecionar cliente passado por props se mudar
  useEffect(() => {
    if (clienteSelecionadoId) {
      setClienteId(clienteSelecionadoId);
    }
  }, [clienteSelecionadoId]);

  // Cálculos em Tempo Real
  const totalKm = (kmRodados || 0) * (valorUnitarioKm || 0);
  const totalHoras = (horasTrabalhadas || 0) * (valorHoraTecnica || 0);
  const totalDespesas = (despesaAlimentacao || 0) + (despesaEstadia || 0) + (outrasDespesas || 0);
  const totalOperacional = totalKm + totalHoras + totalDespesas;

  const totalItens = itens.reduce((acc, item) => acc + (item.valorTotal || 0), 0);
  
  // SEPARAÇÃO FISCAL EXCLUSIVA (NFS-e MUNICIPAL x NF-e MOD. 55 SEFAZ)
  const itensServicos = itens.filter(
    (it) => it.tipoItem === 'servico' || it.categoria === 'Mão de Obra' || it.categoria.startsWith('Serviços')
  );
  const itensProdutos = itens.filter(
    (it) => it.tipoItem === 'produto' || (!it.tipoItem && !it.categoria.startsWith('Serviços') && it.categoria !== 'Mão de Obra')
  );

  const subtotalNfseServicos = itensServicos.reduce((acc, it) => acc + (it.valorTotal || 0), 0);
  const subtotalNfeProdutos = itensProdutos.reduce((acc, it) => acc + (it.valorTotal || 0), 0);
  const valorTotalGeral = totalOperacional + totalItens;

  // Cliente atual selecionado
  const clienteAtual = clientes.find((c) => c.id === clienteId);

  // Manipulação de código e catálogo inteligente
  const handleCodigoChange = (codigoDigitado: string) => {
    setNovoItemCodigo(codigoDigitado);
    const itemPre = CATALOGO_PREDEFINIDO.find(
      (p) => p.codigo.toLowerCase() === codigoDigitado.trim().toLowerCase()
    );
    if (itemPre) {
      setNovoItemDescricao(itemPre.descricao);
      setNovoItemPreco(itemPre.precoSugerido.toString());
      setNovoItemUnidade(itemPre.unidade);
      setNovoItemTipo(itemPre.tipo);
      setNovoItemCategoria(itemPre.categoria);
    }
  };

  // Alternar Tipo Fiscal na linha rápida
  const handleTipoChange = (tipo: 'produto' | 'servico') => {
    setNovoItemTipo(tipo);
    if (tipo === 'servico') {
      if (novoItemUnidade === 'UN') setNovoItemUnidade('HR');
      setNovoItemCategoria('Mão de Obra');
    } else {
      if (novoItemUnidade === 'HR') setNovoItemUnidade('UN');
      setNovoItemCategoria('Consumíveis');
    }
  };

  // Confirmar e Adicionar Novo Item à Tabela de Verificação
  const handleConfirmarNovoItem = () => {
    const desc = novoItemDescricao.trim() || novoItemCodigo.trim();
    if (!desc) {
      codigoInputRef.current?.focus();
      return;
    }

    const precoNum = parseFloat(String(novoItemPreco).replace(',', '.')) || 0;
    const qtdNum = Number(novoItemQuantidade) || 1;
    const isSrv = novoItemTipo === 'servico';

    const itemNovo: ItemOS = {
      id: `it-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tipoItem: novoItemTipo,
      categoria: novoItemCategoria || (isSrv ? 'Mão de Obra' : 'Consumíveis'),
      codigo: (novoItemCodigo.trim() || (isSrv ? 'MFX-SRV' : 'MFX-ITEM')).toUpperCase(),
      descricao: desc,
      unidade: novoItemUnidade || (isSrv ? 'HR' : 'UN'),
      precoUnitario: precoNum,
      quantidade: qtdNum,
      valorTotal: precoNum * qtdNum,
      prazoEntrega: isSrv ? 'Executado In-loco' : 'Pronta Entrega',
      codigoLc116: isSrv ? '14.01' : undefined,
      aliquotaIss: isSrv ? 3.0 : undefined,
      ncm: !isSrv ? '8466.93.30' : undefined,
      cfop: isSrv ? '5933' : '5102',
    };

    setItens((prev) => [...prev, itemNovo]);

    // Reseta os campos da linha de lançamento rápido em branco
    setNovoItemCodigo('');
    setNovoItemDescricao('');
    setNovoItemQuantidade(1);
    setNovoItemPreco('');
    setNovoItemUnidade(isSrv ? 'HR' : 'UN');

    // Foco automático de volta no campo de Código/Busca da nova linha
    setTimeout(() => {
      codigoInputRef.current?.focus();
    }, 10);
  };

  // Função dedicada para interceptar a tecla ENTER nos campos da tabela
  const adicionarLinhaComEnter = (
    campo: 'codigo' | 'descricao' | 'quantidade' | 'preco' | 'outro',
    e: React.KeyboardEvent
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Impede submissão precoce ou perda de foco

      // a) Se o campo atual for o CÓDIGO (ou Descrição): move o foco direto para o campo QUANTIDADE
      if (campo === 'codigo' || campo === 'descricao') {
        quantidadeInputRef.current?.focus();
        quantidadeInputRef.current?.select();
        return;
      }

      // b) Se o campo atual for a QUANTIDADE ou o VALOR:
      // Confirma o item atual, adiciona a nova linha e move o foco automático para o CÓDIGO
      if (campo === 'quantidade' || campo === 'preco' || campo === 'outro') {
        handleConfirmarNovoItem();
      }
    }
  };

  // Remover Linha de Item
  const handleRemoverItem = (id: string) => {
    setItens((prev) => prev.filter((item) => item.id !== id));
  };

  // Salvar Ordem de Serviço
  const handleSalvar = (abrirImpressao: boolean = true, manterNaTela: boolean = false) => {
    if (!clienteId || !clienteAtual) {
      alert('Por favor, selecione um cliente cadastrado.');
      clienteSelectRef.current?.focus();
      return;
    }

    let itensParaSalvar = [...itens];
    // Se o usuário preencheu a linha rápida mas não apertou Enter antes de Salvar
    if (novoItemDescricao.trim() || novoItemCodigo.trim()) {
      const precoNum = parseFloat(String(novoItemPreco).replace(',', '.')) || 0;
      const qtdNum = Number(novoItemQuantidade) || 1;
      const isSrv = novoItemTipo === 'servico';
      itensParaSalvar.push({
        id: `it-${Date.now()}`,
        tipoItem: novoItemTipo,
        categoria: novoItemCategoria || (isSrv ? 'Mão de Obra' : 'Consumíveis'),
        codigo: (novoItemCodigo.trim() || (isSrv ? 'MFX-SRV' : 'MFX-ITEM')).toUpperCase(),
        descricao: novoItemDescricao.trim() || novoItemCodigo.trim(),
        unidade: novoItemUnidade || (isSrv ? 'HR' : 'UN'),
        precoUnitario: precoNum,
        quantidade: qtdNum,
        valorTotal: precoNum * qtdNum,
        prazoEntrega: isSrv ? 'Executado In-loco' : 'Pronta Entrega',
        codigoLc116: isSrv ? '14.01' : undefined,
        aliquotaIss: isSrv ? 3.0 : undefined,
        ncm: !isSrv ? '8466.93.30' : undefined,
        cfop: isSrv ? '5933' : '5102',
      });
    }

    if (itensParaSalvar.length === 0 && totalOperacional === 0) {
      alert('Inclua ao menos um item de serviço/consumível ou informe custos operacionais.');
      return;
    }

    const ano = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const numeroOS = `OS-${ano}-${rand}`;

    const novaOS: OrdemServico = {
      id: `os-${Date.now()}`,
      numeroOS,
      clienteId: clienteAtual.id,
      clienteNome: clienteAtual.nome,
      clienteNomeFantasia: clienteAtual.nomeFantasia,
      clienteDocumento: clienteAtual.documento,
      clienteInscricaoEstadual: clienteAtual.inscricaoEstadual,
      clienteTelefone: clienteAtual.telefone,
      clienteCelular: clienteAtual.celular,
      clienteEmail: clienteAtual.email,
      clienteEndereco: `${clienteAtual.logradouro}, ${clienteAtual.numero}${clienteAtual.complemento ? ' - ' + clienteAtual.complemento : ''} - ${clienteAtual.bairro}`,
      clienteCidade: clienteAtual.cidade,
      clienteEstado: clienteAtual.estado,
      clienteCep: clienteAtual.cep,

      equipamentoTipo,
      modeloEquipamento,
      numeroSerie,
      potenciaFonte,

      dataAbertura,
      dataPrevisao,
      status,

      kmRodados,
      valorUnitarioKm,
      horasTrabalhadas,
      valorHoraTecnica,
      despesaAlimentacao,
      despesaEstadia,
      outrasDespesas,
      descricaoDespesas,

      itens,

      condicoesPagamento,
      prazoGarantia,
      tecnicoResponsavel,
      observacoesGerais,

      totalKm,
      totalHoras,
      totalDespesas,
      totalOperacional,
      totalItens,
      valorTotalGeral,
    };

    onSalvarOS(novaOS, abrirImpressao, manterNaTela);

    if (manterNaTela || !abrirImpressao) {
      // 1.a) Exiba uma mensagem/toast de confirmação de sucesso
      setToastMensagem(`✅ Ordem de Serviço ${numeroOS} salva com sucesso!`);
      // 1.b até 1.f e 2) Limpeza automática de todos os campos e reposicionamento de foco
      resetFormularioOS();
      setTimeout(() => {
        setToastMensagem(null);
      }, 5000);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Flutuante de Confirmação de Sucesso (Requisito 1.a) */}
      {toastMensagem && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-emerald-400 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-base shadow-inner">
            ✓
          </div>
          <div>
            <div className="font-bold text-sm tracking-wide">{toastMensagem}</div>
            <div className="text-[11px] text-emerald-100">Formulário resetado com sucesso. Pronto para o próximo atendimento!</div>
          </div>
          <button
            onClick={() => setToastMensagem(null)}
            className="ml-3 text-emerald-200 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded hover:bg-emerald-700/50 transition cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
      {/* Cabeçalho Superior Simplificado (Direto ao Ponto) */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* 1. Nome/Título Principal e Subtítulo Discreto (Lado Esquerdo) */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 shadow-sm shrink-0">
            <Flame className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight flex items-center gap-1.5 leading-none">
              <span>MF<span className="text-red-600">x</span></span>
              <span className="text-slate-900 font-extrabold uppercase">TECNOLOGIA INDUSTRIAL</span>
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Ordem de Serviço & Assistência Técnica
            </p>
          </div>
        </div>

        {/* 2. Card Escuro Simplificado "TOTAL DA OS" (Lado Direito) */}
        <div className="bg-slate-950 text-white px-6 py-4 rounded-xl shadow-md border-l-4 border-amber-500 border border-slate-800 min-w-[220px]">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span>TOTAL DA OS</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1 tracking-tight">
            {formatCurrency(valorTotalGeral)}
          </div>
        </div>
      </div>

      {/* 1. SELEÇÃO DE CLIENTE E EQUIPAMENTO */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-red-600 text-[11px] flex items-center justify-center font-mono">1</span>
            Identificação do Cliente e Tecnologia da Máquina
          </h2>
          <span className="text-xs text-slate-400">Vínculo com tabela MySQL: clientes</span>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Seleção do Cliente */}
            <div className="md:col-span-6">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Cliente Cadastrado <span className="text-red-500">*</span>
              </label>
              <select
                ref={clienteSelectRef}
                id="cliente_id"
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                required
              >
                <option value="" disabled>-- Selecione um Cliente Cadastrado --</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} ({c.cidade}/{c.estado}) - {c.documento}
                  </option>
                ))}
              </select>

              {clienteAtual && (
                <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-slate-800">{clienteAtual.nome}</div>
                  <div className="text-slate-600">
                    {clienteAtual.logradouro}, {clienteAtual.numero} - {clienteAtual.bairro}, {clienteAtual.cidade}/{clienteAtual.estado} - CEP: {clienteAtual.cep}
                  </div>
                  <div className="text-slate-600 font-mono">
                    CNPJ/CPF: {clienteAtual.documento} | WhatsApp: {clienteAtual.celular || clienteAtual.telefone || 'Não informado'}
                  </div>
                </div>
              )}
            </div>

            {/* Tecnologia do Equipamento */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tecnologia / Máquina <span className="text-red-500">*</span>
              </label>
              <select
                value={equipamentoTipo}
                onChange={(e) => setEquipamentoTipo(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-semibold"
              >
                <option value="Laser Fibra">Laser Fibra Óptica</option>
                <option value="Plasma">Plasma Alta Definição</option>
                <option value="Oxicorte">Oxicorte Pantográfico / CNC</option>
                <option value="Mesa CNC Multifunção">Mesa CNC Híbrida (Laser + Plasma)</option>
                <option value="Outro">Outro Equipamento Industrial</option>
              </select>
            </div>

            {/* Status da OS */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Status da OS
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-semibold"
              >
                <option value="Orçamento">Orçamento Inicial</option>
                <option value="Aprovado">Aprovado pelo Cliente</option>
                <option value="Em Execução">Em Execução Técnica</option>
                <option value="Concluído">Concluído</option>
                <option value="Faturado">Faturado / Aguardando Pagamento</option>
              </select>
            </div>

            {/* Modelo do Equipamento */}
            <div className="md:col-span-6">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Modelo da Máquina / Fabricante / Cabeçote
              </label>
              <input
                type="text"
                value={modeloEquipamento}
                onChange={(e) => setModeloEquipamento(e.target.value)}
                placeholder="Ex: Mesa CNC Laser 3015 - Cabeçote Raytools BM111"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Potência ou Capacidade */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Potência da Fonte / Tocha
              </label>
              <input
                type="text"
                value={potenciaFonte}
                onChange={(e) => setPotenciaFonte(e.target.value)}
                placeholder="Ex: 3000W Raycus / Hypertherm 105A"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Data de Abertura */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Data de Emissão
              </label>
              <input
                type="date"
                value={dataAbertura}
                onChange={(e) => setDataAbertura(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

          </div>
        </div>
      </div>

      {/* 2. CUSTOS OPERACIONAIS (KM, HORAS TÉCNICAS E DESPESAS) */}
      <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden border-l-4 border-l-red-600">
        <div className="bg-slate-900 text-white px-6 py-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-red-600 text-[11px] flex items-center justify-center font-mono">2</span>
            Custos Operacionais de Deslocamento e Mão de Obra Técnica
          </h2>
          <span className="text-xs bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded font-mono">
            Subtotal Operacional: {formatCurrency(totalOperacional)}
          </span>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

            {/* Quilometragem Rodada */}
            <div className="md:col-span-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-red-600" />
                Quilometragem (KM)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={kmRodados || ''}
                    onChange={(e) => setKmRodados(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-1.5 text-sm font-mono font-bold border border-slate-300 rounded focus:ring-2 focus:ring-red-500 bg-white"
                  />
                  <span className="absolute right-2.5 top-2 text-xs text-slate-400 font-semibold">KM</span>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">Valor/KM:</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">R$</span>
                  <input
                    type="number"
                    step="0.10"
                    value={valorUnitarioKm}
                    onChange={(e) => setValorUnitarioKm(parseFloat(e.target.value) || 0)}
                    className="w-16 px-1.5 py-0.5 text-xs text-right border border-slate-300 rounded font-mono font-semibold"
                  />
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 text-xs flex justify-between font-bold text-slate-900">
                <span>Subtotal KM:</span>
                <span className="text-red-700 font-mono">{formatCurrency(totalKm)}</span>
              </div>
            </div>

            {/* Horas Técnicas */}
            <div className="md:col-span-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                Horas Trabalhadas
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={horasTrabalhadas || ''}
                    onChange={(e) => setHorasTrabalhadas(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-1.5 text-sm font-mono font-bold border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                  <span className="absolute right-2.5 top-2 text-xs text-slate-400 font-semibold">Horas</span>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">Valor Hora:</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">R$</span>
                  <input
                    type="number"
                    step="5.00"
                    value={valorHoraTecnica}
                    onChange={(e) => setValorHoraTecnica(parseFloat(e.target.value) || 0)}
                    className="w-20 px-1.5 py-0.5 text-xs text-right border border-slate-300 rounded font-mono font-semibold"
                  />
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 text-xs flex justify-between font-bold text-slate-900">
                <span>Subtotal Mão de Obra:</span>
                <span className="text-amber-700 font-mono">{formatCurrency(totalHoras)}</span>
              </div>
            </div>

            {/* Despesas Extras: Alimentação e Estadia */}
            <div className="md:col-span-6 bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  Despesas de Viagem (Alimentação, Estadia e Outros)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">Alimentação (R$)</span>
                    <input
                      type="number"
                      step="5.00"
                      value={despesaAlimentacao || ''}
                      onChange={(e) => setDespesaAlimentacao(parseFloat(e.target.value) || 0)}
                      placeholder="0,00"
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">Estadia/Hosped. (R$)</span>
                    <input
                      type="number"
                      step="10.00"
                      value={despesaEstadia || ''}
                      onChange={(e) => setDespesaEstadia(parseFloat(e.target.value) || 0)}
                      placeholder="0,00"
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">Pedágio / Outros (R$)</span>
                    <input
                      type="number"
                      step="5.00"
                      value={outrasDespesas || ''}
                      onChange={(e) => setOutrasDespesas(parseFloat(e.target.value) || 0)}
                      placeholder="0,00"
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-mono"
                    />
                  </div>
                </div>

                <div className="mt-2">
                  <input
                    type="text"
                    value={descricaoDespesas}
                    onChange={(e) => setDescricaoDespesas(e.target.value)}
                    placeholder="Descrição das despesas (Ex: Pedágio Rod. Marechal Rondon ida/volta, almoço equipe)"
                    className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-200 text-xs flex justify-between font-bold text-slate-900">
                <span>Subtotal Despesas Extras:</span>
                <span className="text-emerald-700 font-mono">{formatCurrency(totalDespesas)}</span>
              </div>
            </div>

          </div>

          {/* Visual calculation explanation bar */}
          <div className="bg-red-50/70 border border-red-200 rounded-lg p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-700">
              <Calculator className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                Fórmula Operacional: <strong className="font-mono text-slate-900">({kmRodados || 0} km × R$ {formatNumber(valorUnitarioKm)}) + ({horasTrabalhadas || 0} h × R$ {formatNumber(valorHoraTecnica)}) + R$ {formatNumber(totalDespesas)}</strong>
              </span>
            </div>
            <div className="font-bold text-red-900 font-mono text-sm self-end sm:self-auto">
              = {formatCurrency(totalOperacional)}
            </div>
          </div>
        </div>
      </div>

      {/* 3. SEÇÃO DINÂMICA DE ITENS (CONSUMÍVEIS E SERVIÇOS) COM SUPORTE NF-e / NFS-e */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-red-600 text-[11px] flex items-center justify-center font-mono font-bold">3</span>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider">
                Tabela de Consumíveis e Mão de Obra Técnica
              </h2>
              <div className="text-[10px] text-slate-400">
                Pressione ENTER em qualquer campo para confirmar e abrir uma nova linha automaticamente
              </div>
            </div>
          </div>
          <span className="text-xs bg-slate-800 text-amber-300 border border-slate-700 px-3 py-1 rounded-lg font-mono font-bold">
            Subtotal: {formatCurrency(totalItens)}
          </span>
        </div>

        {/* ÁREA DE LANÇAMENTO RÁPIDO CONTÍNUO (ENTER PARA CONFIRMAR E AVANÇAR) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-800">
              <CornerDownLeft className="w-3.5 h-3.5 text-red-600" />
              Lançamento Rápido de Linha (Pressione [ENTER] para confirmar e avançar)
            </span>
            <span className="text-[11px] font-normal text-slate-500 hidden sm:inline">
              [TAB] navega • [ENTER] confirma e adiciona linha
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
            {/* Tipo Fiscal */}
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Tipo Fiscal
              </label>
              <select
                value={novoItemTipo}
                onChange={(e) => handleTipoChange(e.target.value as 'produto' | 'servico')}
                onKeyDown={(e) => adicionarLinhaComEnter('outro', e)}
                className="w-full text-xs font-bold py-1.5 px-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="produto">📦 NF-e (Peça)</option>
                <option value="servico">🛠️ NFS-e (Srv)</option>
              </select>
            </div>

            {/* Código / Sugestão */}
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Código
              </label>
              <input
                ref={codigoInputRef}
                type="text"
                value={novoItemCodigo}
                onChange={(e) => handleCodigoChange(e.target.value)}
                onKeyDown={(e) => adicionarLinhaComEnter('codigo', e)}
                placeholder="Ex: MFX-LP30"
                list="catalogoSugestoes"
                className="w-full text-xs font-mono font-bold py-1.5 px-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <datalist id="catalogoSugestoes">
                {CATALOGO_PREDEFINIDO.map((item) => (
                  <option key={item.codigo} value={item.codigo}>
                    {item.descricao} ({item.unidade} - R$ {item.precoSugerido.toFixed(2)})
                  </option>
                ))}
              </datalist>
            </div>

            {/* Descrição */}
            <div className="sm:col-span-4">
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Descrição do Item ou Serviço <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={novoItemDescricao}
                onChange={(e) => setNovoItemDescricao(e.target.value)}
                onKeyDown={(e) => adicionarLinhaComEnter('descricao', e)}
                placeholder="Descrição do consumível, peça ou serviço..."
                className="w-full text-xs py-1.5 px-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Unidade */}
            <div className="sm:col-span-1">
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1 text-center">
                Unid.
              </label>
              <select
                value={novoItemUnidade}
                onChange={(e) => setNovoItemUnidade(e.target.value)}
                onKeyDown={(e) => adicionarLinhaComEnter('outro', e)}
                className="w-full text-xs font-bold py-1.5 px-1 border border-slate-300 rounded-lg text-center bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="UN">UN</option>
                <option value="HR">HR</option>
                <option value="PC">PC</option>
                <option value="JG">JG</option>
                <option value="CX">CX</option>
                <option value="DIA">DIA</option>
                <option value="MT">MT</option>
              </select>
            </div>

            {/* Quantidade */}
            <div className="sm:col-span-1">
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1 text-center">
                Qtd
              </label>
              <input
                ref={quantidadeInputRef}
                type="number"
                min="1"
                step="1"
                value={novoItemQuantidade}
                onChange={(e) => setNovoItemQuantidade(Math.max(1, parseFloat(e.target.value) || 1))}
                onKeyDown={(e) => adicionarLinhaComEnter('quantidade', e)}
                className="w-full text-xs font-mono font-bold py-1.5 px-1 border border-slate-300 rounded-lg text-center bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Valor Unitário */}
            <div className="sm:col-span-1">
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1 text-right">
                Valor (R$)
              </label>
              <input
                ref={precoInputRef}
                type="number"
                step="0.01"
                min="0"
                value={novoItemPreco}
                onChange={(e) => setNovoItemPreco(e.target.value)}
                onKeyDown={(e) => adicionarLinhaComEnter('preco', e)}
                placeholder="0,00"
                className="w-full text-xs font-mono font-semibold py-1.5 px-2 border border-slate-300 rounded-lg text-right bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Botão Adicionar Linha */}
            <div className="sm:col-span-1">
              <button
                type="button"
                onClick={handleConfirmarNovoItem}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1 shadow-sm transition active:scale-95 cursor-pointer h-[34px]"
                title="Pressione ENTER para adicionar e abrir nova linha"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Adicionar</span>
              </button>
            </div>
          </div>
        </div>

        {/* TABELA DE VERIFICAÇÃO / RESUMO DOS ITENS LANÇADOS */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800 text-white uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="py-2.5 px-3 w-[120px]">Tipo Fiscal</th>
                <th className="py-2.5 px-3 w-[130px]">Código</th>
                <th className="py-2.5 px-4">Descrição</th>
                <th className="py-2.5 px-3 w-[70px] text-center">Unid.</th>
                <th className="py-2.5 px-3 w-[80px] text-center">Qtd</th>
                <th className="py-2.5 px-3 w-[120px] text-right">Valor Unitário</th>
                <th className="py-2.5 px-3 w-[130px] text-right">Subtotal (R$)</th>
                <th className="py-2.5 px-3 w-[50px] text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {itens.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    <p className="font-semibold text-slate-600">Nenhum item lançado ainda na Ordem de Serviço.</p>
                    <p className="text-[11px] mt-1 text-slate-400">
                      Preencha os campos na linha acima e pressione <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-700 font-mono text-[10px]">ENTER</kbd> para adicionar o primeiro item.
                    </p>
                  </td>
                </tr>
              ) : (
                itens.map((item) => {
                  const isSrv = item.tipoItem === 'servico' || item.categoria === 'Mão de Obra' || item.categoria.startsWith('Serviços');
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isSrv
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {isSrv ? '🛠️ NFS-e Srv' : '📦 NF-e Peça'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                        {item.codigo}
                      </td>
                      <td className="py-2.5 px-4 text-slate-900 font-medium">
                        {item.descricao}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-600">
                        {item.unidade}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                        {item.quantidade}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        {formatCurrency(item.precoUnitario)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                        {formatCurrency(item.valorTotal)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoverItem(item.id)}
                          className="text-slate-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition cursor-pointer"
                          title="Remover este item da OS"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {itens.length > 0 && (
              <tfoot className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                <tr>
                  <td colSpan={4} className="py-2.5 px-4 text-xs text-slate-600">
                    Total de Itens Lançados: <strong className="text-slate-900 font-mono">{itens.length}</strong>
                  </td>
                  <td colSpan={2} className="py-2.5 px-3 text-right uppercase text-xs text-slate-700">
                    Subtotal de Consumíveis e Serviços:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-sm font-black text-red-700">
                    {formatCurrency(totalItens)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* DEMONSTRATIVO FISCAL DINÂMICO PARA FATURAMENTO (NFS-e x NF-e) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-slate-600" />
            Demonstrativo de Emissão Fiscal (Split Tributário Automático para o Faturamento):
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Bloco 1: NFS-e */}
            <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-purple-700" />
                  Nota Fiscal Eletrônica de Serviços (NFS-e Municipal)
                </span>
                <span className="text-[10px] bg-purple-200 text-purple-900 font-mono font-bold px-1.5 py-0.5 rounded">
                  {itensServicos.length} itens
                </span>
              </div>
              <div className="text-[11px] text-purple-950 space-y-0.5">
                <div>• Incidência: <strong>ISS Agudos-SP (3,00%)</strong></div>
                <div>• Código de Serviço Principal: <strong>LC 116 Item 14.01</strong></div>
                <div>• CFOP Predominante: <strong>5933 (Prestação Municipal)</strong></div>
              </div>
              <div className="mt-2 pt-2 border-t border-purple-200 flex justify-between items-center text-xs">
                <span className="font-bold text-purple-900">Subtotal NFS-e (Mão de Obra):</span>
                <span className="font-mono font-black text-purple-900 text-sm">{formatCurrency(subtotalNfseServicos)}</span>
              </div>
            </div>

            {/* Bloco 2: NF-e Mod. 55 */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-amber-700" />
                  Nota Fiscal Eletrônica de Produtos (NF-e Mod. 55 / SEFAZ)
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-900 font-mono font-bold px-1.5 py-0.5 rounded">
                  {itensProdutos.length} itens
                </span>
              </div>
              <div className="text-[11px] text-amber-950 space-y-0.5">
                <div>• Incidência: <strong>ICMS Simples Nacional (CSOSN 0102)</strong></div>
                <div>• CFOP Predominante: <strong>5102 (Venda Mercadorias / Peças)</strong></div>
                <div>• NCMs aplicáveis: <strong>8466.93.30 / 9027.90.99</strong></div>
              </div>
              <div className="mt-2 pt-2 border-t border-amber-200 flex justify-between items-center text-xs">
                <span className="font-bold text-amber-900">Subtotal NF-e (Consumíveis):</span>
                <span className="font-mono font-black text-amber-900 text-sm">{formatCurrency(subtotalNfeProdutos)}</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 4. CONDIÇÕES GERAIS, GARANTIA E RESUMO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Termos e Observações */}
        <div className="lg:col-span-7 bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Wrench className="w-4 h-4 text-slate-600" />
            Condições Comerciais, Técnicas e Garantia
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Condições de Pagamento
              </label>
              <input
                type="text"
                value={condicoesPagamento}
                onChange={(e) => setCondicoesPagamento(e.target.value)}
                placeholder="Ex: 28 DDL Boleto / 50% entrada"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Prazo de Garantia
              </label>
              <input
                type="text"
                value={prazoGarantia}
                onChange={(e) => setPrazoGarantia(e.target.value)}
                placeholder="Ex: 90 dias serviços / Defeito fabril consumíveis"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Técnico Especialista Responsável
            </label>
            <input
              type="text"
              value={tecnicoResponsavel}
              onChange={(e) => setTecnicoResponsavel(e.target.value)}
              placeholder="Ex: Oziel Medrade - MFx Tecnologia Industrial"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Observações Técnicas / Recomendações
            </label>
            <textarea
              rows={3}
              value={observacoesGerais}
              onChange={(e) => setObservacoesGerais(e.target.value)}
              placeholder="Descreva detalhes do atendimento, estado do cabeçote laser, lentes limpas, etc."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Resumo Financeiro Completo */}
        <div className="lg:col-span-5 bg-slate-950 text-white rounded-xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-200">
                Resumo Geral da OS
              </h3>
              <span className="text-xs bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded font-mono">
                {itens.length} itens inclusos
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-purple-300 bg-purple-950/40 p-1.5 rounded border border-purple-900/60 font-semibold">
                <span>• Subtotal NFS-e (Serviços):</span>
                <span className="font-mono">{formatCurrency(subtotalNfseServicos)}</span>
              </div>
              <div className="flex justify-between text-amber-300 bg-amber-950/40 p-1.5 rounded border border-amber-900/60 font-semibold">
                <span>• Subtotal NF-e (Peças):</span>
                <span className="font-mono">{formatCurrency(subtotalNfeProdutos)}</span>
              </div>
              <div className="flex justify-between text-slate-300 pt-1">
                <span>Deslocamento Técnico ({kmRodados} km):</span>
                <span className="font-mono">{formatCurrency(totalKm)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Horas Técnicas ({horasTrabalhadas} h):</span>
                <span className="font-mono">{formatCurrency(totalHoras)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Despesas de Viagem/Estadia:</span>
                <span className="font-mono">{formatCurrency(totalDespesas)}</span>
              </div>
              <div className="flex justify-between text-slate-200 font-semibold pt-1 border-t border-slate-800">
                <span>Subtotal Operacional:</span>
                <span className="font-mono text-amber-400">{formatCurrency(totalOperacional)}</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t-2 border-slate-700">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">
                VALOR TOTAL DA ORDEM DE SERVIÇO
              </div>
              <div className="text-3xl font-black text-amber-400 font-mono tracking-tight">
                {formatCurrency(valorTotalGeral)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Inclui fornecimento de consumíveis, deslocamento e serviço técnico in-loco.
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
            <button
              type="button"
              onClick={() => handleSalvar(false, true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition text-sm cursor-pointer"
            >
              <Check className="w-4 h-4 text-white" />
              <span>Salvar e Iniciar Próxima OS (Limpar Formulário)</span>
            </button>
            <button
              type="button"
              onClick={() => handleSalvar(true, false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 px-4 rounded-lg border border-slate-700 transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5 text-amber-400" />
              <span>Salvar e Imprimir Relatório A4 (imprimir_os.php)</span>
            </button>
            <button
              type="button"
              onClick={resetFormularioOS}
              className="w-full bg-transparent hover:bg-slate-900 text-slate-400 hover:text-slate-200 py-1.5 px-4 rounded-lg border border-slate-800 transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Limpar Formulário Manualmente (Reset)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
