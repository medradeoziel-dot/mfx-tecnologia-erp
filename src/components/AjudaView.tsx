import React from 'react';
import { ErpModuleType } from './ErpSidebar';
import { 
  Settings, 
  Users, 
  Boxes, 
  ShoppingBag, 
  Wrench, 
  ShoppingCart, 
  ShieldCheck, 
  Keyboard, 
  Phone, 
  Mail, 
  HelpCircle, 
  ArrowRight, 
  BookOpen, 
  CornerDownLeft,
  MessageCircle,
  Clock,
  MapPin,
  CheckCircle2
} from 'lucide-react';

interface AjudaViewProps {
  onNavigate: (module: ErpModuleType, viewExtra?: string) => void;
}

export const AjudaView: React.FC<AjudaViewProps> = ({ onNavigate }) => {
  const passosOperacionais = [
    {
      numero: '01',
      modulo: 'configuracoes' as ErpModuleType,
      icone: Settings,
      titulo: 'Configurações (Emitente)',
      descricao:
        'Cadastre os dados cadastrais da MFx Tecnologia Industrial, chave PIX, contas bancárias e defina a numeração inicial de Orçamentos, OS e Notas Fiscais.',
      dica: 'Defina a alíquota municipal do ISS (2%) e o código LC 116 padrão para agilizar novos orçamentos.',
      botaoTexto: 'Acessar Configurações',
    },
    {
      numero: '02',
      modulo: 'pessoas' as ErpModuleType,
      icone: Users,
      titulo: 'Clientes e Fornecedores (Pessoas)',
      descricao:
        'Cadastre os clientes para emissão de Ordens de Serviço/Vendas e os fornecedores para controle de compras e notas fiscais de entrada.',
      dica: 'Utilize a busca automática de CNPJ e CEP para preencher Razão Social e endereço oficial da Receita Federal em 1 clique.',
      botaoTexto: 'Gerenciar Pessoas',
    },
    {
      numero: '03',
      modulo: 'estoque' as ErpModuleType,
      icone: Boxes,
      titulo: 'Produtos & Mão de Obra (Estoque)',
      descricao:
        'Mantenha o catálogo organizado. O sistema separa automaticamente Produtos (NF-e/SEFAZ com NCM e CFOP) de Serviços (NFS-e/Municipal com LC 116 e ISS).',
      dica: 'Consumíveis (lentes e bicos) possuem saldo físico. Serviços técnicos operam como mão de obra avulsa.',
      botaoTexto: 'Ver Estoque',
    },
    {
      numero: '04',
      modulo: 'compras' as ErpModuleType,
      icone: ShoppingBag,
      titulo: 'Compras (Entrada de Estoque)',
      descricao:
        'Lance as notas fiscais de compra para alimentar o saldo de estoque físico e atualizar os custos dos produtos de forma automática.',
      dica: 'A tela abre sempre limpa e calcula automaticamente o total da nota e o novo saldo físico em estoque.',
      botaoTexto: 'Registrar Compras',
    },
    {
      numero: '05',
      modulo: 'os' as ErpModuleType,
      viewExtra: 'nova',
      icone: Wrench,
      titulo: 'Ordem de Serviço (Nova OS)',
      descricao:
        'Selecione o cliente cadastrado e o tipo de equipamento (Laser Fibra, Plasma ou Oxicorte). Lance consumíveis e mão de obra técnica com totalizadores em tempo real.',
      dica: 'Pressione ENTER para navegar rapidamente entre os campos. Ao salvar, o formulário é zerado automaticamente para o próximo chamado.',
      botaoTexto: 'Abrir Nova OS',
    },
    {
      numero: '06',
      modulo: 'pdv' as ErpModuleType,
      icone: ShoppingCart,
      titulo: 'PDV - Vendas Balcão',
      descricao:
        'Faturamento ágil e direto de balcão sem poluição visual. Bipagem por código de barras, busca inteligente, baixa física imediata e lançamento no caixa.',
      dica: 'Finalize vendas em PIX, Cartão ou Boleto com impressão instantânea de comprovante não-fiscal.',
      botaoTexto: 'Acessar Caixa PDV',
    },
    {
      numero: '07',
      modulo: 'acesso' as ErpModuleType,
      icone: ShieldCheck,
      titulo: 'Acesso & Permissões (RBAC)',
      descricao:
        'Crie e gerencie contas para operadores, atendentes e técnicos, definindo permissões granulares por módulo para proteger informações financeiras e fiscais.',
      dica: 'Alterne rapidamente a sessão simulada no topo da tela de Acessos para testar a visão de cada operador.',
      botaoTexto: 'Gestão de Usuários',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. Cabeçalho Minimalista e Clean */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              MANUAL OPERACIONAL
            </span>
            <span className="text-xs text-slate-400 font-medium">| MFx Tecnologia Industrial</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-slate-700" />
            Guia Rápido de Uso do ERP
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Instruções passo a passo para o fluxo de atendimento diário, abertura de ordens de serviço, emissão de vendas e atalhos de digitação contínua.
          </p>
        </div>

        <button
          onClick={() => onNavigate('os', 'nova')}
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2.5 rounded-lg text-xs flex items-center gap-2 shadow-2xs transition shrink-0 cursor-pointer"
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Iniciar Atendimento (Nova OS)</span>
        </button>
      </div>

      {/* 2. Passo a Passo Operacional do Sistema (Cards Elegantes e Arejados) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            1. Fluxo Operacional Recomendado
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">7 etapas essenciais</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {passosOperacionais.map((passo, idx) => {
            const Icon = passo.icone;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-sm font-semibold group-hover:bg-slate-900 group-hover:text-white transition">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                        {passo.titulo}
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      #{passo.numero}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {passo.descricao}
                  </p>

                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-[11px] text-slate-500 mb-4 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{passo.dica}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Módulo integrado</span>
                  <button
                    onClick={() => onNavigate(passo.modulo, passo.viewExtra)}
                    className="text-xs font-semibold text-slate-700 hover:text-red-600 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span>{passo.botaoTexto}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Atalhos Rápidos de Teclado (Cartão Leve e Destaque Visual) */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
            <Keyboard className="w-4 h-4 text-slate-700" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              2. Atalhos Rápidos de Teclado (Digitação Contínua)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Otimize o tempo de atendimento em balcão e no lançamento de ordens de serviço sem precisar alternar para o mouse.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {/* Tecla ENTER */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <kbd className="px-2.5 py-1 bg-white border border-slate-300 rounded shadow-xs text-xs font-mono font-bold text-slate-800">
                  ENTER
                </kbd>
                <span className="text-xs font-bold text-slate-800">Avanço & Inserção</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                No campo <strong>Código/Descrição</strong>, pula para a <strong>Quantidade</strong>. Na Quantidade ou Preço, confirma e insere a linha na tabela de itens, reposicionando o foco automaticamente para o próximo código.
              </p>
            </div>
          </div>

          {/* Tecla TAB */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <kbd className="px-2.5 py-1 bg-white border border-slate-300 rounded shadow-xs text-xs font-mono font-bold text-slate-800">
                  TAB
                </kbd>
                <span className="text-xs font-bold text-slate-800">Navegação Alternada</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Navega sequencialmente entre os campos de cabeçalho, caixas de seleção de cliente, tipo de máquina e campos de despesas operacionais (KM, Horas, Diárias).
              </p>
            </div>
          </div>

          {/* Reset Automático */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <kbd className="px-2.5 py-1 bg-white border border-slate-300 rounded shadow-xs text-xs font-mono font-bold text-slate-800">
                  SALVAR OS
                </kbd>
                <span className="text-xs font-bold text-slate-800">Reset Automático</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ao clicar em <em>"Salvar e Iniciar Próxima OS"</em>, o sistema registra o atendimento, exibe a notificação de confirmação e limpa integralmente a tela, focando no seletor de cliente para a próxima OS.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Suporte Técnico MFx (Rodapé Simples, Limpo e Elegante) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              3. Suporte Técnico Interno MFx Tecnologia
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dúvidas sobre o funcionamento do ERP, parametrizações fiscais ou manutenção de máquinas CNC.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2 text-slate-700">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono font-medium">(14) 3262-1080</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2 text-slate-700">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-mono font-semibold">(14) 99845-7721</span>
            <span className="text-[10px] text-emerald-600 font-bold uppercase">WhatsApp ON</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2 text-slate-700">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono">contato@mfxindustrial.com.br</span>
          </div>
        </div>
      </div>
    </div>
  );
};
