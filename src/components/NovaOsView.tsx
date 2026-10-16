import React, { useState, useEffect } from 'react';
import { Cliente, ItemOS, OrdemServico, CategoriaItem, StatusOS } from '../types';
import { MFX_COMPANY, CATALOGO_PREDEFINIDO, ItemPredefinido } from '../data/company';
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
  Sparkles,
  Zap
} from 'lucide-react';

interface NovaOsViewProps {
  clientes: Cliente[];
  clienteSelecionadoId?: string;
  onSalvarOS: (novaOS: OrdemServico, abrirImpressao?: boolean) => void;
  onCancelar?: () => void;
}

export const NovaOsView: React.FC<NovaOsViewProps> = ({
  clientes,
  clienteSelecionadoId,
  onSalvarOS,
  onCancelar,
}) => {
  // Cliente e Identificação
  const [clienteId, setClienteId] = useState<string>(
    clienteSelecionadoId || (clientes.length > 0 ? clientes[0].id : '')
  );

  // Equipamento
  const [equipamentoTipo, setEquipamentoTipo] = useState<'Laser Fibra' | 'Plasma' | 'Oxicorte' | 'Mesa CNC Multifunção' | 'Outro'>('Laser Fibra');
  const [modeloEquipamento, setModeloEquipamento] = useState('Mesa CNC Laser Fibra 3015 - Cabeçote Raytools BM111');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [potenciaFonte, setPotenciaFonte] = useState('3000W Raycus');

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

  // Tabela Dinâmica de Itens
  const [itens, setItens] = useState<ItemOS[]>([
    {
      id: `it-${Date.now()}-1`,
      categoria: 'Consumíveis',
      codigo: 'MFX-LP30-15',
      descricao: 'Lente de Proteção Laser Fibra D30 x 1.5mm Quartzo Fundido 1064nm',
      precoUnitario: 120.0,
      quantidade: 2,
      valorTotal: 240.0,
      prazoEntrega: 'Pronta Entrega',
    },
    {
      id: `it-${Date.now()}-2`,
      categoria: 'Consumíveis',
      codigo: 'MFX-BD-15',
      descricao: 'Bico Laser Duplo Cromado D32 H15 Calibre 1.5mm',
      precoUnitario: 85.0,
      quantidade: 3,
      valorTotal: 255.0,
      prazoEntrega: 'Pronta Entrega',
    },
  ]);

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
  const valorTotalGeral = totalOperacional + totalItens;

  // Cliente atual selecionado
  const clienteAtual = clientes.find((c) => c.id === clienteId);

  // Adicionar Linha Vazia de Item
  const handleAdicionarItemVazio = () => {
    const novoItem: ItemOS = {
      id: `it-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      categoria: 'Consumíveis',
      codigo: 'MFX-ITEM',
      descricao: '',
      precoUnitario: 0,
      quantidade: 1,
      valorTotal: 0,
      prazoEntrega: 'Pronta Entrega',
    };
    setItens([...itens, novoItem]);
  };

  // Adicionar Item do Catálogo Rápido
  const handleAdicionarPredefinido = (itemPredef: ItemPredefinido) => {
    const novoItem: ItemOS = {
      id: `it-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      categoria: itemPredef.categoria,
      codigo: itemPredef.codigo,
      descricao: itemPredef.descricao,
      precoUnitario: itemPredef.precoSugerido,
      quantidade: 1,
      valorTotal: itemPredef.precoSugerido,
      prazoEntrega: itemPredef.prazoSugerido,
    };
    setItens([...itens, novoItem]);
  };

  // Atualizar Item Específico
  const handleAtualizarItem = (id: string, campo: keyof ItemOS, valor: any) => {
    setItens((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const atualizado = { ...item, [campo]: valor };
        // Recalcular valorTotal da linha se preço ou quantidade mudarem
        if (campo === 'precoUnitario' || campo === 'quantidade') {
          const preco = campo === 'precoUnitario' ? Number(valor) : item.precoUnitario;
          const qtd = campo === 'quantidade' ? Number(valor) : item.quantidade;
          atualizado.valorTotal = (preco || 0) * (qtd || 0);
        }
        return atualizado;
      })
    );
  };

  // Remover Linha de Item
  const handleRemoverItem = (id: string) => {
    setItens((prev) => prev.filter((item) => item.id !== id));
  };

  // Salvar Ordem de Serviço
  const handleSalvar = (abrirImpressao: boolean) => {
    if (!clienteId || !clienteAtual) {
      alert('Por favor, selecione um cliente cadastrado.');
      return;
    }

    if (itens.length === 0 && totalOperacional === 0) {
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

    onSalvarOS(novaOS, abrirImpressao);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold font-mono uppercase tracking-wider bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
              Módulo: nova_os.php
            </span>
            <span className="text-xs text-slate-500 font-medium">| MFx Tecnologia Industrial</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FilePlus2 className="w-6 h-6 text-red-600" />
            Lançamento de Chamado e Ordem de Serviço (OS)
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Cálculo em tempo real de deslocamento (<code className="font-mono text-red-600 font-bold">KM × R$ 2,50</code>), mão de obra técnica (<code className="font-mono text-red-600 font-bold">Horas × R$ 100,00</code>) e tabela dinâmica de consumíveis de Laser, Plasma e Oxicorte.
          </p>
        </div>

        {/* Live Total Badge */}
        <div className="bg-slate-950 text-white p-4 rounded-xl shadow-md border-l-4 border-amber-500 min-w-[220px]">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold flex items-center justify-between">
            <span>Total da OS</span>
            <Calculator className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">
            {formatCurrency(valorTotalGeral)}
          </div>
          <div className="text-[10px] text-slate-300 mt-1">
            Operacional: {formatCurrency(totalOperacional)} | Itens: {formatCurrency(totalItens)}
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
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                required
              >
                <option value="">Selecione o cliente...</option>
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

      {/* 3. SEÇÃO DINÂMICA DE ITENS (CONSUMÍVEIS E SERVIÇOS) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-red-600 text-[11px] flex items-center justify-center font-mono font-bold">3</span>
            <h2 className="text-sm font-bold uppercase tracking-wider">
              Tabela de Consumíveis e Serviços Técnicos
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAdicionarItemVazio}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Linha
            </button>
          </div>
        </div>

        {/* Quick Presets Picker */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Inserção Rápida de Itens Frequentes (Consumíveis Laser, Plasma & Serviços):
          </div>
          <div className="flex flex-wrap gap-2">
            {CATALOGO_PREDEFINIDO.map((itemPredef, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAdicionarPredefinido(itemPredef)}
                className="bg-white hover:bg-red-50 text-slate-800 hover:text-red-700 border border-slate-300 hover:border-red-300 px-2.5 py-1 rounded text-xs transition flex items-center gap-1 shadow-2xs"
                title={`Adicionar: ${itemPredef.descricao}`}
              >
                <Plus className="w-3 h-3 text-red-500" />
                <span className="font-semibold">{itemPredef.codigo}</span>
                <span className="text-slate-500 text-[11px]">({formatCurrency(itemPredef.precoSugerido)})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Table of Dynamic Items */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800 text-white uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="py-2.5 px-3 w-[160px]">Categoria</th>
                <th className="py-2.5 px-3 w-[130px]">Código</th>
                <th className="py-2.5 px-3">Descrição do Consumível ou Serviço</th>
                <th className="py-2.5 px-3 w-[110px] text-right">Preço Unit. (R$)</th>
                <th className="py-2.5 px-3 w-[75px] text-center">Qtd</th>
                <th className="py-2.5 px-3 w-[110px] text-right">Total (R$)</th>
                <th className="py-2.5 px-3 w-[140px]">Prazo Entrega</th>
                <th className="py-2.5 px-3 w-[50px] text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {itens.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-500">
                    Nenhum item adicionado ainda. Clique no botão acima para adicionar.
                  </td>
                </tr>
              ) : (
                itens.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    
                    {/* Categoria */}
                    <td className="py-2 px-3">
                      <select
                        value={item.categoria}
                        onChange={(e) => handleAtualizarItem(item.id, 'categoria', e.target.value as CategoriaItem)}
                        className="w-full text-xs py-1 px-1.5 border border-slate-300 rounded font-medium bg-white"
                      >
                        <option value="Consumíveis">Consumíveis</option>
                        <option value="Serviços Laser">Serviços Laser</option>
                        <option value="Serviços Oxicorte">Serviços Oxicorte</option>
                        <option value="Serviços Plasma">Serviços Plasma</option>
                        <option value="Peças & Acessórios">Peças & Acessórios</option>
                      </select>
                    </td>

                    {/* Código */}
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.codigo}
                        onChange={(e) => handleAtualizarItem(item.id, 'codigo', e.target.value)}
                        placeholder="Ex: MFX-LP30"
                        className="w-full text-xs font-mono font-bold py-1 px-2 border border-slate-300 rounded text-center bg-white"
                      />
                    </td>

                    {/* Descrição */}
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.descricao}
                        onChange={(e) => handleAtualizarItem(item.id, 'descricao', e.target.value)}
                        placeholder="Descrição do consumível ou serviço realizado..."
                        className="w-full text-xs py-1 px-2 border border-slate-300 rounded bg-white"
                        required
                      />
                    </td>

                    {/* Preço Unitário */}
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.precoUnitario}
                        onChange={(e) => handleAtualizarItem(item.id, 'precoUnitario', parseFloat(e.target.value) || 0)}
                        className="w-full text-xs py-1 px-2 text-right font-mono font-semibold border border-slate-300 rounded bg-white"
                      />
                    </td>

                    {/* Quantidade */}
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantidade}
                        onChange={(e) => handleAtualizarItem(item.id, 'quantidade', parseFloat(e.target.value) || 1)}
                        className="w-full text-xs py-1 px-1 text-center font-mono font-bold border border-slate-300 rounded bg-white"
                      />
                    </td>

                    {/* Valor Total Calculado */}
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 bg-slate-50/50">
                      {formatCurrency(item.valorTotal)}
                    </td>

                    {/* Prazo de Entrega */}
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.prazoEntrega}
                        onChange={(e) => handleAtualizarItem(item.id, 'prazoEntrega', e.target.value)}
                        placeholder="Pronta Entrega"
                        className="w-full text-xs py-1 px-2 border border-slate-300 rounded bg-white"
                      />
                    </td>

                    {/* Remover */}
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoverItem(item.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded transition"
                        title="Remover este item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
            {itens.length > 0 && (
              <tfoot className="bg-slate-100 font-bold text-slate-900">
                <tr>
                  <td colSpan={5} className="py-2.5 px-4 text-right uppercase text-xs">
                    Subtotal de Consumíveis e Serviços:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-sm text-red-700">
                    {formatCurrency(totalItens)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
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

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal Consumíveis & Serviços:</span>
                <span className="font-mono font-semibold">{formatCurrency(totalItens)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Deslocamento Técnico ({kmRodados} km):</span>
                <span className="font-mono">{formatCurrency(totalKm)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Mão de Obra ({horasTrabalhadas} h):</span>
                <span className="font-mono">{formatCurrency(totalHoras)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Despesas de Viagem e Estadia:</span>
                <span className="font-mono">{formatCurrency(totalDespesas)}</span>
              </div>
              <div className="flex justify-between text-amber-400 font-semibold pt-1 border-t border-slate-800">
                <span>Subtotal Operacional:</span>
                <span className="font-mono">{formatCurrency(totalOperacional)}</span>
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
              onClick={() => handleSalvar(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition text-sm"
            >
              <Receipt className="w-4 h-4" />
              <span>Salvar e Imprimir Relatório A4 (imprimir_os.php)</span>
            </button>
            <button
              type="button"
              onClick={() => handleSalvar(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 px-4 rounded-lg border border-slate-700 transition text-xs flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Salvar Apenas na Base de Dados</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
