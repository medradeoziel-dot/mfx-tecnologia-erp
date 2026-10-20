import React, { useState, useEffect } from 'react';
import { ConfiguracaoEmitente } from '../types';
import { CONFIGURACOES_EMITENTE_INICIAIS } from '../data/company';
import { 
  Building2, 
  Hash, 
  CreditCard, 
  Receipt, 
  Check, 
  RotateCcw, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  FileText
} from 'lucide-react';

interface ConfiguracoesViewProps {
  onSalvar?: (config: ConfiguracaoEmitente) => void;
}

export const ConfiguracoesView: React.FC<ConfiguracoesViewProps> = ({ onSalvar }) => {
  // Estado das Configurações com persistência em localStorage
  const [config, setConfig] = useState<ConfiguracaoEmitente>(() => {
    try {
      const salvo = localStorage.getItem('mfx_configuracoes_emitente');
      if (salvo) return JSON.parse(salvo);
    } catch (e) {
      console.warn('Erro ao carregar configurações do emitente:', e);
    }
    return CONFIGURACOES_EMITENTE_INICIAIS as ConfiguracaoEmitente;
  });

  // Aba ativa: 'todas', 'emitente', 'numeracao', 'bancario', 'fiscal'
  const [abaAtiva, setAbaAtiva] = useState<'todas' | 'emitente' | 'numeracao' | 'bancario' | 'fiscal'>('emitente');

  // Feedback toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const exibirToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleInputChange = (campo: keyof ConfiguracaoEmitente, valor: any) => {
    setConfig((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const handleSalvar = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      localStorage.setItem('mfx_configuracoes_emitente', JSON.stringify(config));
      if (onSalvar) onSalvar(config);
      exibirToast('Configurações do emitente salvas com sucesso.');
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
    }
  };

  const handleRestaurarPadroes = () => {
    if (confirm('Deseja restaurar as configurações padrão da MFx Tecnologia Industrial?')) {
      setConfig(CONFIGURACOES_EMITENTE_INICIAIS as ConfiguracaoEmitente);
      localStorage.setItem('mfx_configuracoes_emitente', JSON.stringify(CONFIGURACOES_EMITENTE_INICIAIS));
      exibirToast('Configurações restauradas para o padrão oficial.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Toast Notificação */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-medium flex items-center gap-2.5 border border-slate-700 animate-fadeIn">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
            ✓
          </div>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Cabeçalho Minimalista e Limpo */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Configurações do Emitente
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Parâmetros corporativos, numerações sequenciais, dados bancários e tributação fiscal.
          </p>
        </div>

        {/* Ações do Topo */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleRestaurarPadroes}
            className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-medium px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Restaurar padrões oficiais da empresa"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Restaurar Padrões</span>
          </button>

          <button
            type="button"
            onClick={() => handleSalvar()}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-2xs transition cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Salvar Configurações</span>
          </button>
        </div>
      </div>

      {/* 2. Barra de Abas de Texto Simples e Elegante */}
      <div className="border-b border-slate-200 flex items-center gap-1 overflow-x-auto scrollbar-none text-xs select-none">
        <button
          onClick={() => setAbaAtiva('emitente')}
          className={`px-4 py-2.5 border-b-2 font-medium transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            abaAtiva === 'emitente'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Dados do Emitente</span>
        </button>

        <button
          onClick={() => setAbaAtiva('numeracao')}
          className={`px-4 py-2.5 border-b-2 font-medium transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            abaAtiva === 'numeracao'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Hash className="w-3.5 h-3.5 text-slate-400" />
          <span>Sequências & Numeração</span>
        </button>

        <button
          onClick={() => setAbaAtiva('bancario')}
          className={`px-4 py-2.5 border-b-2 font-medium transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            abaAtiva === 'bancario'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
          <span>Dados Bancários & PIX</span>
        </button>

        <button
          onClick={() => setAbaAtiva('fiscal')}
          className={`px-4 py-2.5 border-b-2 font-medium transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            abaAtiva === 'fiscal'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-3.5 h-3.5 text-slate-400" />
          <span>Regras Tributárias & Fiscais</span>
        </button>

        <button
          onClick={() => setAbaAtiva('todas')}
          className={`px-3 py-2.5 ml-auto border-b-2 font-medium transition cursor-pointer text-slate-400 hover:text-slate-700 whitespace-nowrap ${
            abaAtiva === 'todas'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent'
          }`}
        >
          <span>Exibir Todas</span>
        </button>
      </div>

      <form onSubmit={handleSalvar} className="space-y-6">
        {/* SEÇÃO A: DADOS DO EMITENTE */}
        {(abaAtiva === 'emitente' || abaAtiva === 'todas') && (
          <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  Dados Cadastrais da Empresa Emitente
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Informações que aparecem no cabeçalho das Ordens de Serviço, Relatórios A4, Cupom do PDV e Notas Fiscais.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {/* Razão Social */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Razão Social *
                </label>
                <input
                  type="text"
                  required
                  value={config.razaoSocial}
                  onChange={(e) => handleInputChange('razaoSocial', e.target.value)}
                  placeholder="MFx Tecnologia Industrial Ltda"
                  className="w-full bg-slate-50/60 border border-slate-200 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                />
              </div>

              {/* Nome Fantasia */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  value={config.nomeFantasia}
                  onChange={(e) => handleInputChange('nomeFantasia', e.target.value)}
                  placeholder="MFx TECNOLOGIA INDUSTRIAL"
                  className="w-full bg-slate-50/60 border border-slate-200 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                />
              </div>

              {/* CNPJ */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  CNPJ *
                </label>
                <input
                  type="text"
                  required
                  value={config.cnpj}
                  onChange={(e) => handleInputChange('cnpj', e.target.value)}
                  placeholder="34.375.789-0001/87"
                  className="w-full bg-slate-50/60 border border-slate-200 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 transition"
                />
              </div>

              {/* Inscrição Estadual */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Inscrição Estadual (IE)
                </label>
                <input
                  type="text"
                  value={config.inscricaoEstadual}
                  onChange={(e) => handleInputChange('inscricaoEstadual', e.target.value)}
                  placeholder="154.892.411.112"
                  className="w-full bg-slate-50/60 border border-slate-200 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 transition"
                />
              </div>

              {/* Inscrição Municipal */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Inscrição Municipal (IM)
                </label>
                <input
                  type="text"
                  value={config.inscricaoMunicipal}
                  onChange={(e) => handleInputChange('inscricaoMunicipal', e.target.value)}
                  placeholder="1401-0/01-88"
                  className="w-full bg-slate-50/60 border border-slate-200 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 transition"
                />
              </div>

              {/* CNAE Principal */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Atividade Econômica Principal (CNAE)
                </label>
                <input
                  type="text"
                  value={config.cnaePrincipal}
                  onChange={(e) => handleInputChange('cnaePrincipal', e.target.value)}
                  placeholder="3314-7/10 - Manutenção e reparação de máquinas e equipamentos..."
                  className="w-full bg-slate-50/60 border border-slate-200 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="border-t border-slate-100 pt-3">
              <span className="text-xs font-medium text-slate-600 block mb-2">
                Localização & Endereço Comercial
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="lg:col-span-2">
                  <label className="block text-[11px] text-slate-500 mb-1">Logradouro</label>
                  <input
                    type="text"
                    value={config.logradouro}
                    onChange={(e) => handleInputChange('logradouro', e.target.value)}
                    placeholder="Rua Sargento Andiras"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Número</label>
                  <input
                    type="text"
                    value={config.numero}
                    onChange={(e) => handleInputChange('numero', e.target.value)}
                    placeholder="874"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Complemento</label>
                  <input
                    type="text"
                    value={config.complemento}
                    onChange={(e) => handleInputChange('complemento', e.target.value)}
                    placeholder="Galpão / Escritório Técnico"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Bairro</label>
                  <input
                    type="text"
                    value={config.bairro}
                    onChange={(e) => handleInputChange('bairro', e.target.value)}
                    placeholder="Centro"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={config.cidade}
                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                    placeholder="Agudos"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Estado (UF)</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={config.estado}
                    onChange={(e) => handleInputChange('estado', e.target.value.toUpperCase())}
                    placeholder="SP"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono uppercase text-slate-800 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">CEP</label>
                  <input
                    type="text"
                    value={config.cep}
                    onChange={(e) => handleInputChange('cep', e.target.value)}
                    placeholder="17120-031"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 transition"
                  />
                </div>
              </div>
            </div>

            {/* Contato & Comunicação */}
            <div className="border-t border-slate-100 pt-3">
              <span className="text-xs font-medium text-slate-600 block mb-2">
                Canais de Contato & Suporte
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Telefone Fixo</label>
                  <input
                    type="text"
                    value={config.telefone}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    placeholder="(14) 3262-1080"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">WhatsApp / Plantão Técnico</label>
                  <input
                    type="text"
                    value={config.whatsapp}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    placeholder="(14) 99845-7721"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">E-mail Principal</label>
                  <input
                    type="email"
                    value={config.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contato@mfxindustrial.com.br"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Website Oficial</label>
                  <input
                    type="text"
                    value={config.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="www.mfxindustrial.com.br"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO B: SEQUÊNCIAS E NUMERAÇÃO */}
        {(abaAtiva === 'numeracao' || abaAtiva === 'todas') && (
          <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-slate-500" />
                  Controle de Sequências & Numeração
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure os próximos números que serão gerados automaticamente pelo sistema em cada módulo.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Próximo Nº da Ordem de Serviço (OS)
                </label>
                <input
                  type="number"
                  min="1"
                  value={config.proximaOsNumero}
                  onChange={(e) => handleInputChange('proximaOsNumero', parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50/60 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 transition"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">Ex: OS-2026-0102</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Próximo Nº da Cotação / Orçamento
                </label>
                <input
                  type="number"
                  min="1"
                  value={config.proximaCotacaoNumero}
                  onChange={(e) => handleInputChange('proximaCotacaoNumero', parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50/60 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 transition"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">Ex: COT-2026-0058</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Próximo Nº da Venda Balcão (PDV)
                </label>
                <input
                  type="number"
                  min="1"
                  value={config.proximaVendaNumero}
                  onChange={(e) => handleInputChange('proximaVendaNumero', parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50/60 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 transition"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">Ex: VND-2026-0045</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Próximo Nº NF-e (Modelo 55 - Produtos)
                </label>
                <input
                  type="number"
                  min="1"
                  value={config.proximaNfeNumero}
                  onChange={(e) => handleInputChange('proximaNfeNumero', parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50/60 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 transition"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">SEFAZ Estadual SP</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Próximo Nº NFS-e (Serviços Municipais)
                </label>
                <input
                  type="number"
                  min="1"
                  value={config.proximaNfseNumero}
                  onChange={(e) => handleInputChange('proximaNfseNumero', parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50/60 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 transition"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">Prefeitura Municipal de Agudos</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Série NF-e
                  </label>
                  <input
                    type="text"
                    value={config.serieNfe}
                    onChange={(e) => handleInputChange('serieNfe', e.target.value)}
                    placeholder="1"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-center text-slate-800 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Série NFS-e
                  </label>
                  <input
                    type="text"
                    value={config.serieNfse}
                    onChange={(e) => handleInputChange('serieNfse', e.target.value)}
                    placeholder="1"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-center text-slate-800 transition"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO C: DADOS BANCÁRIOS & PIX */}
        {(abaAtiva === 'bancario' || abaAtiva === 'todas') && (
          <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  Dados Bancários, PIX & Cobrança
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Conta principal para recebimento de faturamentos de Ordens de Serviço, vendas PDV e boletos.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tipo de Chave PIX
                </label>
                <select
                  value={config.tipoChavePix}
                  onChange={(e) => handleInputChange('tipoChavePix', e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 transition cursor-pointer"
                >
                  <option value="CNPJ">CNPJ</option>
                  <option value="E-mail">E-mail</option>
                  <option value="Telefone">Telefone</option>
                  <option value="Aleatória">Chave Aleatória (EVP)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Chave PIX Principal
                </label>
                <input
                  type="text"
                  value={config.chavePix}
                  onChange={(e) => handleInputChange('chavePix', e.target.value)}
                  placeholder="34.375.789/0001-87"
                  className="w-full bg-slate-50/60 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Instituição Bancária
                </label>
                <input
                  type="text"
                  value={config.bancoNome}
                  onChange={(e) => handleInputChange('bancoNome', e.target.value)}
                  placeholder="Itaú Unibanco S.A."
                  className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Agência
                </label>
                <input
                  type="text"
                  value={config.agencia}
                  onChange={(e) => handleInputChange('agencia', e.target.value)}
                  placeholder="0422"
                  className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Conta Corrente (com dígito)
                </label>
                <input
                  type="text"
                  value={config.contaCorrente}
                  onChange={(e) => handleInputChange('contaCorrente', e.target.value)}
                  placeholder="38910-4"
                  className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 transition"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nome do Favorecido / Titular da Conta
                </label>
                <input
                  type="text"
                  value={config.favorecidoNome}
                  onChange={(e) => handleInputChange('favorecidoNome', e.target.value)}
                  placeholder="MFx Tecnologia Industrial Ltda"
                  className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Instruções Padrão de Faturamento / Boleto
                </label>
                <textarea
                  rows={2}
                  value={config.instrucoesBoleto}
                  onChange={(e) => handleInputChange('instrucoesBoleto', e.target.value)}
                  placeholder="Após o vencimento cobrar multa de 2% e juros de 1% ao mês..."
                  className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO D: REGRAS TRIBUTÁRIAS E FISCAIS */}
        {(abaAtiva === 'fiscal' || abaAtiva === 'todas') && (
          <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-slate-500" />
                  Regras Tributárias, Fiscais & Parâmetros Padrão
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Definições fiscais aplicadas automaticamente na criação de novas Ordens de Serviço e Vendas.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {/* Regime Tributário */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Regime Tributário da Empresa *
                </label>
                <select
                  value={config.regimeTributario}
                  onChange={(e) => handleInputChange('regimeTributario', e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 transition cursor-pointer"
                >
                  <option value="Simples Nacional">Simples Nacional (ME / EPP)</option>
                  <option value="Simples Nacional - Excesso de Sublimite">Simples Nacional - Excesso de Sublimite da Receita Bruta</option>
                  <option value="Regime Normal (Lucro Presumido)">Regime Normal (Lucro Presumido)</option>
                  <option value="Regime Normal (Lucro Real)">Regime Normal (Lucro Real)</option>
                </select>
              </div>

              {/* CSOSN Padrão */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  CSOSN Padrão (Simples Nacional)
                </label>
                <input
                  type="text"
                  value={config.csosnPadrao}
                  onChange={(e) => handleInputChange('csosnPadrao', e.target.value)}
                  placeholder="0102"
                  className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 transition"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">0102 - Sem permissão de crédito</span>
              </div>

              {/* Alíquota ISS */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Alíquota do ISS Municipal (%) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={config.aliquotaIss}
                    onChange={(e) => handleInputChange('aliquotaIss', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 transition"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400">%</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Prefeitura de Agudos/SP</span>
              </div>

              {/* Código LC 116 */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Código LC 116/2003 Padrão
                </label>
                <input
                  type="text"
                  value={config.codigoServicoLc116}
                  onChange={(e) => handleInputChange('codigoServicoLc116', e.target.value)}
                  placeholder="14.01"
                  className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 transition"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">Item 14.01 - Manutenção de Máquinas</span>
              </div>

              {/* NCM Padrão */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  NCM Padrão de Consumíveis Laser
                </label>
                <input
                  type="text"
                  value={config.ncmPadrao}
                  onChange={(e) => handleInputChange('ncmPadrao', e.target.value)}
                  placeholder="9027.90.99"
                  className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 transition"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">Ópticos / Peças CNC</span>
              </div>

              {/* CFOP Produto */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  CFOP Padrão Produto (NF-e Interna)
                </label>
                <input
                  type="text"
                  value={config.cfopProdutoPadrao}
                  onChange={(e) => handleInputChange('cfopProdutoPadrao', e.target.value)}
                  placeholder="5102"
                  className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 transition"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">5102 - Venda de mercadoria</span>
              </div>

              {/* CFOP Serviço */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  CFOP Padrão Serviço (NFS-e Interna)
                </label>
                <input
                  type="text"
                  value={config.cfopServicoPadrao}
                  onChange={(e) => handleInputChange('cfopServicoPadrao', e.target.value)}
                  placeholder="5933"
                  className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 transition"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">5933 - Prestação tributada ISSQN</span>
              </div>

              {/* Informações Fisco */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Texto Complementar Fiscal (Interesse do Fisco)
                </label>
                <textarea
                  rows={2}
                  value={config.informacoesFisco}
                  onChange={(e) => handleInputChange('informacoesFisco', e.target.value)}
                  placeholder="Documento emitido por ME ou EPP optante pelo Simples Nacional..."
                  className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* Barra de Ações Inferior Fixa/Flutuante */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Última atualização gravada no armazenamento local da estação.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestaurarPadroes}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-lg text-xs transition cursor-pointer"
            >
              Cancelar / Restaurar
            </button>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2 rounded-lg text-xs flex items-center gap-2 shadow-2xs transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Salvar Configurações</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
