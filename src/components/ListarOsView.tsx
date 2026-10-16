import React, { useState } from 'react';
import { OrdemServico, StatusOS } from '../types';
import { formatCurrency, formatDateBr } from '../utils/formatters';
import { 
  FileText, 
  Search, 
  Printer, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Filter, 
  Flame,
  ArrowRight
} from 'lucide-react';

interface ListarOsViewProps {
  ordens: OrdemServico[];
  onNovaOsClick: () => void;
  onImprimirClick: (osId: string) => void;
  onDeleteOs: (osId: string) => void;
  onChangeStatus: (osId: string, novoStatus: StatusOS) => void;
}

export const ListarOsView: React.FC<ListarOsViewProps> = ({
  ordens,
  onNovaOsClick,
  onImprimirClick,
  onDeleteOs,
  onChangeStatus,
}) => {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  // Filtragem
  const ordensFiltradas = ordens.filter((os) => {
    const termo = busca.toLowerCase();
    const matchBusca =
      os.numeroOS.toLowerCase().includes(termo) ||
      os.clienteNome.toLowerCase().includes(termo) ||
      os.clienteCidade.toLowerCase().includes(termo) ||
      os.equipamentoTipo.toLowerCase().includes(termo) ||
      (os.modeloEquipamento && os.modeloEquipamento.toLowerCase().includes(termo));

    const matchStatus = filtroStatus === 'todos' || os.status === filtroStatus;

    return matchBusca && matchStatus;
  });

  const getStatusBadge = (status: StatusOS) => {
    switch (status) {
      case 'Concluído':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Aprovado':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Em Execução':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Faturado':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Cancelado':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold font-mono uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded">
              Módulo: listar_os.php
            </span>
            <span className="text-xs text-slate-500 font-medium">| MFx Tecnologia Industrial</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-red-600" />
            Ordens de Serviço Emitidas
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Gestão de chamados, orçamentos e relatórios técnicos de corte a Laser, Plasma e Oxicorte.
          </p>
        </div>

        <button
          onClick={onNovaOsClick}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-lg shadow transition self-start md:self-auto text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Abrir Nova OS (nova_os.php)</span>
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por Nº OS, cliente, máquina..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="w-full sm:w-48 text-xs py-1.5 px-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 font-medium"
          >
            <option value="todos">Todos os Status</option>
            <option value="Orçamento">Orçamento</option>
            <option value="Aprovado">Aprovado</option>
            <option value="Em Execução">Em Execução</option>
            <option value="Concluído">Concluído</option>
            <option value="Faturado">Faturado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Tabela de OS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Nº da OS</th>
                <th className="py-3 px-4">Cliente / Indústria</th>
                <th className="py-3 px-4">Tecnologia</th>
                <th className="py-3 px-4">Emissão</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Custo Operacional</th>
                <th className="py-3 px-4 text-right">Valor Total</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {ordensFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500 text-sm">
                    Nenhuma Ordem de Serviço encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                ordensFiltradas.map((os) => (
                  <tr key={os.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-red-600 whitespace-nowrap">
                      {os.numeroOS}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{os.clienteNome}</div>
                      <div className="text-[11px] text-slate-500">
                        {os.clienteCidade}/{os.clienteEstado} • {os.clienteDocumento}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded text-[11px] font-semibold">
                        {os.equipamentoTipo}
                      </span>
                      {os.modeloEquipamento && (
                        <div className="text-[10px] text-slate-500 truncate max-w-[160px] mt-0.5">
                          {os.modeloEquipamento}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-600">
                      {formatDateBr(os.dataAbertura)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={os.status}
                        onChange={(e) => onChangeStatus(os.id, e.target.value as StatusOS)}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getStatusBadge(
                          os.status
                        )} cursor-pointer`}
                      >
                        <option value="Orçamento">Orçamento</option>
                        <option value="Aprovado">Aprovado</option>
                        <option value="Em Execução">Em Execução</option>
                        <option value="Concluído">Concluído</option>
                        <option value="Faturado">Faturado</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-700 whitespace-nowrap">
                      {formatCurrency(os.totalOperacional)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-950 text-sm whitespace-nowrap">
                      {formatCurrency(os.valorTotalGeral)}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onImprimirClick(os.id)}
                          className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded font-bold text-xs transition shadow-2xs"
                          title="Visualizar e Imprimir Relatório Formal A4 (imprimir_os.php)"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Imprimir A4
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Deseja realmente excluir a OS ${os.numeroOS}?`)) {
                              onDeleteOs(os.id);
                            }
                          }}
                          className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition"
                          title="Excluir Ordem de Serviço"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
