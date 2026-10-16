import React, { useState } from 'react';
import { OrdemServico, ItemOS } from '../types';
import { MFX_COMPANY } from '../data/company';
import { formatCurrency, formatNumber, formatDateBr } from '../utils/formatters';
import { Printer, ArrowLeft, Flame, Download, CheckCircle2, FileText, ChevronDown } from 'lucide-react';

interface ImprimirOsViewProps {
  ordens: OrdemServico[];
  ordemSelecionadaId?: string;
  onVoltarParaLista: () => void;
}

export const ImprimirOsView: React.FC<ImprimirOsViewProps> = ({
  ordens,
  ordemSelecionadaId,
  onVoltarParaLista,
}) => {
  const [osAtualId, setOsAtualId] = useState<string>(
    ordemSelecionadaId || (ordens.length > 0 ? ordens[0].id : '')
  );

  const os = ordens.find((o) => o.id === osAtualId) || ordens[0];

  if (!os) {
    return (
      <div className="bg-white p-12 rounded-xl text-center text-slate-500 border border-slate-200">
        <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Nenhuma Ordem de Serviço Encontrada</h3>
        <p className="text-sm mt-1">Crie uma nova OS para gerar o relatório formal de serviço e vendas.</p>
        <button
          onClick={onVoltarParaLista}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold"
        >
          Voltar às Ordens de Serviço
        </button>
      </div>
    );
  }

  // Agrupamento dos itens por categoria
  const categoriasMap: Record<string, ItemOS[]> = {};
  os.itens.forEach((it) => {
    if (!categoriasMap[it.categoria]) {
      categoriasMap[it.categoria] = [];
    }
    categoriasMap[it.categoria].push(it);
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Control Bar (Hidden during printing via CSS) */}
      <div className="no-print bg-slate-900 text-white p-4 rounded-xl shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onVoltarParaLista}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Selecionar OS:</span>
            <div className="relative">
              <select
                value={os.id}
                onChange={(e) => setOsAtualId(e.target.value)}
                className="bg-slate-800 text-white text-xs font-mono font-bold px-3 py-1.5 rounded border border-slate-700 pr-8 appearance-none cursor-pointer"
              >
                {ordens.map((ordem) => (
                  <option key={ordem.id} value={ordem.id}>
                    {ordem.numeroOS} - {ordem.clienteNome} ({formatCurrency(ordem.valorTotalGeral)})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden md:inline">
            Layout homologado padrão Folha A4
          </span>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Relatório (window.print())</span>
          </button>
        </div>
      </div>

      {/* Folha de Impressão Padrão A4 */}
      <div className="print-area bg-white text-slate-900 mx-auto shadow-2xl rounded-sm border border-slate-300 print:border-none print:shadow-none w-full max-w-[210mm] min-h-[297mm] p-6 sm:p-8 text-[11px] leading-tight font-sans">
        
        {/* CABEÇALHO OFICIAL MFx TECNOLOGIA INDUSTRIAL */}
        <div className="border-b-2 border-slate-900 pb-2 mb-2 flex items-center justify-between gap-2">
          
          {/* Logo Esquerdo */}
          <div className="w-[32%] flex items-center gap-2">
            <div className="w-10 h-10 rounded bg-slate-950 flex items-center justify-center border border-amber-500 shadow-xs shrink-0">
              <Flame className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <div className="text-xl font-black font-mono tracking-tighter text-slate-950 leading-none">
                MF<span className="text-red-600">x</span>
              </div>
              <div className="text-[9px] font-bold text-slate-700 tracking-wider uppercase mt-0.5">
                Tecnologia Industrial
              </div>
              <div className="text-[7.5px] text-slate-500 leading-none mt-0.5">
                Soluções Térmicas & CNC
              </div>
            </div>
          </div>

          {/* Centro: LASER FIBRA, PLASMA, OXI-CORTE */}
          <div className="w-[36%] text-center border-l border-r border-slate-300 px-2">
            <div className="inline-block bg-slate-950 text-white text-[9.5px] font-black tracking-wider uppercase px-2 py-0.5 rounded-sm">
              {MFX_COMPANY.slogan}
            </div>
            <p className="text-[7.5px] text-slate-600 mt-1 leading-snug">
              Consumíveis Ópticos • Bicos • Tochas • Retrofit CNC • Manutenção e Assistência Especializada
            </p>
          </div>

          {/* Direita: Dados Oficiais da Empresa */}
          <div className="w-[32%] text-right text-[7.5px] text-slate-700 leading-snug">
            <div className="font-bold text-slate-950 text-[8px]">{MFX_COMPANY.razaoSocial}</div>
            <div>CNPJ: <span className="font-mono font-bold text-slate-900">{MFX_COMPANY.cnpj}</span></div>
            <div>{MFX_COMPANY.endereco} - {MFX_COMPANY.cidade}/{MFX_COMPANY.estado}</div>
            <div>CEP: {MFX_COMPANY.cep} | Fone: {MFX_COMPANY.telefone}</div>
            <div>WhatsApp: <strong className="text-slate-950">{MFX_COMPANY.whatsapp}</strong></div>
            <div>{MFX_COMPANY.email}</div>
          </div>
        </div>

        {/* TÍTULO DESTACADO: RELATÓRIO DE SERVIÇO E VENDAS */}
        <div className="bg-slate-100 border border-slate-300 border-l-4 border-l-red-600 px-3 py-1.5 flex items-center justify-between mb-2 rounded-xs">
          <div>
            <h1 className="text-[13px] font-black uppercase tracking-wider text-slate-950">
              Relatório de Serviço e Vendas
            </h1>
            <div className="text-[8px] text-slate-500">
              Comprovante Técnico Operacional e Fornecimento de Peças
            </div>
          </div>

          <div className="text-right">
            <div className="text-[9px] font-bold text-slate-600">
              Nº DA ORDEM DE SERVIÇO: <span className="font-mono text-red-600 text-[12px] font-black">{os.numeroOS}</span>
            </div>
            <div className="text-[8px] text-slate-600 font-semibold">
              DATA: <span className="font-mono text-slate-900">{formatDateBr(os.dataAbertura)}</span> | STATUS: <span className="uppercase text-slate-900 font-black">{os.status}</span>
            </div>
          </div>
        </div>

        {/* BLOCO 1: DADOS DO CLIENTE */}
        <div className="border border-slate-300 rounded-xs mb-2 overflow-hidden">
          <div className="bg-slate-200 text-slate-800 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 border-b border-slate-300">
            Identificação do Cliente / Razão Social
          </div>
          <div className="p-2 grid grid-cols-12 gap-x-3 gap-y-1 text-[8.5px]">
            <div className="col-span-8">
              <span className="font-bold text-slate-600">Cliente / Razão:</span>{' '}
              <strong className="text-slate-950 text-[9px]">{os.clienteNome}</strong>
              {os.clienteNomeFantasia && (
                <span className="text-slate-500 text-[8px] ml-1">({os.clienteNomeFantasia})</span>
              )}
            </div>
            <div className="col-span-4">
              <span className="font-bold text-slate-600">CNPJ / CPF:</span>{' '}
              <span className="font-mono font-bold text-slate-900">{os.clienteDocumento}</span>
              {os.clienteInscricaoEstadual && (
                <span className="text-[7.5px] text-slate-600 ml-1 font-mono">| IE: {os.clienteInscricaoEstadual}</span>
              )}
            </div>

            <div className="col-span-8">
              <span className="font-bold text-slate-600">Endereço:</span>{' '}
              <span className="text-slate-800">{os.clienteEndereco}</span>
            </div>
            <div className="col-span-4">
              <span className="font-bold text-slate-600">Telefone:</span>{' '}
              <span className="text-slate-800">{os.clienteTelefone || '-'}</span>
            </div>

            <div className="col-span-8">
              <span className="font-bold text-slate-600">Cidade / UF / CEP:</span>{' '}
              <span className="text-slate-800">{os.clienteCidade} / {os.clienteEstado} — CEP: {os.clienteCep}</span>
            </div>
            <div className="col-span-4">
              <span className="font-bold text-slate-600">WhatsApp / Cel:</span>{' '}
              <span className="font-bold text-slate-900">{os.clienteCelular || '-'}</span>
            </div>

            <div className="col-span-8">
              <span className="font-bold text-slate-600">E-mail:</span>{' '}
              <span className="text-slate-800">{os.clienteEmail || '-'}</span>
            </div>
            <div className="col-span-4">
              <span className="font-bold text-slate-600">Técnico MFx:</span>{' '}
              <span className="font-semibold text-slate-900">{os.tecnicoResponsavel}</span>
            </div>

            {/* Equipamento */}
            <div className="col-span-12 pt-1 mt-0.5 border-t border-dashed border-slate-300 flex justify-between items-center text-[8.5px]">
              <div>
                <span className="font-bold text-slate-700">Equipamento Atendido:</span>{' '}
                <span className="font-bold text-red-700 uppercase bg-red-50 px-1 border border-red-200 rounded-xs">
                  {os.equipamentoTipo}
                </span>{' '}
                <span className="text-slate-800">{os.modeloEquipamento}</span>
                {os.potenciaFonte && <span className="text-slate-500 font-mono"> ({os.potenciaFonte})</span>}
              </div>
              <div className="text-slate-500">
                Previsão/Validade: <strong className="text-slate-900">{formatDateBr(os.dataPrevisao)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* BLOCO 2: TABELA DETALHADA DE ITENS DIVIDIDA POR CATEGORIAS */}
        <div className="mb-2">
          <table className="w-full border-collapse border border-slate-300 text-[8px]">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase text-[7.5px]">
                <th className="border border-slate-900 py-1 px-1.5 text-center w-[12%]">Código</th>
                <th className="border border-slate-900 py-1 px-2 text-left w-[46%]">Descrição do Consumível ou Serviço</th>
                <th className="border border-slate-900 py-1 px-1.5 text-center w-[14%]">Prazo</th>
                <th className="border border-slate-900 py-1 px-1 text-center w-[8%]">Qtd</th>
                <th className="border border-slate-900 py-1 px-2 text-right w-[10%]">Vlr. Unit.</th>
                <th className="border border-slate-900 py-1 px-2 text-right w-[10%]">Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(categoriasMap).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-400">
                    Nenhum item adicionado nesta Ordem de Serviço.
                  </td>
                </tr>
              ) : (
                Object.entries(categoriasMap).map(([categoria, listaItens]) => (
                  <React.Fragment key={categoria}>
                    <tr className="bg-slate-100 font-bold text-slate-800">
                      <td colSpan={6} className="py-1 px-2 border border-slate-300 text-[8px] uppercase tracking-wide bg-slate-100">
                        • {categoria}
                      </td>
                    </tr>
                    {listaItens.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="border border-slate-300 py-1 px-1.5 text-center font-mono font-bold text-slate-800">
                          {item.codigo}
                        </td>
                        <td className="border border-slate-300 py-1 px-2 text-slate-900">
                          {item.descricao}
                        </td>
                        <td className="border border-slate-300 py-1 px-1.5 text-center text-slate-700">
                          {item.prazoEntrega}
                        </td>
                        <td className="border border-slate-300 py-1 px-1 text-center font-mono font-bold text-slate-900">
                          {formatNumber(item.quantidade, 0)}
                        </td>
                        <td className="border border-slate-300 py-1 px-2 text-right font-mono text-slate-800">
                          {formatCurrency(item.precoUnitario)}
                        </td>
                        <td className="border border-slate-300 py-1 px-2 text-right font-mono font-bold text-slate-950">
                          {formatCurrency(item.valorTotal)}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* BLOCO 3: RESUMO DETALHADO DOS CUSTOS DE DESLOCAMENTO, HORAS E DESPESAS */}
        <div className="grid grid-cols-12 gap-2 mb-2">
          
          {/* Tabela de Custos Operacionais */}
          <div className="col-span-7 border border-slate-300 rounded-xs overflow-hidden">
            <div className="bg-slate-200 text-slate-800 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 border-b border-slate-300">
              Composição de Custos Operacionais & Deslocamento
            </div>
            <div className="p-1.5 text-[8px]">
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-0.5 text-slate-700">
                      Deslocamento ({formatNumber(os.kmRodados, 1)} KM rodados × {formatCurrency(os.valorUnitarioKm)}/KM):
                    </td>
                    <td className="py-0.5 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(os.totalKm)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-0.5 text-slate-700">
                      Mão de Obra ({formatNumber(os.horasTrabalhadas, 1)} h técnicas × {formatCurrency(os.valorHoraTecnica)}/h):
                    </td>
                    <td className="py-0.5 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(os.totalHoras)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-0.5 text-slate-700">
                      Despesas Extras (Alimentação, Estadia, Pedágio):
                    </td>
                    <td className="py-0.5 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(os.totalDespesas)}
                    </td>
                  </tr>
                  {os.descricaoDespesas && (
                    <tr>
                      <td colSpan={2} className="text-[7px] text-slate-500 italic py-0.5">
                        Obs. Despesas: {os.descricaoDespesas}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-slate-100 font-bold border-t border-slate-300">
                    <td className="py-1 px-1 text-slate-900 uppercase text-[7.5px]">
                      Subtotal Custos Operacionais:
                    </td>
                    <td className="py-1 px-1 text-right font-mono text-red-700 text-[8.5px]">
                      {formatCurrency(os.totalOperacional)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Caixa de Valor Total Geral */}
          <div className="col-span-5 bg-slate-950 text-white rounded-xs p-2.5 flex flex-col justify-center text-right shadow-xs">
            <div className="text-[8px] text-slate-300 uppercase tracking-wider">
              Subtotal Itens / Consumíveis: <span className="font-mono font-bold text-white">{formatCurrency(os.totalItens)}</span>
            </div>
            <div className="text-[8px] text-slate-300 uppercase tracking-wider mt-0.5">
              Subtotal Operacional: <span className="font-mono font-bold text-white">{formatCurrency(os.totalOperacional)}</span>
            </div>
            <div className="mt-2 pt-1 border-t border-slate-700">
              <div className="text-[8.5px] uppercase font-black tracking-wider text-amber-400">
                VALOR TOTAL DA OS (R$)
              </div>
              <div className="text-[17px] font-black font-mono text-amber-400 tracking-tight leading-none mt-0.5">
                {formatCurrency(os.valorTotalGeral)}
              </div>
            </div>
          </div>
        </div>

        {/* BLOCO 4: TERMOS, CONDIÇÕES E GARANTIA */}
        <div className="border border-slate-300 rounded-xs p-2 text-[7.5px] leading-tight text-slate-700 mb-4 bg-slate-50">
          <div className="mb-1">
            <strong className="text-slate-900">Condições de Pagamento:</strong> {os.condicoesPagamento}
          </div>
          <div className="mb-1">
            <strong className="text-slate-900">Termo de Garantia:</strong> {os.prazoGarantia}
          </div>
          {os.observacoesGerais && (
            <div>
              <strong className="text-slate-900">Parecer Técnico / Observações:</strong> {os.observacoesGerais}
            </div>
          )}
        </div>

        {/* BLOCO 5: ASSINATURAS FORMAIS */}
        <div className="pt-6 mt-4 flex justify-between px-8 text-[7.5px]">
          <div className="w-[42%] text-center border-t border-slate-800 pt-1">
            <strong className="text-slate-950 text-[8px] block">MFx TECNOLOGIA INDUSTRIAL</strong>
            <span className="text-slate-600">Técnico Responsável: {os.tecnicoResponsavel}</span>
          </div>

          <div className="w-[42%] text-center border-t border-slate-800 pt-1">
            <strong className="text-slate-950 text-[8px] block truncate">{os.clienteNome}</strong>
            <span className="text-slate-600">De Acordo / Aceite de Execução e Recebimento</span>
          </div>
        </div>

        {/* Rodapé institucional */}
        <div className="mt-8 pt-2 border-t border-slate-200 text-center text-[7px] text-slate-400 font-mono">
          MFx Tecnologia Industrial • CNPJ: 34.375.789-0001/87 • Rua Sargento Andiras, nº 874, CEP 17120-031, Agudos - SP • Sistema de Gestão Industrial
        </div>

      </div>
    </div>
  );
};
