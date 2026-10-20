import React, { useState } from 'react';
import { Cliente } from '../types';
import { fetchCnpjData, fetchCepData, fetchInscricaoEstadualSefaz, cleanDigits } from '../utils/brasilApi';
import { formatCpfCnpj, formatCep, formatPhone } from '../utils/formatters';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Plus, 
  Trash2, 
  Sparkles,
  MessageCircle,
  FilePlus2,
  Edit,
  X,
  BadgeCheck,
  Building,
  RotateCcw,
  FileCheck
} from 'lucide-react';

interface ClientesViewProps {
  clientes: Cliente[];
  onAddCliente: (cliente: Cliente) => void;
  onUpdateCliente?: (cliente: Cliente) => void;
  onDeleteCliente: (id: string) => void;
  onCriarOsParaCliente: (clienteId: string) => void;
}

export const ClientesView: React.FC<ClientesViewProps> = ({
  clientes,
  onAddCliente,
  onUpdateCliente,
  onDeleteCliente,
  onCriarOsParaCliente,
}) => {
  // Form State
  const [documento, setDocumento] = useState('');
  const [nome, setNome] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [inscricaoEstadual, setInscricaoEstadual] = useState('');
  const [indicadorIe, setIndicadorIe] = useState<'1' | '2' | '9'>('2');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('Agudos');
  const [estado, setEstado] = useState('SP');
  const [cep, setCep] = useState('');
  const [telefone, setTelefone] = useState('');
  const [celular, setCelular] = useState('');
  const [email, setEmail] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // UI state
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const MENSAGEM_INICIAL = 'ℹ️ Digite o CNPJ para buscar os dados automaticamente.';
  const [feedbackStatus, setFeedbackStatus] = useState<string>(MENSAGEM_INICIAL);
  const [feedbackTipo, setFeedbackTipo] = useState<'info' | 'warning' | 'success' | 'danger'>('info');
  const [situacaoCadastral, setSituacaoCadastral] = useState<string | null>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [clienteEditandoId, setClienteEditandoId] = useState<string | null>(null);

  // Função rápida para preencher "ISENTO" ao clicar
  const definirIsento = () => {
    setInscricaoEstadual('ISENTO');
    setIndicadorIe('2'); // Contribuinte Isento
    setFeedbackStatus('ℹ️ Inscrição Estadual definida como ISENTO (Indicador 2 - Contribuinte Isento).');
    setFeedbackTipo('info');
  };

  // Limpar formulário
  const limparFormulario = () => {
    setDocumento('');
    setNome('');
    setNomeFantasia('');
    setInscricaoEstadual('');
    setIndicadorIe('2');
    setLogradouro('');
    setNumero('');
    setComplemento('');
    setBairro('');
    setCidade('Agudos');
    setEstado('SP');
    setCep('');
    setTelefone('');
    setCelular('');
    setEmail('');
    setObservacoes('');
    setSituacaoCadastral(null);
    setFeedbackStatus(MENSAGEM_INICIAL);
    setFeedbackTipo('info');
    setClienteEditandoId(null);
  };

  // Carregar dados de cliente existente para edição
  const handleEditarCliente = (cli: Cliente) => {
    setClienteEditandoId(cli.id);
    setDocumento(cli.documento);
    setNome(cli.nome);
    setNomeFantasia(cli.nomeFantasia || '');
    setInscricaoEstadual(cli.inscricaoEstadual || '');
    setIndicadorIe(cli.indicadorIe || '2');
    setLogradouro(cli.logradouro);
    setNumero(cli.numero);
    setComplemento(cli.complemento || '');
    setBairro(cli.bairro);
    setCidade(cli.cidade);
    setEstado(cli.estado);
    setCep(cli.cep);
    setTelefone(cli.telefone || '');
    setCelular(cli.celular || '');
    setEmail(cli.email || '');
    setObservacoes(cli.observacoes || '');
    setSituacaoCadastral(null);
    setFeedbackStatus(`Editando cadastro de "${cli.nome}". Modifique os dados e clique em Salvar Cliente.`);
    setFeedbackTipo('info');

    const formEl = document.getElementById('form_cliente_box');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Função inteligente para consultar CPF ou CNPJ automaticamente
  const consultarDocumento = async (inputValor: string) => {
    const doc = cleanDigits(inputValor);

    // Se for CPF (11 dígitos)
    if (doc.length === 11) {
      setFeedbackStatus('⚠️ CPF detectado. Preencha os dados manualmente.');
      setFeedbackTipo('warning');
      setIndicadorIe('9'); // Não Contribuinte
      setInscricaoEstadual('ISENTO');
      return;
    }

    // Se for CNPJ (14 dígitos)
    if (doc.length === 14) {
      setLoadingCnpj(true);
      setFeedbackStatus('⏳ Consultando dados na Receita Federal e SEFAZ...');
      setFeedbackTipo('info');

      try {
        // 1. Consulta principal BrasilAPI (Receita Federal)
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${doc}`);

        if (response.ok) {
          const data = await response.json();

          // Preenche Razão Social e Nome Fantasia
          setNome(data.razao_social || '');
          setNomeFantasia(data.nome_fantasia || '');

          // Preenche Endereço completo
          setCep(data.cep ? formatCep(data.cep) : '');
          setLogradouro(data.logradouro || '');
          setNumero(data.numero || '');
          setComplemento(data.complemento || '');
          setBairro(data.bairro || '');
          setCidade(data.municipio || '');
          const ufEncontrada = data.uf || 'SP';
          setEstado(ufEncontrada);
          setTelefone(data.ddd_telefone_1 ? formatPhone(data.ddd_telefone_1) : '');
          setEmail(data.email ? data.email.toLowerCase() : '');

          const situacao = data.descricao_situacao_cadastral || data.situacao_cadastral || 'ATIVA';
          setSituacaoCadastral(situacao);

          // 2. Consulta complementar automática para buscar Inscrição Estadual (SEFAZ / CNPJ.ws)
          let ieEncontrada = '';

          // Verifica se porventura a BrasilAPI retornou Inscrições Estaduais
          if (data.inscricoes_estaduais && Array.isArray(data.inscricoes_estaduais) && data.inscricoes_estaduais.length > 0) {
            const ieItem = data.inscricoes_estaduais.find((i: any) => i.ativo) || data.inscricoes_estaduais[0];
            if (ieItem && ieItem.inscricao_estadual) {
              ieEncontrada = String(ieItem.inscricao_estadual).trim();
            }
          }

          // Se não veio na BrasilAPI, consulta a API pública CNPJ.ws
          if (!ieEncontrada) {
            try {
              const ieSefaz = await fetchInscricaoEstadualSefaz(doc, ufEncontrada);
              if (ieSefaz) {
                ieEncontrada = ieSefaz;
              }
            } catch (errWs) {
              console.warn('Consulta complementar SEFAZ/CNPJ.ws indisponível:', errWs);
            }
          }

          // 3 & 4. Regras de preenchimento de Inscrição Estadual e Indicador IE
          if (ieEncontrada && ieEncontrada.toUpperCase() !== 'ISENTO') {
            setInscricaoEstadual(ieEncontrada);
            setIndicadorIe('1'); // 1 - Contribuinte ICMS (Possui Inscrição Estadual)
            setFeedbackStatus(`✅ Dados carregados com sucesso! Razão Social: "${data.razao_social}" | IE SEFAZ: ${ieEncontrada} (Contribuinte ICMS).`);
            setFeedbackTipo('success');
          } else {
            setInscricaoEstadual('ISENTO');
            setIndicadorIe('2'); // 2 - Contribuinte Isento de Inscrição Estadual
            setFeedbackStatus(`✅ Dados carregados com sucesso! Razão Social: "${data.razao_social}" | IE: ISENTO (Contribuinte Isento).`);
            setFeedbackTipo('success');
          }
        } else {
          setFeedbackStatus('❌ CNPJ não encontrado.');
          setFeedbackTipo('danger');
        }
      } catch (error) {
        console.error('Erro:', error);
        setFeedbackStatus('❌ Erro ao consultar o CNPJ.');
        setFeedbackTipo('danger');
      } finally {
        setLoadingCnpj(false);
      }
    } else if (doc.length > 0 && doc.length < 11) {
      setFeedbackStatus('⚠️ Documento incompleto. Digite 11 dígitos para CPF ou 14 dígitos para CNPJ.');
      setFeedbackTipo('warning');
    }
  };

  // Função ONBLUR do campo CEP
  const handleCepBlur = async () => {
    const limpo = cleanDigits(cep);
    if (limpo.length === 8) {
      setLoadingCep(true);
      try {
        const dados = await fetchCepData(limpo);
        if (dados) {
          if (dados.logradouro) setLogradouro(dados.logradouro);
          if (dados.bairro) setBairro(dados.bairro);
          if (dados.cidade) setCidade(dados.cidade);
          if (dados.estado) setEstado(dados.estado);
          setFeedbackStatus(`✅ Endereço localizado pelo CEP (${dados.cidade}/${dados.estado}).`);
          setFeedbackTipo('success');
        }
      } catch (err: any) {
        setFeedbackStatus('⚠️ CEP não encontrado. Preencha o endereço manualmente.');
        setFeedbackTipo('warning');
      } finally {
        setLoadingCep(false);
      }
    }
  };

  // Submissão do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!documento || !nome || !logradouro || !cidade) {
      setFeedbackStatus('❌ Por favor, preencha os campos obrigatórios (*).');
      setFeedbackTipo('danger');
      return;
    }

    if (clienteEditandoId) {
      const clienteAtualizado: Cliente = {
        id: clienteEditandoId,
        documento: formatCpfCnpj(documento),
        nome,
        nomeFantasia: nomeFantasia || undefined,
        inscricaoEstadual: inscricaoEstadual || undefined,
        indicadorIe,
        logradouro,
        numero: numero || 'S/N',
        complemento,
        bairro: bairro || 'Centro',
        cidade,
        estado,
        cep: formatCep(cep),
        telefone: telefone ? formatPhone(telefone) : '',
        celular: celular ? formatPhone(celular) : '',
        email,
        observacoes,
        dataCadastro: new Date().toISOString().split('T')[0],
      };

      if (onUpdateCliente) {
        onUpdateCliente(clienteAtualizado);
      } else {
        onDeleteCliente(clienteEditandoId);
        onAddCliente(clienteAtualizado);
      }

      limparFormulario();
      setFeedbackStatus(`✅ Cadastro do cliente "${nome}" atualizado com sucesso!`);
      setFeedbackTipo('success');
    } else {
      const novoCliente: Cliente = {
        id: `cli-${Date.now()}`,
        documento: formatCpfCnpj(documento),
        nome,
        nomeFantasia: nomeFantasia || undefined,
        inscricaoEstadual: inscricaoEstadual || undefined,
        indicadorIe,
        logradouro,
        numero: numero || 'S/N',
        complemento,
        bairro: bairro || 'Centro',
        cidade,
        estado,
        cep: formatCep(cep),
        telefone: telefone ? formatPhone(telefone) : '',
        celular: celular ? formatPhone(celular) : '',
        email,
        observacoes,
        dataCadastro: new Date().toISOString().split('T')[0],
      };

      onAddCliente(novoCliente);
      limparFormulario();
      setFeedbackStatus(`✅ Cliente "${nome}" cadastrado com sucesso no sistema da MFx Tecnologia!`);
      setFeedbackTipo('success');
    }
  };

  // Botões de teste rápido com CNPJ para demonstrar BrasilAPI
  const preencherCnpjExemplo = (cnpjExemplo: string) => {
    setDocumento(cnpjExemplo);
    consultarDocumento(cnpjExemplo);
  };

  // Filtro de clientes
  const clientesFiltrados = clientes.filter((c) => {
    const t = termoBusca.toLowerCase();
    return (
      c.nome.toLowerCase().includes(t) ||
      (c.nomeFantasia && c.nomeFantasia.toLowerCase().includes(t)) ||
      c.documento.includes(t) ||
      (c.inscricaoEstadual && c.inscricaoEstadual.toLowerCase().includes(t)) ||
      c.cidade.toLowerCase().includes(t) ||
      (c.email && c.email.toLowerCase().includes(t))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner de Cabeçalho do Módulo */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              Clientes & Fornecedores
            </span>
            <span className="text-xs text-slate-500 font-medium">| MFx Tecnologia Industrial (CNPJ: 34.375.789/0001-87)</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-red-600" />
            Cadastro e Gestão de Clientes - MFx Tecnologia
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Digite o CPF ou CNPJ. Ao sair do campo (<code className="text-red-600 font-mono text-xs bg-red-50 px-1 py-0.5 rounded">onblur</code>), o sistema consulta a <strong>BrasilAPI pública</strong> e autocompleta Razão Social, Nome Fantasia, Inscrição Estadual, Endereço, CEP e Contato.
          </p>
        </div>

        {/* Quick test buttons */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs space-y-1.5 self-start md:self-auto shrink-0">
          <div className="font-semibold text-slate-700 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Testar BrasilAPI (Clique para preencher):
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => preencherCnpjExemplo('34375789000187')}
              className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 px-2.5 py-1 rounded text-[11px] font-mono font-medium transition cursor-pointer"
              title="CNPJ Oficial da MFx Tecnologia Industrial"
            >
              MFx (34.375.789/0001-87)
            </button>
            <button
              type="button"
              onClick={() => preencherCnpjExemplo('00000000000191')}
              className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 px-2.5 py-1 rounded text-[11px] font-mono font-medium transition cursor-pointer"
              title="Banco do Brasil"
            >
              BB (00.000.000/0001-91)
            </button>
            <button
              type="button"
              onClick={() => preencherCnpjExemplo('33000167000101')}
              className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 px-2.5 py-1 rounded text-[11px] font-mono font-medium transition cursor-pointer"
              title="Petrobras"
            >
              Petrobras
            </button>
          </div>
        </div>
      </div>

      {/* Card Principal: FORMULÁRIO DE CADASTRO DO CLIENTE (PRONTO PARA FATURAMENTO E NF-E) */}
      <div id="form_cliente_box" className="card shadow-sm p-4 sm:p-6 bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="mb-0 font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
            <span>➕ FORMULÁRIO DE CADASTRO DO CLIENTE (PRONTO PARA FATURAMENTO E NF-E)</span>
          </h4>
          {clienteEditandoId && (
            <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded font-semibold flex items-center gap-1">
              <Edit className="w-3.5 h-3.5" /> Editando Cliente
            </span>
          )}
        </div>

        {/* Alerta de Feedback dinâmico */}
        <div
          id="feedback_status"
          className={`alert py-2.5 px-4 mb-4 rounded-lg text-xs sm:text-sm font-medium border flex items-center justify-between gap-2 transition-all ${
            feedbackTipo === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : feedbackTipo === 'warning'
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : feedbackTipo === 'danger'
              ? 'bg-red-50 text-red-800 border-red-300'
              : 'bg-slate-100 text-slate-700 border-slate-300'
          }`}
          role="alert"
        >
          <div className="flex items-center gap-2">
            {loadingCnpj && <Loader2 className="w-4 h-4 animate-spin text-slate-600 shrink-0" />}
            <span>{feedbackStatus}</span>
          </div>
          {situacaoCadastral && (
            <span className="bg-emerald-600 text-white text-[11px] px-2 py-0.5 rounded font-mono font-bold shrink-0">
              {situacaoCadastral}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="row g-3 grid grid-cols-1 md:grid-cols-12 gap-3.5">
          
          {/* CPF OU CNPJ * (col-md-4) */}
          <div className="col-md-4 md:col-span-4">
            <label htmlFor="documento" className="form-label block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              CPF OU CNPJ *
            </label>
            <input
              type="text"
              className="form-control w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono"
              name="documento"
              id="documento"
              placeholder="Digite apenas números"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              onBlur={(e) => consultarDocumento(e.target.value)}
              required
            />
          </div>

          {/* RAZÃO SOCIAL (NOME COMPLETO) * (col-md-8) */}
          <div className="col-md-8 md:col-span-8">
            <label htmlFor="nome" className="form-label block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              RAZÃO SOCIAL (NOME COMPLETO) *
            </label>
            <input
              type="text"
              className="form-control w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-medium"
              name="nome"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          {/* NOME FANTASIA (OPCIONAL) (col-md-12) */}
          <div className="col-md-12 md:col-span-12">
            <label htmlFor="nome_fantasia" className="form-label block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              NOME FANTASIA (OPCIONAL)
            </label>
            <input
              type="text"
              className="form-control w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              name="nome_fantasia"
              id="nome_fantasia"
              value={nomeFantasia}
              onChange={(e) => setNomeFantasia(e.target.value)}
            />
          </div>

          {/* CAMPO DE INSCRIÇÃO ESTADUAL LIMPO E FUNCIONAL */}
          <div className="col-md-6 md:col-span-6">
            <div className="d-flex justify-content-between align-items-center mb-1 flex justify-between items-center">
              <label htmlFor="inscricao_estadual" className="form-label mb-0 block text-xs font-bold text-slate-700 uppercase tracking-wide">
                INSCRIÇÃO ESTADUAL (IE)
              </label>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary py-0.5 px-2 border border-slate-300 hover:bg-slate-100 rounded text-slate-600 font-medium text-[11px] transition cursor-pointer"
                onClick={definirIsento}
                style={{ fontSize: '11px' }}
              >
                Definir ISENTO
              </button>
            </div>
            <input
              type="text"
              className="form-control w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono mt-1"
              name="inscricao_estadual"
              id="inscricao_estadual"
              value={inscricaoEstadual}
              onChange={(e) => setInscricaoEstadual(e.target.value)}
            />
          </div>

          <div className="col-md-6 md:col-span-6">
            <label htmlFor="indicador_ie" className="form-label block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              INDICADOR DE IE (SEFAZ) <small className="text-slate-500 font-normal lowercase">enquadramento fiscal</small>
            </label>
            <select
              className="form-select w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
              name="indicador_ie"
              id="indicador_ie"
              value={indicadorIe}
              onChange={(e) => setIndicadorIe(e.target.value as '1' | '2' | '9')}
            >
              <option value="1">1 - Contribuinte ICMS (Possui Inscrição Estadual)</option>
              <option value="2">2 - Contribuinte Isento de Inscrição Estadual</option>
              <option value="9">9 - Não Contribuinte (Pode não ter IE)</option>
            </select>
          </div>
          {/* FIM DA SEÇÃO FISCAL */}

          {/* CEP * (col-md-3) */}
          <div className="col-md-3 md:col-span-3">
            <label htmlFor="cep" className="form-label block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              CEP *
              {loadingCep && <span className="text-[11px] text-blue-600 ml-1 font-normal">Buscando...</span>}
            </label>
            <input
              type="text"
              className="form-control w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono"
              name="cep"
              id="cep"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
              onBlur={handleCepBlur}
              placeholder="17120-031"
              required
            />
          </div>

          {/* ENDEREÇO (LOGRADOURO) * (col-md-7) */}
          <div className="col-md-7 md:col-span-7">
            <label htmlFor="logradouro" className="form-label block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              ENDEREÇO (LOGRADOURO) *
            </label>
            <input
              type="text"
              className="form-control w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              name="logradouro"
              id="logradouro"
              value={logradouro}
              onChange={(e) => setLogradouro(e.target.value)}
              required
            />
          </div>

          {/* NÚMERO * (col-md-2) */}
          <div className="col-md-2 md:col-span-2">
            <label htmlFor="numero" className="form-label block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              NÚMERO *
            </label>
            <input
              type="text"
              className="form-control w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              name="numero"
              id="numero"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              required
            />
          </div>

          {/* COMPLEMENTO (col-md-4) */}
          <div className="col-md-4 md:col-span-4">
            <label htmlFor="complemento" className="form-label block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              COMPLEMENTO
            </label>
            <input
              type="text"
              className="form-control w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              name="complemento"
              id="complemento"
              placeholder="Sala, Galpão..."
              value={complemento}
              onChange={(e) => setComplemento(e.target.value)}
            />
          </div>

          {/* BAIRRO * (col-md-4) */}
          <div className="col-md-4 md:col-span-4">
            <label htmlFor="bairro" className="form-label block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              BAIRRO *
            </label>
            <input
              type="text"
              className="form-control w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              name="bairro"
              id="bairro"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              required
            />
          </div>

          {/* CIDADE * (col-md-3) */}
          <div className="col-md-3 md:col-span-3">
            <label htmlFor="cidade" className="form-label block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              CIDADE *
            </label>
            <input
              type="text"
              className="form-control w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              name="cidade"
              id="cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              required
            />
          </div>

          {/* UF * (col-md-1) */}
          <div className="col-md-1 md:col-span-1">
            <label htmlFor="uf" className="form-label block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              UF *
            </label>
            <input
              type="text"
              className="form-control w-full px-2 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 uppercase text-center font-bold"
              name="uf"
              id="uf"
              maxLength={2}
              value={estado}
              onChange={(e) => setEstado(e.target.value.toUpperCase())}
              required
            />
          </div>

          {/* TELEFONE FIXO (col-md-4) */}
          <div className="col-md-4 md:col-span-4">
            <label htmlFor="telefone" className="form-label block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              TELEFONE FIXO
            </label>
            <input
              type="text"
              className="form-control w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              name="telefone"
              id="telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </div>

          {/* CELULAR / WHATSAPP * (col-md-4) */}
          <div className="col-md-4 md:col-span-4">
            <label htmlFor="celular" className="form-label block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1 text-emerald-700">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              CELULAR / WHATSAPP *
            </label>
            <input
              type="text"
              className="form-control w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
              name="celular"
              id="celular"
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
              required
            />
          </div>

          {/* E-MAIL COMERCIAL (NF-E) (col-md-4) */}
          <div className="col-md-4 md:col-span-4">
            <label htmlFor="email" className="form-label block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              E-MAIL COMERCIAL (NF-E)
            </label>
            <input
              type="email"
              className="form-control w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* OBSERVAÇÕES / MÁQUINAS INSTALADAS (LASER, PLASMA, OXICORTE) (col-md-12) */}
          <div className="col-md-12 md:col-span-12">
            <label htmlFor="observacao" className="form-label block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              OBSERVAÇÕES / MÁQUINAS INSTALADAS (LASER, PLASMA, OXICORTE)
            </label>
            <textarea
              className="form-control w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              name="observacao"
              id="observacao"
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Possui Máquina Laser Fibra 3kW Raycus, horários de recebimento, etc."
            />
          </div>

          {/* Botões Limpar e Salvar Cliente (col-12 text-end) */}
          <div className="col-12 md:col-span-12 text-end flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="reset"
              onClick={limparFormulario}
              className="btn btn-secondary px-4 py-2 border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpar
            </button>
            <button
              type="submit"
              className="btn btn-danger px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              {clienteEditandoId ? (
                <>
                  <Edit className="w-3.5 h-3.5" />
                  Salvar Alterações
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Salvar Cliente
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Clientes Cadastrados */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-slate-600" />
              Clientes Cadastrados na Base de Dados
            </h3>
            <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold">
              {clientes.length} registros
            </span>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por Razão Social, Fantasia, CNPJ, IE..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Documento / IE</th>
                <th className="py-3 px-4">Razão Social / Nome Fantasia</th>
                <th className="py-3 px-4">Localidade</th>
                <th className="py-3 px-4">WhatsApp / Fone</th>
                <th className="py-3 px-4">E-mail Comercial</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">
                    Nenhum cliente encontrado com os critérios de busca.
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cli) => {
                  const whatsAppDigitos = cli.celular ? cleanDigits(cli.celular) : '';
                  const isBeingEdited = clienteEditandoId === cli.id;

                  const indicadorLabel = 
                    cli.indicadorIe === '1' ? '1 - Contribuinte' :
                    cli.indicadorIe === '2' ? '2 - Isento' :
                    cli.indicadorIe === '9' ? '9 - Não Contribuinte' : '1 - Contribuinte';

                  return (
                    <tr 
                      key={cli.id} 
                      className={`hover:bg-slate-50 transition ${
                        isBeingEdited ? 'bg-amber-50/70' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-medium text-slate-700 whitespace-nowrap">
                        <div className="bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-[11px] font-bold">
                          {cli.documento}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                          <FileCheck className="w-3 h-3 text-slate-400" />
                          <span>IE: <strong>{cli.inscricaoEstadual || 'ISENTO'}</strong></span>
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono">
                          {indicadorLabel}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{cli.nome}</div>
                        {cli.nomeFantasia && (
                          <div className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-0.5">
                            <span className="bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                              Fantasia: {cli.nomeFantasia}
                            </span>
                          </div>
                        )}
                        {cli.observacoes && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5" title={cli.observacoes}>
                            {cli.observacoes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800">
                          {cli.cidade} / {cli.estado}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {cli.logradouro}, {cli.numero} - CEP {cli.cep}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {cli.celular ? (
                          <a
                            href={`https://wa.me/55${whatsAppDigitos}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold"
                            title="Conversar no WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            {cli.celular}
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                        {cli.telefone && (
                          <div className="text-[10px] text-slate-500">Fix: {cli.telefone}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {cli.email ? (
                          <a href={`mailto:${cli.email}`} className="hover:underline text-blue-600 truncate block max-w-[180px]" title={cli.email}>
                            {cli.email}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onCriarOsParaCliente(cli.id)}
                            className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded font-semibold text-xs transition"
                            title="Criar Ordem de Serviço para este cliente"
                          >
                            <FilePlus2 className="w-3.5 h-3.5" />
                            Abrir OS
                          </button>
                          
                          <button
                            onClick={() => handleEditarCliente(cli)}
                            className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded font-medium text-xs transition"
                            title="Editar dados cadastrais e fiscais deste cliente"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Editar
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Deseja realmente remover o cliente "${cli.nome}"?`)) {
                                onDeleteCliente(cli.id);
                              }
                            }}
                            className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition"
                            title="Remover cliente"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>
    </div>
  );
};
