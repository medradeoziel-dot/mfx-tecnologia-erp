import React, { useMemo } from 'react';
import { Cliente, OrdemServico } from '../types';
import { MFX_COMPANY } from '../data/company';
import { formatCurrency, formatDateBr } from '../utils/formatters';
import { 
  Users, 
  FilePlus2, 
  Printer, 
  Code2, 
  Flame, 
  DollarSign, 
  Clock, 
  Car, 
  ArrowRight, 
  Wrench, 
  CheckCircle2, 
  Building2,
  Cpu,
  BarChart3,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { TabType } from './Header';

interface DashboardViewProps {
  clientes: Cliente[];
  ordens: OrdemServico[];
  setActiveTab: (tab: TabType) => void;
  onImprimirOs: (osId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  clientes,
  ordens,
  setActiveTab,
  onImprimirOs,
}) => {
  // Cálculos consolidados
  const totalFaturamento = ordens.reduce((acc, os) => acc + (os.valorTotalGeral || 0), 0);
  const totalHoras = ordens.reduce((acc, os) => acc + (os.horasTrabalhadas || 0), 0);
  const totalKm = ordens.reduce((acc, os) => acc + (os.kmRodados || 0), 0);
  const totalOperacional = ordens.reduce((acc, os) => acc + (os.totalOperacional || 0), 0);
  const totalItens = ordens.reduce((acc, os) => acc + (os.totalItens || 0), 0);

  // Cálculo da quantidade de Ordens de Serviço por mês nos últimos 6 meses via Recharts
  const dadosGrafico6Meses = useMemo(() => {
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const mesesCompletos = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    let dataReferencia = new Date();
    if (ordens.length > 0) {
      const datas = ordens.map((o) => new Date(o.dataAbertura).getTime()).filter((t) => !isNaN(t));
      if (datas.length > 0) {
        const maxTime = Math.max(...datas);
        const maxDate = new Date(maxTime);
        if (maxDate > dataReferencia) {
          dataReferencia = maxDate;
        }
      }
    }

    const mesesArray = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(dataReferencia.getFullYear(), dataReferencia.getMonth() - i, 1);
      const ano = d.getFullYear();
      const mesIdx = d.getMonth();
      const chaveAnoMes = `${ano}-${String(mesIdx + 1).padStart(2, '0')}`;
      const rotulo = `${mesesNomes[mesIdx]}/${String(ano).slice(2)}`;
      const nomeCompleto = `${mesesCompletos[mesIdx]} de ${ano}`;

      const ordensDoMes = ordens.filter((o) => o.dataAbertura && o.dataAbertura.startsWith(chaveAnoMes));
      const quantidade = ordensDoMes.length;
      const valorTotal = ordensDoMes.reduce((acc, o) => acc + (o.valorTotalGeral || 0), 0);
      const concluidas = ordensDoMes.filter((o) => o.status === 'Concluído').length;
      const laserCount = ordensDoMes.filter((o) => o.equipamentoTipo === 'Laser Fibra').length;
      const plasmaCount = ordensDoMes.filter((o) => o.equipamentoTipo === 'Plasma').length;
      const oxicorteCount = ordensDoMes.filter((o) => o.equipamentoTipo === 'Oxicorte').length;

      mesesArray.push({
        chave: chaveAnoMes,
        rotulo,
        nomeCompleto,
        quantidade,
        valorTotal,
        concluidas,
        laserCount,
        plasmaCount,
        oxicorteCount,
      });
    }

    return mesesArray;
  }, [ordens]);

  // Estatísticas do período de 6 meses
  const totalOsSemestre = dadosGrafico6Meses.reduce((acc, m) => acc + m.quantidade, 0);
  const mediaMensal = (totalOsSemestre / 6).toFixed(1);
  const mesPico = dadosGrafico6Meses.reduce((max, m) => (m.quantidade > max.quantidade ? m : max), dadosGrafico6Meses[0]);

  return (
    <div className="space-y-6">
      {/* Hero Industrial Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-10 bottom-0 text-slate-800/20 select-none pointer-events-none hidden lg:block">
          <Flame className="w-64 h-64" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/40 text-amber-400 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase mb-3">
            <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            {MFX_COMPANY.slogan}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
            MF<span className="text-red-500">x</span> Tecnologia Industrial
          </h1>

          <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
            Sistema completo de gestão de Ordens de Serviço (OS), cadastro de clientes com consulta BrasilAPI e vendas de consumíveis ópticos, bicos e assistência técnica especializada.
          </p>

          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400 font-mono">
            <div>
              <span className="text-slate-500">CNPJ:</span> <strong className="text-slate-200">{MFX_COMPANY.cnpj}</strong>
            </div>
            <div>
              <span className="text-slate-500">Sede:</span> <strong className="text-slate-200">{MFX_COMPANY.endereco}, Agudos - SP</strong>
            </div>
            <div>
              <span className="text-slate-500">Contato:</span> <strong className="text-slate-200">{MFX_COMPANY.telefone} / {MFX_COMPANY.whatsapp}</strong>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('nova_os')}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-xs transition active:scale-95"
              title="Abrir Nova Ordem de Serviço"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>Nova OS</span>
            </button>
            <button
              onClick={() => setActiveTab('clientes')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2.5 rounded-lg border border-slate-700 flex items-center gap-2 text-xs transition"
              title="Cadastro e Gestão de Clientes"
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>Clientes & Pessoas</span>
            </button>
            <button
              onClick={() => setActiveTab('codigo_php')}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold px-4 py-2.5 rounded-lg border border-slate-700 flex items-center gap-2 text-xs transition"
              title="Código-Fonte PHP e Banco MySQL"
            >
              <Code2 className="w-4 h-4" />
              <span>Código PHP / MySQL</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Faturamento */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Volume Total de OS
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono mt-1">
              {formatCurrency(totalFaturamento)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Itens: {formatCurrency(totalItens)} | Desloc: {formatCurrency(totalOperacional)}
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Ordens de Serviço */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Ordens de Serviço
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono mt-1">
              {ordens.length}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {ordens.filter((o) => o.status === 'Concluído').length} Concluídas
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        {/* Clientes */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Clientes Cadastrados
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono mt-1">
              {clientes.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Com consulta BrasilAPI
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Deslocamento & Mão de Obra */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Operações de Campo
            </div>
            <div className="text-base font-black text-slate-900 font-mono mt-1">
              {totalKm.toFixed(0)} KM • {totalHoras.toFixed(1)} h
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              R$ 2,50/km • R$ 100/h técnica
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <Car className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Gráfico Recharts: Quantidade de Ordens de Serviço por Mês nos Últimos 6 Meses */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-red-50 text-red-600 rounded-lg border border-red-200">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Quantidade de Ordens de Serviço por Mês (Últimos 6 Meses)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Evolução mensal de chamados de corte Laser Fibra, Plasma e Oxicorte da MFx Tecnologia Industrial.
            </p>
          </div>

          {/* Indicadores rápidos do Semestre */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-600">Total Semestre:</span>
              <strong className="font-mono text-slate-900">{totalOsSemestre} OS</strong>
            </div>

            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-slate-600">Média:</span>
              <strong className="font-mono text-slate-900">{mediaMensal} OS/mês</strong>
            </div>

            <div className="bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-red-800">
              <Flame className="w-3.5 h-3.5 text-red-600" />
              <span>Mês Pico:</span>
              <strong className="font-mono">{mesPico.rotulo} ({mesPico.quantidade} OS)</strong>
            </div>
          </div>
        </div>

        {/* Gráfico de Barras Recharts */}
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dadosGrafico6Meses}
              margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="rotulo" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
              />
              <YAxis 
                allowDecimals={false} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-950 text-white p-3.5 rounded-lg shadow-xl border border-slate-800 text-xs space-y-1.5 min-w-[210px]">
                        <div className="font-bold text-amber-400 border-b border-slate-800 pb-1 flex items-center justify-between">
                          <span>{data.nomeCompleto}</span>
                          <span className="font-mono text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                            {data.rotulo}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-slate-300">Ordens de Serviço:</span>
                          <span className="font-black text-red-400 font-mono text-sm">{data.quantidade} OS</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-slate-400">
                          <span>Volume Faturado:</span>
                          <span className="font-mono text-slate-200 font-semibold">{formatCurrency(data.valorTotal)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>OS Concluídas:</span>
                          <span className="text-emerald-400 font-semibold">{data.concluidas}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-800 text-[10px] space-y-0.5 text-slate-400">
                          <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Por Tecnologia:</div>
                          <div className="flex justify-between">
                            <span>Laser Fibra:</span>
                            <span className="font-bold text-slate-200">{data.laserCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Plasma HD:</span>
                            <span className="font-bold text-slate-200">{data.plasmaCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Oxicorte CNC:</span>
                            <span className="font-bold text-slate-200">{data.oxicorteCount}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="quantidade" 
                name="Ordens de Serviço" 
                radius={[6, 6, 0, 0]}
                barSize={44}
              >
                {dadosGrafico6Meses.map((entry, index) => {
                  // Destacar o mês mais recente ou o mês com mais OS
                  const isUltimo = index === dadosGrafico6Meses.length - 1;
                  const isMaior = entry.quantidade === mesPico.quantidade && entry.quantidade > 0;
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={isUltimo ? '#dc2626' : isMaior ? '#ea580c' : '#f97316'} 
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rodapé do Gráfico com Mini-cards dos 6 meses */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-4 pt-4 border-t border-slate-100">
          {dadosGrafico6Meses.map((item, idx) => (
            <div 
              key={idx}
              className={`p-2 rounded-lg text-center border transition ${
                idx === dadosGrafico6Meses.length - 1
                  ? 'bg-red-50/60 border-red-200'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="text-[11px] font-bold text-slate-600">{item.rotulo}</div>
              <div className="text-lg font-black text-slate-900 font-mono leading-none mt-1">
                {item.quantidade} <span className="text-[10px] font-normal text-slate-500">OS</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
                {formatCurrency(item.valorTotal)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid de Acesso aos 4 Arquivos Principais solicitados */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
          Estrutura do Sistema Solicitada (Arquivos & Funcionalidades)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* conexao.php */}
          <div 
            onClick={() => setActiveTab('codigo_php')}
            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-400 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                1. conexao.php
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">MySQL PDO</span>
            </div>
            <p className="text-xs text-slate-600">
              Conexão PDO com banco de dados <code className="text-red-600 font-bold">mfx_sistema</code> com charset utf8mb4 e tratamento de exceções.
            </p>
            <div className="mt-3 text-[11px] text-red-600 font-bold group-hover:underline flex items-center gap-1">
              <span>Ver código fonte</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* clientes.php */}
          <div 
            onClick={() => setActiveTab('clientes')}
            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-red-400 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                2. clientes.php
              </span>
              <span className="text-[10px] text-blue-600 font-semibold">BrasilAPI</span>
            </div>
            <p className="text-xs text-slate-600">
              Cadastro completo com função JavaScript no evento <code className="text-red-600 font-bold">onblur</code> do CPF/CNPJ para preenchimento automático.
            </p>
            <div className="mt-3 text-[11px] text-red-600 font-bold group-hover:underline flex items-center gap-1">
              <span>Acessar cadastro</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* nova_os.php */}
          <div 
            onClick={() => setActiveTab('nova_os')}
            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-red-400 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                3. nova_os.php
              </span>
              <span className="text-[10px] text-amber-600 font-semibold">Tempo Real</span>
            </div>
            <p className="text-xs text-slate-600">
              KM (R$ 2,50), horas (R$ 100,00), despesas operacionais em tempo real e tabela dinâmica de consumíveis e serviços.
            </p>
            <div className="mt-3 text-[11px] text-red-600 font-bold group-hover:underline flex items-center gap-1">
              <span>Lançar Ordem de Serviço</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* imprimir_os.php */}
          <div 
            onClick={() => setActiveTab('imprimir_os')}
            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-red-400 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                4. imprimir_os.php
              </span>
              <span className="text-[10px] text-red-600 font-semibold">Padrão A4</span>
            </div>
            <p className="text-xs text-slate-600">
              Relatório de Serviço e Vendas formal da MFx com logo, cabeçalho Laser/Plasma/Oxicorte, categorização e window.print().
            </p>
            <div className="mt-3 text-[11px] text-red-600 font-bold group-hover:underline flex items-center gap-1">
              <span>Ver relatório de impressão</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </div>

      {/* Tabela de Ordens Recentes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-600" />
            Últimas Ordens de Serviço & Relatórios Emitidos
          </div>
          <button
            onClick={() => setActiveTab('listar_os')}
            className="text-xs text-red-600 hover:underline font-semibold flex items-center gap-1"
          >
            <span>Ver todas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-2.5 px-4">Nº OS</th>
                <th className="py-2.5 px-4">Cliente / Razão</th>
                <th className="py-2.5 px-4">Tecnologia</th>
                <th className="py-2.5 px-4">Data</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Total Geral</th>
                <th className="py-2.5 px-4 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ordens.slice(0, 5).map((os) => (
                <tr key={os.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-2.5 px-4 font-mono font-bold text-red-600">
                    {os.numeroOS}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-slate-900">
                    {os.clienteNome}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-200">
                      {os.equipamentoTipo}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 font-mono">
                    {formatDateBr(os.dataAbertura)}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                      {os.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(os.valorTotalGeral)}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <button
                      onClick={() => onImprimirOs(os.id)}
                      className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2 py-1 rounded text-xs font-semibold transition"
                      title="Imprimir Relatório A4"
                    >
                      <Printer className="w-3 h-3" />
                      Imprimir A4
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
