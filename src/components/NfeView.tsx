import React, { useState, useMemo } from 'react';
import { OrdemServico, Venda, NotaFiscalNfe } from '../types';
import { formatCurrency, formatDateBr } from '../utils/formatters';
import { 
  Receipt, 
  FileText, 
  Search, 
  Download, 
  Printer, 
  Ban, 
  CheckCircle2, 
  ShieldCheck, 
  Server, 
  Building2, 
  Copy, 
  Check, 
  X, 
  AlertCircle,
  Eye
} from 'lucide-react';

interface NfeViewProps {
  ordens: OrdemServico[];
  vendas: Venda[];
  notasEmitidas: NotaFiscalNfe[];
  onEmitirNfe: (novaNota: NotaFiscalNfe) => void;
  onCancelarNfe: (notaId: string, motivo: string) => void;
}

export const NfeView: React.FC<NfeViewProps> = ({
  ordens,
  vendas,
  notasEmitidas,
  onEmitirNfe,
  onCancelarNfe,
}) => {
  const [busca, setBusca] = useState('');
  const [chaveCopiada, setChaveCopiada] = useState<string | null>(null);

  // Modais
  const [notaSelecionadaDanfe, setNotaSelecionadaDanfe] = useState<NotaFiscalNfe | null>(null);
  const [notaParaCancelar, setNotaParaCancelar] = useState<NotaFiscalNfe | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [confirmadoOperador, setConfirmadoOperador] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const exibirToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Gerar chave de acesso de 44 dígitos realista
  const gerarChaveAcessoNfe = (numeroNota: string) => {
    const uf = '35'; // SP
    const aamm = '2610'; // Out/2026
    const cnpj = '52148963000144'; // CNPJ MFx
    const mod = '55';
    const serie = '001';
    const numLimpo = numeroNota.replace(/\D/g, '').padStart(9, '0');
    const tpEmis = '1'; // Normal
    const cNF = Math.floor(10000000 + Math.random() * 90000000).toString();
    const chaveParcial = `${uf}${aamm}${cnpj}${mod}${serie}${numLimpo}${tpEmis}${cNF}`;
    
    // Dígito verificador módulo 11
    let soma = 0;
    let peso = 2;
    for (let i = chaveParcial.length - 1; i >= 0; i--) {
      soma += parseInt(chaveParcial[i]) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    const resto = soma % 11;
    const dv = resto === 0 || resto === 1 ? 0 : 11 - resto;

    return `${chaveParcial}${dv}`;
  };

  // Montar itens elegíveis a partir de OS Concluídas/Faturadas que contenham produtos físicos
  const elegiveisOS = useMemo(() => {
    return ordens
      .filter((os) => (os.status === 'Concluído' || os.status === 'Faturado') && os.itens && os.itens.length > 0)
      .map((os) => {
        // Filtra apenas produtos/consumíveis (não serviços/mão de obra)
        const itensProdutos = os.itens.filter((it) => {
          if (it.tipoItem === 'servico') return false;
          if (it.categoria === 'Mão de Obra' || it.categoria === 'Serviços Laser' || it.categoria === 'Serviços Plasma' || it.categoria === 'Serviços Oxicorte') return false;
          return true;
        });

        const valorProdutos = itensProdutos.reduce((acc, it) => acc + (it.valorTotal || 0), 0);
        const notaVinculada = notasEmitidas.find(n => n.origemTipo === 'OS' && n.origemNumero === os.numeroOS);
        const jaEmitida = Boolean(notaVinculada);

        return {
          id: `os-${os.id}`,
          origemId: os.id,
          origemTipo: 'OS' as const,
          origemNumero: os.numeroOS,
          data: os.dataAbertura,
          clienteNome: os.clienteNome,
          clienteDocumento: os.clienteDocumento || 'Não informado',
          clienteCidade: os.clienteCidade,
          clienteEstado: os.clienteEstado,
          itensProdutos,
          valorProdutos,
          jaEmitida,
        };
      })
      .filter((item) => item.valorProdutos > 0 && !item.jaEmitida);
  }, [ordens, notasEmitidas]);

  // Montar itens elegíveis a partir de Vendas de Balcão (PDV)
  const elegiveisPDV = useMemo(() => {
    return vendas
      .map((vnd) => {
        const notaVinculada = notasEmitidas.find(n => n.origemTipo === 'PDV' && n.origemNumero === vnd.codigoVenda);
        const jaEmitida = Boolean(notaVinculada);
        return {
          id: `pdv-${vnd.id}`,
          origemId: vnd.id,
          origemTipo: 'PDV' as const,
          origemNumero: vnd.codigoVenda,
          data: vnd.dataVenda,
          clienteNome: vnd.clienteNome,
          clienteDocumento: vnd.clienteDocumento || 'Consumidor Final',
          clienteCidade: 'Agudos',
          clienteEstado: 'SP',
          itensProdutos: (vnd.itens || []).map(it => ({
            id: it.id,
            categoria: it.categoria || 'Consumíveis',
            codigo: it.codigo,
            descricao: it.descricao,
            unidade: it.unidadeMedida,
            precoUnitario: it.precoUnitario,
            quantidade: it.quantidade,
            valorTotal: it.valorTotal,
            prazoEntrega: 'Pronta Entrega',
          })),
          valorProdutos: vnd.valorTotal,
          jaEmitida,
        };
      })
      .filter((item) => item.valorProdutos > 0 && !item.jaEmitida);
  }, [vendas, notasEmitidas]);

  // Todas as vendas/OS elegíveis combinadas
  const todosElegiveis = useMemo(() => {
    const list = [...elegiveisOS, ...elegiveisPDV];
    if (!busca.trim()) return list;
    const termo = busca.toLowerCase();
    return list.filter(item => 
      item.origemNumero.toLowerCase().includes(termo) ||
      item.clienteNome.toLowerCase().includes(termo) ||
      item.clienteDocumento.toLowerCase().includes(termo)
    );
  }, [elegiveisOS, elegiveisPDV, busca]);

  // Histórico de NF-e filtrado
  const historicoFiltrado = useMemo(() => {
    if (!busca.trim()) return notasEmitidas;
    const termo = busca.toLowerCase();
    return notasEmitidas.filter(n =>
      n.numero.includes(termo) ||
      n.chaveAcesso.includes(termo) ||
      n.clienteNome.toLowerCase().includes(termo) ||
      n.origemNumero.toLowerCase().includes(termo)
    );
  }, [notasEmitidas, busca]);

  // Handler: Emitir NF-e
  const handleEmitirNfe = (item: typeof todosElegiveis[0]) => {
    const proximoNumero = (notasEmitidas.length + 1240).toString().padStart(9, '0');
    const numeroFormatado = `${proximoNumero.slice(0, 3)}.${proximoNumero.slice(3, 6)}.${proximoNumero.slice(6)}`;
    const chave = gerarChaveAcessoNfe(numeroFormatado);
    const agora = new Date();
    const dataHora = `${agora.toISOString().split('T')[0]} ${agora.toTimeString().split(' ')[0]}`;

    const novaNota: NotaFiscalNfe = {
      id: `nfe-${Date.now()}`,
      numero: numeroFormatado,
      serie: '1',
      chaveAcesso: chave,
      dataEmissao: dataHora,
      origemTipo: item.origemTipo,
      origemNumero: item.origemNumero,
      clienteNome: item.clienteNome,
      clienteDocumento: item.clienteDocumento,
      clienteCidade: item.clienteCidade,
      clienteEstado: item.clienteEstado,
      naturezaOperacao: 'Venda de mercadoria e consumíveis industriais',
      cfop: '5102',
      valorTotal: item.valorProdutos,
      status: 'Autorizada',
      protocoloAutorizacao: `1352600${Math.floor(1000000 + Math.random() * 9000000)}`,
      itens: item.itensProdutos.map(it => ({
        codigo: it.codigo,
        descricao: it.descricao,
        ncm: '8466.93.30',
        quantidade: it.quantidade,
        unidade: (it.unidade as string) || 'UN',
        valorUnitario: it.precoUnitario,
        valorTotal: it.valorTotal,
      })),
    };

    onEmitirNfe(novaNota);
    exibirToast(`NF-e nº ${novaNota.numero} emitida e autorizada na SEFAZ SP com sucesso!`);
  };

  // Handler: Confirmar Cancelamento
  const handleConfirmarCancelamento = () => {
    if (!notaParaCancelar) return;
    if (motivoCancelamento.trim().length < 15) {
      alert('A justificativa de cancelamento na SEFAZ deve conter no mínimo 15 caracteres.');
      return;
    }
    if (!confirmadoOperador) {
      alert('Por favor, confirme a solicitação no checkbox de segurança antes de prosseguir.');
      return;
    }
    onCancelarNfe(notaParaCancelar.id, motivoCancelamento.trim());
    exibirToast(`NF-e nº ${notaParaCancelar.numero} cancelada com homologação SEFAZ SP.`);
    setNotaParaCancelar(null);
    setMotivoCancelamento('');
    setConfirmadoOperador(false);
  };

  // Handler: Download XML
  const handleDownloadXml = (nota: NotaFiscalNfe) => {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe>
    <infNFe Id="NFe${nota.chaveAcesso}" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <natOp>${nota.naturezaOperacao}</natOp>
        <mod>55</mod>
        <serie>${nota.serie}</serie>
        <nNF>${nota.numero.replace(/\D/g, '')}</nNF>
        <dhEmi>${nota.dataEmissao.replace(' ', 'T')}-03:00</dhEmi>
        <tpNF>1</tpNF>
        <idDest>1</idDest>
        <cMunFG>3500709</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
      </ide>
      <emit>
        <CNPJ>52148963000144</CNPJ>
        <xNome>MFX TECNOLOGIA INDUSTRIAL LTDA</xNome>
        <xFant>MFX TECNOLOGIA</xFant>
        <enderEmit>
          <xLgr>RUA SARGENTO ANDIRAS</xLgr>
          <nro>874</nro>
          <xBairro>CENTRO</xBairro>
          <cMun>3500709</cMun>
          <xMun>AGUDOS</xMun>
          <UF>SP</UF>
          <CEP>17120000</CEP>
        </enderEmit>
        <IE>140123456110</IE>
        <CRT>1</CRT>
      </emit>
      <dest>
        <xNome>${nota.clienteNome}</xNome>
        <CNPJ>${nota.clienteDocumento.replace(/\D/g, '')}</CNPJ>
      </dest>
      <total>
        <ICMSTot>
          <vProd>${nota.valorTotal.toFixed(2)}</vProd>
          <vNF>${nota.valorTotal.toFixed(2)}</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
  <protNFe versao="4.00">
    <infProt>
      <tpAmb>1</tpAmb>
      <verAplic>SP_NFE_PL_009_V400</verAplic>
      <chNFe>${nota.chaveAcesso}</chNFe>
      <dhRecbto>${nota.dataEmissao.replace(' ', 'T')}-03:00</dhRecbto>
      <nProt>${nota.protocoloAutorizacao}</nProt>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e</xMotivo>
    </infProt>
  </protNFe>
</nfeProc>`;

    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NFe_${nota.chaveAcesso}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    exibirToast(`XML da NF-e nº ${nota.numero} baixado.`);
  };

  const copiarChave = (chave: string) => {
    navigator.clipboard.writeText(chave);
    setChaveCopiada(chave);
    setTimeout(() => setChaveCopiada(null), 2000);
  };

  const formatarChave = (ch: string) => {
    return ch.replace(/(\d{4})/g, '$1 ').trim();
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
              SEFAZ SP • MODELO 55
            </span>
            <span className="text-xs text-slate-400">MFx Tecnologia Industrial</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Emissão e Gestão de NF-e (Produtos / SEFAZ SP)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Faturamento e transmissão de notas fiscais eletrônicas modelo 55 de peças e consumíveis.
          </p>
        </div>

        {/* Campo de Busca Rápida */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar nota, OS, venda ou cliente..."
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
              Certificado Digital
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>A1 Válido (e-CNPJ)</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
              Vencimento: 20/12/2027
            </div>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-mono font-medium">
            Conectado
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Ambiente SEFAZ
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-blue-600" />
              <span>Produção Ativo</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
              SEFAZ-SP • WebServices v4.00
            </div>
          </div>
          <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-mono font-medium">
            0.18s ON
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Regime Tributário
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-700" />
              <span>Simples Nacional</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
              CNAE 3314-7 • CFOP 5102
            </div>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-mono font-medium">
            Agudos / SP
          </span>
        </div>
      </div>

      {/* 3. TABELA: OS E VENDAS ELEGÍVEIS PARA NF-E */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-slate-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              OS e Vendas Elegíveis para NF-e
            </h2>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono font-bold">
              {todosElegiveis.length} pendentes
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Produtos e consumíveis com saída realizada aguardando emissão de NF-e
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-2.5 px-4">Nº Venda / OS</th>
                <th className="py-2.5 px-4">Data</th>
                <th className="py-2.5 px-4">Cliente / Destinatário</th>
                <th className="py-2.5 px-4">Consumíveis / Peças</th>
                <th className="py-2.5 px-4 text-right">Valor dos Produtos</th>
                <th className="py-2.5 px-4 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todosElegiveis.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Nenhuma venda ou OS com produtos pendente de emissão de NF-e no momento.
                  </td>
                </tr>
              ) : (
                todosElegiveis.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                          item.origemTipo === 'OS' 
                            ? 'bg-red-50 text-red-700 border border-red-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {item.origemTipo}
                        </span>
                        {item.origemNumero}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px]">
                      {formatDateBr(item.data)}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-900">{item.clienteNome}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.clienteDocumento}</div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      <div className="max-w-xs truncate" title={item.itensProdutos.map(i => `${i.quantidade}x ${i.descricao}`).join(', ')}>
                        {item.itensProdutos.length} item(ns): {item.itensProdutos.map(i => i.descricao).join(', ')}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(item.valorProdutos)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => handleEmitirNfe(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition shadow-2xs cursor-pointer"
                        title="Transmitir NF-e para a SEFAZ SP"
                      >
                        <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Emitir NF-e</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. TABELA: HISTÓRICO DE NF-E EMITIDAS */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Histórico de NF-e Emitidas
            </h2>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono font-bold">
              {historicoFiltrado.length} notas
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Ambiente SEFAZ Produção SP
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-2.5 px-4">Nº NF-e</th>
                <th className="py-2.5 px-4">Série</th>
                <th className="py-2.5 px-4">Chave de Acesso</th>
                <th className="py-2.5 px-4">Emissão</th>
                <th className="py-2.5 px-4">Cliente / Destinatário</th>
                <th className="py-2.5 px-4 text-right">Valor Total</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historicoFiltrado.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Nenhuma nota emitida até o momento
                  </td>
                </tr>
              ) : (
                historicoFiltrado.map((nota) => (
                  <tr key={nota.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                      {nota.numero}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">
                      {nota.serie}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[170px]" title={nota.chaveAcesso}>
                          {formatarChave(nota.chaveAcesso).substring(0, 24)}...
                        </span>
                        <button
                          onClick={() => copiarChave(nota.chaveAcesso)}
                          className="text-slate-400 hover:text-slate-700 transition"
                          title="Copiar chave completa de 44 dígitos"
                        >
                          {chaveCopiada === nota.chaveAcesso ? (
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
                      {nota.status === 'Cancelada' && nota.motivoCancelamento && (
                        <div className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200/80 rounded px-1.5 py-0.5 mt-1 max-w-xs truncate" title={`Justificativa SEFAZ: ${nota.motivoCancelamento} | Protocolo: ${nota.protocoloCancelamento || 'Homologado'}`}>
                          <span className="font-medium text-slate-600">Motivo:</span> "{nota.motivoCancelamento}"
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(nota.valorTotal)}
                    </td>
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      {nota.status === 'Autorizada' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-medium font-mono">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Autorizada
                        </span>
                      ) : (
                        <div className="inline-flex flex-col items-center">
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded text-[10px] font-medium font-mono" title={nota.motivoCancelamento ? `Motivo: ${nota.motivoCancelamento}` : undefined}>
                            <Ban className="w-3 h-3 text-slate-500" />
                            Cancelada
                          </span>
                          {nota.dataCancelamento && (
                            <span className="text-[9px] text-slate-400 font-mono mt-0.5" title={`Protocolo SEFAZ SP: ${nota.protocoloCancelamento || 'Homologado'}`}>
                              {nota.dataCancelamento}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setNotaSelecionadaDanfe(nota)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer border border-slate-200/60"
                          title="Visualizar e Imprimir DANFE em PDF"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-600" />
                          <span>DANFE PDF</span>
                        </button>

                        <button
                          onClick={() => handleDownloadXml(nota)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer border border-slate-200/60"
                          title="Baixar arquivo XML assinado pela SEFAZ"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-600" />
                          <span>Download XML</span>
                        </button>

                        {nota.status === 'Autorizada' ? (
                          <button
                            onClick={() => {
                              setNotaParaCancelar(nota);
                              setMotivoCancelamento('');
                              setConfirmadoOperador(false);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-red-700 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer border border-slate-200/60"
                            title="Cancelar NF-e na SEFAZ SP"
                          >
                            <Ban className="w-3.5 h-3.5 text-slate-500" />
                            <span>Cancelar NF-e</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-400 text-xs font-medium flex items-center gap-1.5 cursor-not-allowed border border-slate-200/40"
                            title={nota.motivoCancelamento ? `Cancelada: ${nota.motivoCancelamento}` : 'Reemissão desabilitada'}
                          >
                            <Ban className="w-3.5 h-3.5 text-slate-400" />
                            <span>Cancelada</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL DANFE (VISUALIZAÇÃO / IMPRESSÃO) */}
      {notaSelecionadaDanfe && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-200 my-8 overflow-hidden animate-fadeIn">
            <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-slate-300" />
                <span className="font-bold text-sm">
                  DANFE - Documento Auxiliar da Nota Fiscal Eletrônica
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Nº {notaSelecionadaDanfe.numero} • Série {notaSelecionadaDanfe.serie}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir DANFE</span>
                </button>
                <button
                  onClick={() => setNotaSelecionadaDanfe(null)}
                  className="text-slate-400 hover:text-white transition p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Espelho do DANFE */}
            <div className="p-6 text-xs text-slate-800 space-y-4 max-h-[75vh] overflow-y-auto">
              {notaSelecionadaDanfe.status === 'Cancelada' && (
                <div className="bg-slate-100 border border-slate-300 text-slate-800 p-3 rounded text-center">
                  <div className="font-bold text-xs uppercase tracking-wider text-red-700">
                    NF-E CANCELADA JUNTO À SEFAZ SP — DOCUMENTO SEM EFICÁCIA FISCAL
                  </div>
                  <div className="text-[11px] mt-0.5 font-mono text-slate-600">
                    Data: {notaSelecionadaDanfe.dataCancelamento || 'Homologado'} • Protocolo SEFAZ: {notaSelecionadaDanfe.protocoloCancelamento || '135260000000000'}
                  </div>
                  {notaSelecionadaDanfe.motivoCancelamento && (
                    <div className="text-[11px] text-slate-700 mt-1 italic">
                      Justificativa: "{notaSelecionadaDanfe.motivoCancelamento}"
                    </div>
                  )}
                </div>
              )}

              {/* Topo DANFE */}
              <div className="border border-slate-300 rounded p-4 grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-4 border-r border-slate-200 pr-3">
                  <div className="font-black text-sm text-slate-950">MFX TECNOLOGIA INDUSTRIAL LTDA</div>
                  <div className="text-[11px] text-slate-600 mt-1">Rua Sargento Andiras, 874 - Centro</div>
                  <div className="text-[11px] text-slate-600">Agudos - SP • CEP: 17120-000</div>
                  <div className="text-[11px] text-slate-600">Tel: (14) 99845-7721</div>
                </div>

                <div className="md:col-span-3 text-center border-r border-slate-200 pr-3 flex flex-col justify-center">
                  <div className="font-black text-base text-slate-900">DANFE</div>
                  <div className="text-[10px] text-slate-500 uppercase">Documento Auxiliar da NF-e</div>
                  <div className="text-xs font-mono font-bold mt-1">0 - ENTRADA / 1 - SAÍDA: <strong className="text-emerald-700">1</strong></div>
                  <div className="text-xs font-mono font-bold">Nº {notaSelecionadaDanfe.numero}</div>
                  <div className="text-[11px] text-slate-500 font-mono">Série {notaSelecionadaDanfe.serie}</div>
                </div>

                <div className="md:col-span-5 flex flex-col justify-center">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Chave de Acesso SEFAZ</div>
                  <div className="font-mono text-[10px] font-bold bg-slate-100 p-1.5 rounded border border-slate-200 break-all select-all">
                    {formatarChave(notaSelecionadaDanfe.chaveAcesso)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Consulta de autenticidade no portal nacional da NF-e (www.nfe.fazenda.gov.br)
                  </div>
                  <div className="text-[10px] font-mono font-bold text-emerald-700 mt-0.5">
                    Protocolo: {notaSelecionadaDanfe.protocoloAutorizacao}
                  </div>
                </div>
              </div>

              {/* Destinatário */}
              <div className="border border-slate-300 rounded p-3">
                <div className="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200 pb-1 mb-2">
                  Destinatário / Remetente
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Nome / Razão Social:</span>
                    <strong className="text-slate-900">{notaSelecionadaDanfe.clienteNome}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">CNPJ / CPF:</span>
                    <strong className="font-mono text-slate-900">{notaSelecionadaDanfe.clienteDocumento}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Município / UF:</span>
                    <strong className="text-slate-900">{notaSelecionadaDanfe.clienteCidade} - {notaSelecionadaDanfe.clienteEstado}</strong>
                  </div>
                </div>
              </div>

              {/* Tabela de Produtos */}
              <div className="border border-slate-300 rounded overflow-hidden">
                <div className="bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-600 uppercase border-b border-slate-200">
                  Dados dos Produtos / Consumíveis Faturados
                </div>
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[9px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2">Código</th>
                      <th className="p-2">Descrição dos Produtos</th>
                      <th className="p-2">NCM</th>
                      <th className="p-2">CFOP</th>
                      <th className="p-2 text-center">Un.</th>
                      <th className="p-2 text-center">Qtd.</th>
                      <th className="p-2 text-right">Vl. Unit.</th>
                      <th className="p-2 text-right">Vl. Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {notaSelecionadaDanfe.itens.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-bold">{it.codigo}</td>
                        <td className="p-2 font-sans font-medium">{it.descricao}</td>
                        <td className="p-2">{it.ncm}</td>
                        <td className="p-2">5102</td>
                        <td className="p-2 text-center">{it.unidade}</td>
                        <td className="p-2 text-center">{it.quantidade}</td>
                        <td className="p-2 text-right">{formatCurrency(it.valorUnitario)}</td>
                        <td className="p-2 text-right font-bold">{formatCurrency(it.valorTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totais do Imposto */}
              <div className="border border-slate-300 rounded p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/50">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Base Cálculo ICMS</div>
                  <div className="font-mono font-bold text-slate-900">R$ 0,00 (Simples)</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Valor do ICMS</div>
                  <div className="font-mono font-bold text-slate-900">R$ 0,00</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Valor do Frete</div>
                  <div className="font-mono font-bold text-slate-900">R$ 0,00</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold text-slate-700">Valor Total da Nota</div>
                  <div className="font-mono font-black text-sm text-slate-950">
                    {formatCurrency(notaSelecionadaDanfe.valorTotal)}
                  </div>
                </div>
              </div>

              {/* Dados Adicionais */}
              <div className="border border-slate-300 rounded p-3 text-[10px] text-slate-600 leading-relaxed">
                <strong>INFORMAÇÕES COMPLEMENTARES:</strong> Documento emitido por ME ou EPP optante pelo Simples Nacional. 
                Não gera direito a crédito fiscal de IPI. Permite o aproveitamento do crédito de ICMS no valor correspondente à alíquota do Simples Nacional. 
                Origem da Venda: {notaSelecionadaDanfe.origemNumero}.
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setNotaSelecionadaDanfe(null)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL CANCELAMENTO NF-E (SEFAZ SP) */}
      {notaParaCancelar && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-fadeIn">
            {/* Cabeçalho */}
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
                  <Ban className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Cancelamento de NF-e</h3>
                  <p className="text-[11px] text-slate-500 font-mono">SEFAZ SP • Modelo 55 • Homologação Fiscal</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setNotaParaCancelar(null);
                  setMotivoCancelamento('');
                  setConfirmadoOperador(false);
                }}
                className="text-slate-400 hover:text-slate-700 transition p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-5 space-y-4 text-xs">
              {/* Resumo da Nota */}
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Nº NF-e / Série:</span>
                  <span className="font-mono font-bold text-slate-800">{notaParaCancelar.numero} (Série {notaParaCancelar.serie})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Destinatário:</span>
                  <span className="font-semibold text-slate-800">{notaParaCancelar.clienteNome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Origem da Emissão:</span>
                  <span className="font-mono text-slate-700">{notaParaCancelar.origemNumero}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Valor Total Faturado:</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(notaParaCancelar.valorTotal)}</span>
                </div>
              </div>

              {/* Justificativa */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">
                    Motivo / Justificativa do Cancelamento <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-[10px] font-mono ${motivoCancelamento.trim().length >= 15 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    {motivoCancelamento.trim().length}/15 caracteres mínimos
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={motivoCancelamento}
                  onChange={(e) => setMotivoCancelamento(e.target.value)}
                  placeholder="Ex: Cancelamento solicitado pelo cliente em virtude de readequação dos itens do pedido."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-400 text-xs"
                />
                <p className="text-[11px] text-slate-400">
                  Regra SEFAZ SP: A justificativa deve conter no mínimo 15 caracteres claros e objetivos.
                </p>
              </div>

              {/* Confirmação de Segurança do Operador */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmadoOperador}
                    onChange={(e) => setConfirmadoOperador(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                  />
                  <span className="text-slate-600 leading-snug text-xs">
                    Confirmo o pedido de cancelamento desta NF-e junto à SEFAZ SP. Estou ciente de que a operação é irreversível e o documento será invalidado.
                  </span>
                </label>
              </div>
            </div>

            {/* Rodapé de Ações */}
            <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setNotaParaCancelar(null);
                  setMotivoCancelamento('');
                  setConfirmadoOperador(false);
                }}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleConfirmarCancelamento}
                disabled={motivoCancelamento.trim().length < 15 || !confirmadoOperador}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5 text-slate-300" />
                <span>Confirmar Cancelamento</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
