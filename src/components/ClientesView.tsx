import React, { useState } from 'react';
import { Cliente } from '../types';
import { fetchCnpjData, fetchCepData, cleanDigits } from '../utils/brasilApi';
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
  const [indicadorIe, setIndicadorIe] = useState<'1' | '2' | '9'>('1');
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
  const [situacaoCadastral, setSituacaoCadastral] = useState<string | null>(null);
  const [apiFeedback, setApiFeedback] = useState<{ tipo: 'sucesso' | 'erro' | 'info'; texto: string } | null>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [clienteEditandoId, setClienteEditandoId] = useState<string | null>(null);

  // Limpar formulário
  const limparFormulario = () => {
    setDocumento('');
    setNome('');
    setNomeFantasia('');
    setInscricaoEstadual('');
    setIndicadorIe('1');
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
    setApiFeedback(null);
    setClienteEditandoId(null);
  };

  // Carregar dados de cliente existente para edição
  const handleEditarCliente = (cli: Cliente) => {
    setClienteEditandoId(cli.id);
    setDocumento(cli.documento);
    setNome(cli.nome);
    setNomeFantasia(cli.nomeFantasia || '');
    setInscricaoEstadual(cli.inscricaoEstadual || '');
    setIndicadorIe(cli.indicadorIe || '1');
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
    setApiFeedback({
      tipo: 'info',
      texto: `Editando cadastro de "${cli.nome}". Modifique os dados necessários e clique em Salvar Alterações.`,
    });

    const formEl = document.getElementById('form_cliente_box');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Função ONBLUR do campo Documento (CPF/CNPJ) consultando a BrasilAPI
  const handleDocumentoBlur = async () => {
    const limpo = cleanDigits(documento);

    // Se for CNPJ (14 dígitos), consulta automaticamente a BrasilAPI
    if (limpo.length === 14) {
      setLoadingCnpj(true);
      setApiFeedback({ tipo: 'info', texto: 'Consultando dados fiscais e cadastrais na Receita Federal via BrasilAPI...' });

      try {
        const dados = await fetchCnpjData(limpo);
        if (dados) {
          setNome(dados.razao_social || '');
          if (dados.nome_fantasia) setNomeFantasia(dados.nome_fantasia);

          // Se a API retornar Inscrição Estadual
          if (dados.inscricoes_estaduais && dados.inscricoes_estaduais.length > 0) {
            setInscricaoEstadual(dados.inscricoes_estaduais[0].inscricao_estadual || '');
            setIndicadorIe('1'); // Contribuinte ICMS
          }

          if (dados.cep) setCep(formatCep(dados.cep));
          if (dados.logradouro) setLogradouro(dados.logradouro);
          if (dados.numero) setNumero(dados.numero);
          if (dados.complemento) setComplemento(dados.complemento);
          if (dados.bairro) setBairro(dados.bairro);
          if (dados.municipio) setCidade(dados.municipio);
          if (dados.uf) setEstado(dados.uf);
          if (dados.ddd_telefone_1) setTelefone(formatPhone(dados.ddd_telefone_1));
          if (dados.email) setEmail(dados.email.toLowerCase());

          const situacao = dados.descricao_situacao_cadastral || dados.situacao_cadastral || 'ATIVA';
          setSituacaoCadastral(situacao);

          setApiFeedback({
            tipo: 'sucesso',
            texto: `Dados corporativos carregados com sucesso! Razão Social: "${dados.razao_social}" | Situação Cadastral: ${situacao}.`,
          });
        }
      } catch (err: any) {
        setApiFeedback({
          tipo: 'erro',
          texto: err.message || 'CNPJ não encontrado na base pública da BrasilAPI.',
        });
      } finally {
        setLoadingCnpj(false);
      }
    } else if (limpo.length > 0 && limpo.length < 11) {
      setApiFeedback({ tipo: 'erro', texto: 'Documento incompleto. Digite 11 dígitos para CPF ou 14 dígitos para CNPJ.' });
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
          setApiFeedback({ tipo: 'sucesso', texto: `Endereço localizado pelo CEP (${dados.cidade}/${dados.estado}).` });
        }
      } catch (err: any) {
        setApiFeedback({ tipo: 'erro', texto: 'CEP não encontrado. Preencha o endereço manualmente.' });
      } finally {
        setLoadingCep(false);
      }
    }
  };

  // Submissão do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!documento || !nome || !logradouro || !cidade) {
      setApiFeedback({ tipo: 'erro', texto: 'Por favor, preencha os campos obrigatórios (*).' });
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
      setApiFeedback({ tipo: 'sucesso', texto: `Cadastro do cliente "${nome}" atualizado com sucesso!` });
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
      setApiFeedback({ tipo: 'sucesso', texto: `Cliente "${nome}" cadastrado com sucesso no sistema da MFx Tecnologia!` });
    }
  };

  // Botões de teste rápido com CNPJ para demonstrar BrasilAPI
  const preencherCnpjExemplo = (cnpjExemplo: string) => {
    setDocumento(cnpjExemplo);
    setTimeout(() => {
      const inputDoc = document.getElementById('campo_documento') as HTMLInputElement;
      if (inputDoc) {
        inputDoc.focus();
        inputDoc.blur();
      }
    }, 50);
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
            <span className="text-xs font-bold font-mono uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded">
              Módulo: clientes.php
            </span>
            <span className="text-xs text-slate-500 font-medium">| MFx Tecnologia Industrial (CNPJ: 34.375.789/0001-87)</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-red-600" />
            Cadastro e Gestão de Clientes (Pronto para Faturamento e NF-e)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Insira o CPF ou CNPJ. Ao sair do campo (<code className="text-red-600 font-mono text-xs bg-red-50 px-1 py-0.5 rounded">onblur</code>), o sistema consulta a <strong>BrasilAPI pública</strong> e autocompleta Razão Social, Nome Fantasia, Inscrição Estadual, Endereço, CEP e Contato.
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
              className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 px-2.5 py-1 rounded text-[11px] font-mono font-medium transition"
              title="CNPJ Oficial da MFx Tecnologia Industrial"
            >
              MFx (34.375.789/0001-87)
            </button>
            <button
              type="button"
              onClick={() => preencherCnpjExemplo('00000000000191')}
              className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 px-2.5 py-1 rounded text-[11px] font-mono font-medium transition"
              title="Banco do Brasil"
            >
              BB (00.000.000/0001-91)
            </button>
            <button
              type="button"
              onClick={() => preencherCnpjExemplo('33000167000101')}
              className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 px-2.5 py-1 rounded text-[11px] font-mono font-medium transition"
              title="Petrobras"
            >
              Petrobras
            </button>
          </div>
        </div>
      </div>

      {/* Formulário de Cadastro / Edição */}
      <div id="form_cliente_box" className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className={`px-6 py-4 flex items-center justify-between ${
          clienteEditandoId ? 'bg-amber-900 text-amber-100' : 'bg-slate-900 text-white'
        }`}>
          <div className="font-bold text-sm tracking-wide uppercase flex items-center gap-2">
            {clienteEditandoId ? (
              <>
                <Edit className="w-4 h-4 text-amber-300" />
                <span>Modo de Edição: Atualizar Cliente</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Formulário de Cadastro do Cliente (Pronto para Faturamento e NF-e)</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {clienteEditandoId && (
              <button
                type="button"
                onClick={limparFormulario}
                className="text-xs bg-amber-800/80 hover:bg-amber-800 text-white px-2.5 py-1 rounded flex items-center gap-1 transition"
              >
                <X className="w-3.5 h-3.5" /> Cancelar Edição
              </button>
            )}
            <div className="text-xs text-slate-300">
              Campos com <span className="text-red-400 font-bold">*</span> são obrigatórios
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Alerta de Feedback da API */}
          {apiFeedback && (
            <div
              className={`p-3.5 rounded-lg text-xs flex items-center gap-2 border ${
                apiFeedback.tipo === 'sucesso'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : apiFeedback.tipo === 'erro'
                  ? 'bg-red-50 text-red-800 border-red-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}
            >
              {apiFeedback.tipo === 'sucesso' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : apiFeedback.tipo === 'erro' ? (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              ) : (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
              )}
              <div className="flex-1 flex flex-wrap items-center justify-between gap-2">
                <span>{apiFeedback.texto}</span>
                {situacaoCadastral && (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                    <BadgeCheck className="w-3 h-3 text-emerald-600" />
                    Situação: {situacaoCadastral}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* CPF / CNPJ (col-md-4) */}
            <div className="md:col-span-4">
              <label htmlFor="campo_documento" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                CPF ou CNPJ <span className="text-red-500">*</span>
                {loadingCnpj && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-normal ml-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> Consultando BrasilAPI...
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  id="campo_documento"
                  type="text"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  onBlur={handleDocumentoBlur}
                  placeholder="Ex: 34.375.789/0001-87"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Dispara consulta automática na BrasilAPI ao sair do campo (<code className="text-red-600 font-mono text-[10px]">onblur</code>).
              </p>
            </div>

            {/* Razão Social (Nome Completo) (col-md-8) */}
            <div className="md:col-span-8">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Razão Social (Nome Completo) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Metalúrgica Corte & Conformação Paulista Ltda"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-medium"
                required
              />
            </div>

            {/* Nome Fantasia (Opcional) (col-md-12) */}
            <div className="md:col-span-12">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nome Fantasia (Opcional)
              </label>
              <input
                type="text"
                value={nomeFantasia}
                onChange={(e) => setNomeFantasia(e.target.value)}
                placeholder="Ex: Metalúrgica Paulista"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* NOVOS CAMPOS DE INSCRIÇÃO ESTADUAL E INDICADOR SEFAZ */}
            {/* Inscrição Estadual (IE) (col-md-6) */}
            <div className="md:col-span-6">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Inscrição Estadual (IE)</span>
                <span className="text-slate-400 font-normal lowercase text-[11px]">Obrigatório p/ contribuintes</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inscricaoEstadual}
                  onChange={(e) => setInscricaoEstadual(e.target.value)}
                  placeholder="Ex: 209.632.131.114 ou ISENTO"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Autopreenchido pela BrasilAPI quando retornado pela SEFAZ Estadual.
              </p>
            </div>

            {/* Indicador de IE (SEFAZ) (col-md-6) */}
            <div className="md:col-span-6">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Indicador de IE (SEFAZ)</span>
                <span className="text-slate-400 font-normal lowercase text-[11px]">Enquadramento fiscal</span>
              </label>
              <select
                value={indicadorIe}
                onChange={(e) => setIndicadorIe(e.target.value as '1' | '2' | '9')}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
              >
                <option value="1">1 - Contribuinte ICMS (Possui Inscrição Estadual)</option>
                <option value="2">2 - Contribuinte Isento de Inscrição Estadual</option>
                <option value="9">9 - Não Contribuinte (Pode não ter IE)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Define a tributação e emissão de NF-e mod. 55 / NFS-e.
              </p>
            </div>

            {/* CEP (col-md-3) */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                CEP <span className="text-red-500">*</span>
                {loadingCep && <span className="text-[11px] text-blue-600 ml-1">Buscando...</span>}
              </label>
              <input
                type="text"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                onBlur={handleCepBlur}
                placeholder="17120-031"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono"
                required
              />
            </div>

            {/* Endereço / Logradouro (col-md-7) */}
            <div className="md:col-span-7">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Endereço (Logradouro) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={logradouro}
                onChange={(e) => setLogradouro(e.target.value)}
                placeholder="Ex: Rua Sargento Andiras"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            {/* Número (col-md-2) */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Número <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="874"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            {/* Complemento (col-md-4) */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Complemento
              </label>
              <input
                type="text"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                placeholder="Sala, Galpão..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Bairro (col-md-4) */}
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Bairro <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Centro / Distrito Industrial"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            {/* Cidade (col-md-3) */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Cidade <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Ex: Agudos, Bauru..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            {/* UF (col-md-1) */}
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                UF <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={2}
                value={estado}
                onChange={(e) => setEstado(e.target.value.toUpperCase())}
                placeholder="SP"
                className="w-full px-2 py-2 text-sm border border-slate-300 rounded-lg uppercase text-center font-bold focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            {/* Telefone Fixo (col-md-4) */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                Telefone Fixo
              </label>
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(14) 3262-1080"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Celular / WhatsApp (col-md-4) */}
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1 text-emerald-700">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                Celular / WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                placeholder="(14) 99845-7721"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                required
              />
            </div>

            {/* E-mail Comercial (NF-e) (col-md-4) */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                E-mail Comercial (NF-e)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="compras@empresa.com.br"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Observações / Máquinas Instaladas (Laser, Plasma, Oxicorte) (col-md-12) */}
            <div className="md:col-span-12">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Observações / Máquinas Instaladas (Laser, Plasma, Oxicorte)
              </label>
              <textarea
                rows={3}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Possui Máquina Laser Fibra 3kW Raycus, modelo da tocha de corte, horários de recebimento, etc."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

          </div>

          {/* Botões de Ação do Formulário */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={limparFormulario}
              className="w-full sm:w-auto px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-medium text-xs transition flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {clienteEditandoId ? 'Cancelar Edição' : 'Limpar'}
            </button>

            <button
              type="submit"
              className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 ${
                clienteEditandoId
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
              }`}
            >
              {clienteEditandoId ? (
                <>
                  <Edit className="w-4 h-4" />
                  Salvar Alterações (Atualizar Cliente)
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
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
