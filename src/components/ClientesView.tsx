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
  ExternalLink,
  MessageCircle,
  FilePlus2
} from 'lucide-react';

interface ClientesViewProps {
  clientes: Cliente[];
  onAddCliente: (cliente: Cliente) => void;
  onDeleteCliente: (id: string) => void;
  onCriarOsParaCliente: (clienteId: string) => void;
}

export const ClientesView: React.FC<ClientesViewProps> = ({
  clientes,
  onAddCliente,
  onDeleteCliente,
  onCriarOsParaCliente,
}) => {
  // Form State
  const [documento, setDocumento] = useState('');
  const [nome, setNome] = useState('');
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
  const [apiFeedback, setApiFeedback] = useState<{ tipo: 'sucesso' | 'erro' | 'info'; texto: string } | null>(null);
  const [termoBusca, setTermoBusca] = useState('');

  // Limpar formulário
  const limparFormulario = () => {
    setDocumento('');
    setNome('');
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
    setApiFeedback(null);
  };

  // Função ONBLUR do campo Documento (CPF/CNPJ) consultando a BrasilAPI
  const handleDocumentoBlur = async () => {
    const limpo = cleanDigits(documento);

    // Se for CNPJ (14 dígitos), consulta automaticamente a BrasilAPI
    if (limpo.length === 14) {
      setLoadingCnpj(true);
      setApiFeedback({ tipo: 'info', texto: 'Consultando Receita Federal via BrasilAPI...' });

      try {
        const dados = await fetchCnpjData(limpo);
        if (dados) {
          setNome(dados.razao_social || dados.nome_fantasia || '');
          if (dados.logradouro) setLogradouro(dados.logradouro);
          if (dados.numero) setNumero(dados.numero);
          if (dados.complemento) setComplemento(dados.complemento);
          if (dados.bairro) setBairro(dados.bairro);
          if (dados.municipio) setCidade(dados.municipio);
          if (dados.uf) setEstado(dados.uf);
          if (dados.cep) setCep(formatCep(dados.cep));
          if (dados.ddd_telefone_1) setTelefone(formatPhone(dados.ddd_telefone_1));
          if (dados.email) setEmail(dados.email.toLowerCase());

          setApiFeedback({
            tipo: 'sucesso',
            texto: `CNPJ localizado! Dados da empresa "${dados.razao_social}" preenchidos automaticamente.`,
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

    const novoCliente: Cliente = {
      id: `cli-${Date.now()}`,
      documento: formatCpfCnpj(documento),
      nome,
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
    setApiFeedback({ tipo: 'sucesso', texto: `Cliente "${nome}" cadastrado com sucesso!` });
  };

  // Botões de teste rápido com CNPJ para demonstrar BrasilAPI
  const preencherCnpjExemplo = (cnpjExemplo: string) => {
    setDocumento(cnpjExemplo);
    // Executa a busca em seguida
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
      c.documento.includes(t) ||
      c.cidade.toLowerCase().includes(t) ||
      (c.email && c.email.toLowerCase().includes(t))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold font-mono uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded">
              Módulo: clientes.php
            </span>
            <span className="text-xs text-slate-500 font-medium">| MFx Tecnologia Industrial</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-red-600" />
            Cadastro e Gestão de Clientes
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Insira o CPF ou CNPJ. Ao sair do campo (<code className="text-red-600 font-mono text-xs bg-red-50 px-1 py-0.5 rounded">onblur</code>), o sistema consulta a <strong>BrasilAPI pública</strong> da Receita Federal e autocompleta Razão Social, Logradouro, Bairro, Cidade e CEP.
          </p>
        </div>

        {/* Quick test buttons */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs space-y-1.5 self-start md:self-auto">
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
              title="Banco do Brasil (Exemplo público)"
            >
              BB (00.000.000/0001-91)
            </button>
          </div>
        </div>
      </div>

      {/* Formulário de Cadastro */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="font-bold text-sm tracking-wide uppercase flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-400" />
            Formulário de Cadastro do Cliente
          </div>
          <div className="text-xs text-slate-400">
            Campos com <span className="text-red-400 font-bold">*</span> são obrigatórios
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
              <span>{apiFeedback.texto}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* CPF / CNPJ (com onBlur) */}
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
                Dispara consulta automática na BrasilAPI ao sair do campo (onblur).
              </p>
            </div>

            {/* Nome / Razão Social */}
            <div className="md:col-span-8">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nome Completo / Razão Social <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: MFx Tecnologia Industrial Ltda"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            {/* CEP com onBlur */}
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

            {/* Endereço / Logradouro */}
            <div className="md:col-span-6">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Endereço (Rua / Avenida) <span className="text-red-500">*</span>
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

            {/* Número */}
            <div className="md:col-span-3">
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

            {/* Complemento */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Complemento
              </label>
              <input
                type="text"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                placeholder="Galpão, Sala..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Bairro */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Bairro <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Centro / Distrito Ind."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            {/* Cidade */}
            <div className="md:col-span-4">
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

            {/* Estado UF */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                UF <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={2}
                value={estado}
                onChange={(e) => setEstado(e.target.value.toUpperCase())}
                placeholder="SP"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg uppercase text-center font-bold focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            {/* Telefone Fixo */}
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

            {/* Celular / WhatsApp */}
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
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>

            {/* E-mail */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                E-mail Comercial / NFe
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="compras@empresa.com.br"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Observações */}
            <div className="md:col-span-12">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Observações Técnicas / Equipamentos Instalados no Cliente
              </label>
              <textarea
                rows={2}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Máquina de corte laser fibra 3000W Raycus, tocha plasma Hypertherm HPR260, horários de recebimento..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={limparFormulario}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 border border-slate-300 hover:bg-slate-50 rounded-lg transition"
            >
              Limpar
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Salvar Cliente (MySQL PDO)
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Clientes Cadastrados */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-900">
              Clientes Cadastrados na Base de Dados
            </h3>
            <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold">
              {clientes.length} registros
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nome, CNPJ, cidade..."
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
                <th className="py-3 px-4">Documento</th>
                <th className="py-3 px-4">Razão Social / Cliente</th>
                <th className="py-3 px-4">Localidade</th>
                <th className="py-3 px-4">WhatsApp / Fone</th>
                <th className="py-3 px-4">E-mail</th>
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
                  return (
                    <tr key={cli.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-medium text-slate-700 whitespace-nowrap">
                        <span className="bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-[11px]">
                          {cli.documento}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{cli.nome}</div>
                        {cli.observacoes && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">
                            {cli.observacoes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800">
                          {cli.cidade} / {cli.estado}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {cli.bairro} - CEP {cli.cep}
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
                          <a href={`mailto:${cli.email}`} className="hover:underline text-blue-600 truncate block max-w-[180px]">
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
