import React, { useState, useMemo } from 'react';
import { OrdemServico, NotaFiscalNfse } from '../types';
import { formatCurrency, formatDateBr } from '../utils/formatters';
import { 
  FileCheck, 
  FileText, 
  Search, 
  Download, 
  Printer, 
  CheckCircle2, 
  Percent, 
  BookOpen, 
  Building, 
  Copy, 
  Check, 
  X,
  Eye,
  Wrench
} from 'lucide-react';

interface NfseViewProps {
  ordens: OrdemServico[];
  notasEmitidas: NotaFiscalNfse[];
  onEmitirNfse: (novaNota: NotaFiscalNfse) => void;
}

export const NfseView: React.FC<NfseViewProps> = ({
  ordens,
  notasEmitidas,
  onEmitirNfse,
}) => {
  const [busca, setBusca] = useState('');
  const [codigoCopiado, setCodigoCopiado] = useState<string | null>(null);

  // Modal de Impressão / Espelho da NFS-e
  const [notaSelecionadaImpressao, setNotaSelecionadaImpressao] = useState<NotaFiscalNfse | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const exibirToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Gerar código de verificação autenticador aleatório (ex: A8F3-7C21-99B4)
  const gerarCodigoVerificacao = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bloco = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${bloco()}-${bloco()}-${bloco()}`;
  };

  // Montar OS Elegíveis para NFS-e (Mão de Obra e Serviços de OS concluídas/faturadas)
  const elegiveisOS = useMemo(() => {
    return ordens
      .filter((os) => os.status === 'Concluído' || os.status === 'Faturado')
      .map((os) => {
        // Serviços vêm do valor operacional da OS (horas técnicas trabalhadas) ou de itens categorizados como serviço
        const itensServicos = (os.itens || []).filter((it) => {
          if (it.tipoItem === 'servico') return true;
          if (it.categoria === 'Mão de Obra' || it.categoria === 'Serviços Laser' || it.categoria === 'Serviços Plasma' || it.categoria === 'Serviços Oxicorte') return true;
          return false;
        });

        const valorItensServicos = itensServicos.reduce((acc, it) => acc + (it.valorTotal || 0), 0);
        const valorHorasOperacionais = (os.totalHoras || 0);
        const valorServicosTotal = valorItensServicos > 0 ? valorItensServicos : valorHorasOperacionais;

        const jaEmitida = notasEmitidas.some(n => n.origemNumero === os.numeroOS && n.status === 'Autorizada');

        // Descrição sumarizada do serviço
        let descricaoServico = os.observacoesGerais || '';
        if (itensServicos.length > 0) {
          descricaoServico = itensServicos.map(i => i.descricao).join('; ');
        } else if (os.modeloEquipamento) {
          descricaoServico = `Manutenção preventiva e corretiva especializada em ${os.equipamentoTipo} (${os.modeloEquipamento}).`;
        } else {
          descricaoServico = `Prestação de serviços técnicos especializados de assistência e manutenção em equipamento de corte ${os.equipamentoTipo}.`;
        }

        return {
          id: `os-srv-${os.id}`,
          origemId: os.id,
          origemNumero: os.numeroOS,
          data: os.dataAbertura,
          clienteNome: os.clienteNome,
          clienteDocumento: os.clienteDocumento || 'Não informado',
          clienteCidade: os.clienteCidade,
          clienteEstado: os.clienteEstado,
          descricaoServico,
          valorServicos: valorServicosTotal,
          jaEmitida,
        };
      })
      .filter((item) => item.valorServicos > 0 && !item.jaEmitida);
  }, [ordens, notasEmitidas]);

  // Filtragem das OS elegíveis
  const elegiveisFiltrados = useMemo(() => {
    if (!busca.trim()) return elegiveisOS;
    const termo = busca.toLowerCase();
    return elegiveisOS.filter(item => 
      item.origemNumero.toLowerCase().includes(termo) ||
      item.clienteNome.toLowerCase().includes(termo) ||
      item.clienteDocumento.toLowerCase().includes(termo) ||
      item.descricaoServico.toLowerCase().includes(termo)
    );
  }, [elegiveisOS, busca]);

  // Histórico de NFS-e filtrado
  const historicoFiltrado = useMemo(() => {
    if (!busca.trim()) return notasEmitidas;
    const termo = busca.toLowerCase();
    return notasEmitidas.filter(n =>
      n.numero.includes(termo) ||
      n.codigoVerificacao.toLowerCase().includes(termo) ||
      n.clienteNome.toLowerCase().includes(termo) ||
      n.origemNumero.toLowerCase().includes(termo)
    );
  }, [notasEmitidas, busca]);

  // Handler: Emitir NFS-e
  const handleEmitirNfse = (item: typeof elegiveisOS[0]) => {
    const proximoNumSeq = (notasEmitidas.length + 85).toString().padStart(6, '0');
    const ano = new Date().getFullYear();
    const numeroFormatado = `${ano}/${proximoNumSeq}`;
    const codigoVerificacao = gerarCodigoVerificacao();
    const agora = new Date();
    const dataHora = `${agora.toISOString().split('T')[0]} ${agora.toTimeString().split(' ')[0]}`;
    const aliquotaIss = 2.0; // 2% ISS Prefeitura de Agudos
    const valorIss = +(item.valorServicos * (aliquotaIss / 100)).toFixed(2);

    const novaNota: NotaFiscalNfse = {
      id: `nfse-${Date.now()}`,
      numero: numeroFormatado,
      codigoVerificacao,
      dataEmissao: dataHora,
      origemTipo: 'OS',
      origemNumero: item.origemNumero,
      clienteNome: item.clienteNome,
      clienteDocumento: item.clienteDocumento,
      clienteCidade: item.clienteCidade,
      clienteEstado: item.clienteEstado,
      itemLc116: '14.01',
      descricaoLc116: 'Lubrificação, limpeza, revisão, conserto, restauração e manutenção de máquinas e equipamentos',
      discriminacaoServico: item.descricaoServico,
      valorServicos: item.valorServicos,
      aliquotaIss,
      valorIss,
      status: 'Autorizada',
      protocoloAutorizacao: `AGD-${ano}-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    onEmitirNfse(novaNota);
    exibirToast(`NFS-e nº ${novaNota.numero} emitida e homologada na Prefeitura de Agudos com sucesso!`);
  };

  // Handler: Download XML NFS-e
  const handleDownloadXml = (nota: NotaFiscalNfse) => {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<CompNfse xmlns="http://www.abrasf.org.br/nfse.xsd">
  <Nfse versao="2.03">
    <InfNfse Id="NFSE${nota.numero.replace(/\D/g, '')}">
      <Numero>${nota.numero}</Numero>
      <CodigoVerificacao>${nota.codigoVerificacao}</CodigoVerificacao>
      <DataEmissao>${nota.dataEmissao.replace(' ', 'T')}</DataEmissao>
      <IdentificacaoRps>
        <Numero>${nota.origemNumero.replace(/\D/g, '')}</Numero>
        <Serie>1</Serie>
        <Tipo>1</Tipo>
      </IdentificacaoRps>
      <DadosPrestador>
        <IdentificacaoPrestador>
          <Cnpj>52148963000144</Cnpj>
          <InscricaoMunicipal>140100188</InscricaoMunicipal>
        </IdentificacaoPrestador>
        <RazaoSocial>MFX TECNOLOGIA INDUSTRIAL LTDA</RazaoSocial>
        <Endereco>
          <Endereco>RUA SARGENTO ANDIRAS</Endereco>
          <Numero>874</Numero>
          <Bairro>CENTRO</Bairro>
          <CodigoMunicipio>3500709</CodigoMunicipio>
          <Uf>SP</Uf>
          <Cep>17120000</Cep>
        </Endereco>
        <OptanteSimplesNacional>1</OptanteSimplesNacional>
      </DadosPrestador>
      <DadosTomador>
        <IdentificacaoTomador>
          <CpfCnpj>
            <Cnpj>${nota.clienteDocumento.replace(/\D/g, '')}</Cnpj>
          </CpfCnpj>
        </IdentificacaoTomador>
        <RazaoSocial>${nota.clienteNome}</RazaoSocial>
      </DadosTomador>
      <DadosServico>
        <Valores>
          <ValorServicos>${nota.valorServicos.toFixed(2)}</ValorServicos>
          <ValorIss>${nota.valorIss.toFixed(2)}</ValorIss>
          <Aliquota>${nota.aliquotaIss.toFixed(2)}</Aliquota>
        </Valores>
        <ItemListaServico>${nota.itemLc116}</ItemListaServico>
        <Discriminacao>${nota.discriminacaoServico}</Discriminacao>
        <MunicipioPrestacaoServico>3500709</MunicipioPrestacaoServico>
      </DadosServico>
    </InfNfse>
  </Nfse>
</CompNfse>`;

    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NFSe_${nota.numero.replace('/', '_')}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    exibirToast(`XML da NFS-e nº ${nota.numero} baixado.`);
  };

  const copiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    setCodigoCopiado(codigo);
    setTimeout(() => setCodigoCopiado(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      
      {/* Toast Notificação */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-medium flex items-center gap-2.5 border border-slate-700 animate-fadeIn">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
            ✓
          </div>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. CABEÇALHO LIMPO E EXCLUSIVO (SEM ATALHOS CRUZADOS NO TOPO INTERNO) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-mono">
              PREFEITURA MUNICIPAL DE AGUDOS • LC 116
            </span>
            <span className="text-xs text-slate-400">MFx Tecnologia Industrial</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Emissão e Gestão de NFS-e (Serviços Industriais / Prefeitura Agudos)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Emissão de notas fiscais de serviço eletrônicas para mão de obra, assistência e manutenção técnica.
          </p>
        </div>

        {/* Campo de Busca Rápida */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar nota, OS, serviço ou cliente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-400"
          />
          {busca && (
            <button onClick={() => setBusca('')} className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 2. CARDS SUPERIORES FINOS E NEUTROS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Alíquota ISS Municipal
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-teal-600" />
              <span>2.00% (Simples Nacional)</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
              Exigibilidade: Exigível no Município
            </div>
          </div>
          <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded font-mono font-medium">
            Agudos / SP
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Item LC 116 / 2003
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Item 14.01 - Manutenção</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
              Revisão e conserto de máquinas
            </div>
          </div>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-mono font-medium">
            Atividade 1401
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Inscrição Municipal
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-700" />
              <span>1401-0 / 01-88</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
              Prefeitura Municipal de Agudos
            </div>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-mono font-medium">
            Ativo
          </span>
        </div>
      </div>

      {/* 3. TABELA: OS ELEGÍVEIS PARA NFS-E */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-slate-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              OS Elegíveis para NFS-e
            </h2>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono font-bold">
              {elegiveisFiltrados.length} pendentes
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Serviços executados em Ordens de Serviço concluídas aguardando emissão da nota municipal
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-2.5 px-4">Nº OS</th>
                <th className="py-2.5 px-4">Data</th>
                <th className="py-2.5 px-4">Cliente / Tomador</th>
                <th className="py-2.5 px-4">Discriminação do Serviço Prestado</th>
                <th className="py-2.5 px-4 text-right">Valor dos Serviços</th>
                <th className="py-2.5 px-4 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {elegiveisFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Nenhuma Ordem de Serviço com mão de obra pendente de emissão de NFS-e no momento.
                  </td>
                </tr>
              ) : (
                elegiveisFiltrados.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                      {item.origemNumero}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px]">
                      {formatDateBr(item.data)}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-900">{item.clienteNome}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.clienteDocumento} • {item.clienteCidade}/{item.clienteEstado}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-700">
                      <div className="max-w-md line-clamp-2" title={item.descricaoServico}>
                        {item.descricaoServico}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(item.valorServicos)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => handleEmitirNfse(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition shadow-2xs cursor-pointer"
                        title="Transmitir NFS-e para a Prefeitura de Agudos"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-teal-400" />
                        <span>Emitir NFS-e</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. TABELA: HISTÓRICO DE NFS-E EMITIDAS */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Histórico de NFS-e Emitidas
            </h2>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono font-bold">
              {historicoFiltrado.length} notas
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Tributação: Agudos / SP (LC 116)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-2.5 px-4">Nº NFS-e</th>
                <th className="py-2.5 px-4">Código Verificação</th>
                <th className="py-2.5 px-4">Emissão</th>
                <th className="py-2.5 px-4">Cliente / Tomador</th>
                <th className="py-2.5 px-4">Discriminação</th>
                <th className="py-2.5 px-4 text-right">Valor Serviços</th>
                <th className="py-2.5 px-4 text-right">ISS (2%)</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historicoFiltrado.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Nenhuma NFS-e emitida até o momento
                  </td>
                </tr>
              ) : (
                historicoFiltrado.map((nota) => (
                  <tr key={nota.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {nota.numero}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{nota.codigoVerificacao}</span>
                        <button
                          onClick={() => copiarCodigo(nota.codigoVerificacao)}
                          className="text-slate-400 hover:text-slate-700 transition"
                          title="Copiar código autenticador"
                        >
                          {codigoCopiado === nota.codigoVerificacao ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                      {nota.dataEmissao}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-900">{nota.clienteNome}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {nota.origemNumero} • {nota.clienteDocumento}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 max-w-xs">
                      <div className="truncate" title={nota.discriminacaoServico}>
                        {nota.discriminacaoServico}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(nota.valorServicos)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-600 whitespace-nowrap">
                      {formatCurrency(nota.valorIss)}
                    </td>
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded text-[10px] font-medium font-mono">
                        <CheckCircle2 className="w-3 h-3 text-teal-600" />
                        Autorizada
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setNotaSelecionadaImpressao(nota)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer border border-slate-200/60"
                          title="Visualizar e Imprimir Espelho da NFS-e"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-600" />
                          <span>Imprimir NFS-e</span>
                        </button>

                        <button
                          onClick={() => handleDownloadXml(nota)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer border border-slate-200/60"
                          title="Baixar arquivo XML da NFS-e"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-600" />
                          <span>Download XML</span>
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

      {/* 5. MODAL ESPELHO DA NFS-E (PADRÃO PREFEITURA DE AGUDOS) */}
      {notaSelecionadaImpressao && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 my-8 overflow-hidden animate-fadeIn">
            <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-slate-300" />
                <span className="font-bold text-sm">
                  Nota Fiscal de Serviços Eletrônica - NFS-e
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Nº {notaSelecionadaImpressao.numero}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir NFS-e</span>
                </button>
                <button
                  onClick={() => setNotaSelecionadaImpressao(null)}
                  className="text-slate-400 hover:text-white transition p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Corpo Oficial da NFS-e */}
            <div className="p-6 text-xs text-slate-800 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Cabeçalho Prefeitura */}
              <div className="border border-slate-300 rounded p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left bg-slate-50/50">
                <div>
                  <div className="font-black text-sm text-slate-950 uppercase">Prefeitura Municipal de Agudos</div>
                  <div className="text-[11px] text-slate-600">Secretaria Municipal de Economia e Finanças</div>
                  <div className="text-[10px] text-slate-500">Nota Fiscal de Serviços Eletrônica - NFS-e</div>
                </div>
                <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-4">
                  <div className="font-bold text-xs text-slate-500">Número da NFS-e</div>
                  <div className="font-black text-lg font-mono text-slate-950">{notaSelecionadaImpressao.numero}</div>
                  <div className="text-[10px] font-mono text-slate-600">Data Emissão: {notaSelecionadaImpressao.dataEmissao}</div>
                  <div className="text-[10px] font-mono text-slate-600">Cód. Verificação: <strong className="text-teal-700">{notaSelecionadaImpressao.codigoVerificacao}</strong></div>
                </div>
              </div>

              {/* Dados do Prestador */}
              <div className="border border-slate-300 rounded p-3">
                <div className="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200 pb-1 mb-2">
                  Prestador de Serviços
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Razão Social:</span>
                    <strong className="text-slate-950">MFX TECNOLOGIA INDUSTRIAL LTDA</strong>
                    <div className="text-[11px] text-slate-600">Rua Sargento Andiras, 874 - Centro - Agudos/SP</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">CNPJ / Inscrição Municipal:</span>
                    <div className="font-mono text-slate-900 font-bold">52.148.963/0001-44</div>
                    <div className="text-[11px] text-slate-600 font-mono">Inscr. Municipal: 1401-0/01-88</div>
                  </div>
                </div>
              </div>

              {/* Dados do Tomador */}
              <div className="border border-slate-300 rounded p-3">
                <div className="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200 pb-1 mb-2">
                  Tomador de Serviços
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Nome / Razão Social:</span>
                    <strong className="text-slate-950">{notaSelecionadaImpressao.clienteNome}</strong>
                    <div className="text-[11px] text-slate-600">{notaSelecionadaImpressao.clienteCidade} - {notaSelecionadaImpressao.clienteEstado}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">CPF / CNPJ:</span>
                    <div className="font-mono text-slate-900 font-bold">{notaSelecionadaImpressao.clienteDocumento}</div>
                    <div className="text-[10px] text-slate-500">Origem: {notaSelecionadaImpressao.origemNumero}</div>
                  </div>
                </div>
              </div>

              {/* Discriminação dos Serviços */}
              <div className="border border-slate-300 rounded p-3">
                <div className="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200 pb-1 mb-2">
                  Discriminação dos Serviços Prestados
                </div>
                <div className="p-2 bg-slate-50 rounded text-slate-800 leading-relaxed font-sans text-xs min-h-[70px]">
                  {notaSelecionadaImpressao.discriminacaoServico}
                </div>
                <div className="mt-2 text-[10px] text-slate-500">
                  Item da Lista da LC 116/2003: <strong className="text-slate-800 font-mono">{notaSelecionadaImpressao.itemLc116}</strong> - {notaSelecionadaImpressao.descricaoLc116}.
                </div>
              </div>

              {/* Retenções e Valor dos Serviços */}
              <div className="border border-slate-300 rounded p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/50">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Valor dos Serviços</div>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    {formatCurrency(notaSelecionadaImpressao.valorServicos)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Alíquota ISS</div>
                  <div className="font-mono font-bold text-slate-900">
                    {notaSelecionadaImpressao.aliquotaIss.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Valor do ISS</div>
                  <div className="font-mono font-bold text-teal-700">
                    {formatCurrency(notaSelecionadaImpressao.valorIss)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold text-slate-700">Valor Líquido da NFS-e</div>
                  <div className="font-mono font-black text-sm text-slate-950">
                    {formatCurrency(notaSelecionadaImpressao.valorServicos)}
                  </div>
                </div>
              </div>

              {/* Rodapé Informativo */}
              <div className="border border-slate-300 rounded p-3 text-[10px] text-slate-600 leading-relaxed">
                <strong>OUTRAS INFORMAÇÕES:</strong> Emitente optante pelo Simples Nacional. O ISS é recolhido através do PGDAS-D. 
                Tributação no Município de Agudos/SP. Autenticidade garantida pelo código de verificação municipal.
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setNotaSelecionadaImpressao(null)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
