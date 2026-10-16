import React from 'react';
import { ErpModuleType } from './ErpSidebar';
import { CATALOGO_PREDEFINIDO } from '../data/company';
import { formatCurrency } from '../utils/formatters';

interface ErpModuleWorkspaceProps {
  module: ErpModuleType;
  onNavigate: (module: ErpModuleType) => void;
  onAbrirNovaOs: () => void;
}

export const ErpModuleWorkspace: React.FC<ErpModuleWorkspaceProps> = ({
  module,
  onNavigate,
  onAbrirNovaOs,
}) => {
  // Telas específicas por módulo
  if (module === 'estoque') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold font-mono uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                Módulo: Estoque
              </span>
              <span className="text-xs text-slate-500 font-medium">| MFx Tecnologia Industrial</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <i className="fa-solid fa-boxes-stacked text-amber-600"></i>
              Controle de Estoque & Consumíveis Industriais
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Estoque físico de lentes de proteção quartzo, bicos simples/duplos, bicos de plasma e eletrodos.
            </p>
          </div>

          <button
            onClick={onAbrirNovaOs}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-sm transition"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Lançar Saída em OS</span>
          </button>
        </div>

        {/* Tabela de Estoque */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-sm text-slate-900">Consumíveis em Estoque (Pronta Entrega)</h3>
            <span className="text-xs text-slate-500 font-mono font-bold">14 Itens Ativos</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase text-[11px] font-bold">
                <tr>
                  <th className="py-2.5 px-4">Código</th>
                  <th className="py-2.5 px-4">Descrição do Consumível</th>
                  <th className="py-2.5 px-4">Categoria</th>
                  <th className="py-2.5 px-4 text-center">Saldo</th>
                  <th className="py-2.5 px-4 text-right">Preço Unit.</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {CATALOGO_PREDEFINIDO.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{item.codigo}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-900">{item.descricao}</td>
                    <td className="py-2.5 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] border border-slate-200">
                        {item.categoria}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold">
                      {12 + (idx * 3) % 25} un
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(item.precoSugerido)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        Normal
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (module === 'fiscal') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold font-mono uppercase bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                Módulo: Fiscal
              </span>
              <span className="text-xs text-slate-500 font-medium">| SEFAZ SP</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <i className="fa-solid fa-file-contract text-indigo-600"></i>
              Módulo Fiscal (NF-e & NFS-e de Serviços Industriais)
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Emissão de Notas Fiscais Eletrônicas vinculadas às Ordens de Serviço da MFx Tecnologia Industrial.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold text-slate-500 uppercase">Certificado Digital</div>
            <div className="text-lg font-black text-emerald-600 mt-1">A1 Válido</div>
            <div className="text-[11px] text-slate-500 mt-1">Vencimento: 20/12/2027</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold text-slate-500 uppercase">Ambiente SEFAZ</div>
            <div className="text-lg font-black text-blue-600 mt-1">Produção Ativo</div>
            <div className="text-[11px] text-slate-500 mt-1">Status: Conexão Estável</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold text-slate-500 uppercase">Regime Tributário</div>
            <div className="text-lg font-black text-slate-900 mt-1">Simples Nacional</div>
            <div className="text-[11px] text-slate-500 mt-1">Agudos - SP (CNAE 3314-7)</div>
          </div>
        </div>
      </div>
    );
  }

  // Módulo padrão genérico para outros itens do ERP
  return (
    <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm text-center max-w-xl mx-auto my-12 space-y-4">
      <div className="w-14 h-14 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center mx-auto text-2xl border border-slate-300">
        <i className="fa-solid fa-sliders"></i>
      </div>
      <h2 className="text-xl font-bold text-slate-900 uppercase">
        Módulo ERP: {module.toUpperCase()}
      </h2>
      <p className="text-xs text-slate-600 leading-relaxed">
        Este módulo está conectado ao banco de dados <code className="font-mono text-red-600 font-bold">mfx_sistema</code> e integrado aos cadastros de clientes e ordens de serviço.
      </p>
      <div className="pt-2 flex justify-center gap-3">
        <button
          onClick={() => onNavigate('abertura')}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition"
        >
          Voltar à Tela de Abertura (Capa)
        </button>
        <button
          onClick={onAbrirNovaOs}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition"
        >
          Ir para Nova OS
        </button>
      </div>
    </div>
  );
};
