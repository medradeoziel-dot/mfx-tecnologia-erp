export interface Cliente {
  id: string;
  documento: string; // CPF ou CNPJ
  nome: string; // Nome ou Razão Social
  nomeFantasia?: string;
  inscricaoEstadual?: string; // Inscrição Estadual (IE)
  indicadorIe?: '1' | '2' | '9'; // Indicador de IE na SEFAZ (1=Contribuinte, 2=Isento, 9=Não Contribuinte)
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  celular: string; // WhatsApp
  email: string;
  observacoes?: string;
  dataCadastro: string;
}

export type TipoItem = 'produto' | 'servico';

export type UnidadeMedida = 'UN' | 'PC' | 'HR' | 'DIA' | 'MT' | 'JG' | 'CX';

export type CategoriaItem = 
  | 'Consumíveis' 
  | 'Serviços Laser' 
  | 'Serviços Oxicorte' 
  | 'Serviços Plasma' 
  | 'Mão de Obra'
  | 'Peças & Acessórios';

export interface ItemEstoque {
  id: string;
  tipo: TipoItem; // 'produto' (NF-e) ou 'servico' (NFS-e)
  codigo: string;
  descricao: string;
  categoria: CategoriaItem;
  unidadeMedida: UnidadeMedida; // HR, UN, DIA, PC, etc.
  precoVenda: number;
  estoqueAtual: number; // Para produtos. Para serviços = 0
  estoqueMinimo?: number;
  
  // CAMPOS FISCAIS NFS-e (Mão de Obra / Serviços)
  codigoServicoLc116?: string; // Ex: 14.01
  descricaoLc116?: string; // Ex: Manutenção e conservação de máquinas
  codigoTributacaoMunicipal?: string; // CTISS / Código de Atividade do Município
  itemLc116?: string; // Item da LC 116/2003 (ex: 14.01.01)
  aliquotaIss?: number; // Ex: 2.00, 3.00, 5.00 (%)
  exigibilidadeIss?: '1' | '2' | '3' | '4' | '5' | '6' | '7'; // 1=Exigível, 2=Não Incidência, 3=Isenção, etc.
  retencaoIss?: boolean; // Sim / Não
  cfopServico?: string; // Ex: 5933, 6933

  // CAMPOS FISCAIS NF-e Mod. 55 (Produtos / Consumíveis)
  ncm?: string; // Ex: 9027.90.99, 8466.93.30
  cstCsosn?: string; // Ex: 0102, 0101, 0500
  cfopProduto?: string; // Ex: 5102, 5405
  origem?: '0' | '1' | '2' | '3' | '5'; // 0=Nacional, 1=Importada, etc.
  
  observacoesFiscais?: string;
  dataAtualizacao?: string;
}

export interface ItemOS {
  id: string;
  tipoItem?: TipoItem; // 'produto' ou 'servico'
  categoria: CategoriaItem;
  codigo: string;
  descricao: string;
  unidade?: UnidadeMedida | string;
  precoUnitario: number;
  quantidade: number;
  valorTotal: number;
  prazoEntrega: string;
  
  // Informações Fiscais para Separação NFS-e x NF-e
  ncm?: string;
  codigoLc116?: string;
  aliquotaIss?: number;
  cfop?: string;
}

export type StatusOS = 'Orçamento' | 'Aprovado' | 'Em Execução' | 'Concluído' | 'Faturado' | 'Cancelado';

export interface OrdemServico {
  id: string;
  numeroOS: string;
  clienteId: string;
  clienteNome: string;
  clienteNomeFantasia?: string;
  clienteDocumento: string;
  clienteInscricaoEstadual?: string;
  clienteTelefone: string;
  clienteCelular: string;
  clienteEmail: string;
  clienteEndereco: string;
  clienteCidade: string;
  clienteEstado: string;
  clienteCep: string;
  
  // Equipamento
  equipamentoTipo: 'Laser Fibra' | 'Plasma' | 'Oxicorte' | 'Mesa CNC Multifunção' | 'Outro';
  modeloEquipamento: string;
  numeroSerie?: string;
  potenciaFonte?: string; // Ex: 3000W Raycus / Max / IPG / Hypertherm
  
  // Datas
  dataAbertura: string;
  dataPrevisao: string;
  dataConclusao?: string;
  status: StatusOS;

  // Custos Operacionais
  kmRodados: number;
  valorUnitarioKm: number; // padrão R$ 2,50
  horasTrabalhadas: number;
  valorHoraTecnica: number; // padrão R$ 100,00
  despesaAlimentacao: number;
  despesaEstadia: number;
  outrasDespesas: number;
  descricaoDespesas?: string;

  // Itens dinâmicos
  itens: ItemOS[];

  // Informações complementares
  condicoesPagamento: string;
  prazoGarantia: string;
  tecnicoResponsavel: string;
  observacoesGerais: string;

  // Totais calculados
  totalKm: number;
  totalHoras: number;
  totalDespesas: number;
  totalOperacional: number;
  totalItens: number;
  valorTotalGeral: number;
}

export interface ItemCompra {
  id: string;
  produtoId?: string;
  codigo: string;
  descricao: string;
  categoria?: string;
  unidadeMedida: UnidadeMedida | string;
  quantidade: number;
  precoCustoUnitario: number;
  valorTotal: number;
}

export interface Compra {
  id: string;
  numeroNota: string;
  fornecedor: string;
  dataCompra: string;
  observacoes?: string;
  itens: ItemCompra[];
  valorTotal: number;
  dataCadastro?: string;
}

export type FormaPagamento = 
  | 'DINHEIRO' 
  | 'PIX' 
  | 'CARTAO_CREDITO' 
  | 'CARTAO_DEBITO' 
  | 'BOLETO';

export interface ItemVenda {
  id: string;
  produtoId?: string;
  codigo: string;
  descricao: string;
  categoria?: string;
  unidadeMedida: UnidadeMedida | string;
  quantidade: number;
  precoUnitario: number;
  descontoUnitario?: number;
  valorTotal: number;
}

export interface Venda {
  id: string;
  codigoVenda: string;
  clienteId?: string;
  clienteNome: string;
  clienteDocumento?: string;
  dataVenda: string;
  horaVenda: string;
  formaPagamento: FormaPagamento;
  detalhePagamento?: string;
  valorSubtotal: number;
  valorDesconto: number;
  valorTotal: number;
  valorRecebido?: number;
  valorTroco?: number;
  itens: ItemVenda[];
  observacoes?: string;
  operador: string;
}

export interface MovimentoCaixa {
  id: string;
  tipo: 'ENTRADA' | 'SAIDA';
  origem: 'PDV' | 'OS' | 'COMPRA' | 'MANUAL';
  referenciaId?: string;
  descricao: string;
  formaPagamento: FormaPagamento | string;
  valor: number;
  dataHora: string;
  operador: string;
}

export type PerfilUsuario = 'Administrador' | 'Operador/Técnico' | 'Vendas/Financeiro';

export interface PermissoesModulos {
  clientes: boolean;
  os: boolean;
  estoque: boolean;
  compras: boolean;
  pdv: boolean;
  financeiro: boolean;
  fiscal: boolean;
  acesso: boolean;
}

export interface Usuario {
  id: string;
  nome: string;
  login: string;
  email: string;
  senha?: string;
  perfil: PerfilUsuario;
  status: 'Ativo' | 'Inativo';
  permissoes: PermissoesModulos;
  ultimoAcesso?: string;
  dataCadastro: string;
}

export interface ConfiguracaoEmitente {
  // a) Dados do Emitente
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  inscricaoMunicipal: string;
  cnaePrincipal: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  whatsapp: string;
  email: string;
  emailFinanceiro: string;
  website: string;

  // b) Sequências e Numeração
  proximaOsNumero: number;
  proximaCotacaoNumero: number;
  proximaVendaNumero: number;
  proximaNfeNumero: number;
  proximaNfseNumero: number;
  serieNfe: string;
  serieNfse: string;

  // c) Dados Bancários & PIX
  tipoChavePix: 'CNPJ' | 'E-mail' | 'Telefone' | 'Aleatória';
  chavePix: string;
  bancoCodigo: string;
  bancoNome: string;
  agencia: string;
  contaCorrente: string;
  favorecidoNome: string;
  instrucoesBoleto: string;

  // d) Regras Tributárias e Fiscais
  regimeTributario: 'Simples Nacional' | 'Simples Nacional - Excesso de Sublimite' | 'Regime Normal (Lucro Presumido)' | 'Regime Normal (Lucro Real)';
  csosnPadrao: string;
  aliquotaIss: number;
  codigoServicoLc116: string;
  descricaoServicoLc116: string;
  ncmPadrao: string;
  cfopProdutoPadrao: string;
  cfopServicoPadrao: string;
  informacoesFisco: string;
}

// MÓDULO FINANCEIRO: CONTAS A RECEBER & CONTAS A PAGAR
export type StatusContaReceber = 'Pendente' | 'Pago' | 'Cancelado';
export type StatusContaPagar = 'A Pagar' | 'Pago' | 'Cancelado';

export type CategoriaDespesa = 
  | 'Insumos / Matéria-Prima'
  | 'Aluguel'
  | 'Energia / Água'
  | 'Frete / Logística'
  | 'Peças de Reposição'
  | 'Folha / Pró-labore'
  | 'Manutenção'
  | 'Impostos / Taxas'
  | 'Outros';

export interface ContaReceber {
  id: string;
  cliente: string;
  clienteDocumento?: string;
  origemTipo: 'OS' | 'PDV' | 'COTACAO' | 'MANUAL';
  origemNumero: string; // Ex: "OS #2026-0101", "PDV #VD-202610-001", "Cotação #COT-104"
  origemId?: string;
  valorTotal: number;
  dataLancamento: string;
  dataVencimento: string;
  status: StatusContaReceber;
  dataBaixa?: string;
  formaPagamento?: FormaPagamento | string;
  observacoes?: string;
}

export interface ContaPagar {
  id: string;
  fornecedorOuDespesa: string;
  categoria: CategoriaDespesa;
  origemTipo: 'COMPRA' | 'MANUAL';
  origemNumero?: string; // Ex: "NF-e 048.912"
  origemId?: string;
  valor: number;
  dataLancamento: string;
  dataVencimento: string;
  status: StatusContaPagar;
  dataBaixa?: string;
  formaPagamento?: FormaPagamento | string;
  contaSaida?: string;
  observacoes?: string;
}

export interface NotaFiscalNfe {
  id: string;
  numero: string; // Ex: "000.001.240"
  serie: string; // "1"
  chaveAcesso: string; // 44 dígitos
  dataEmissao: string;
  origemTipo: 'OS' | 'PDV';
  origemNumero: string; // Ex: "OS #2026-0101" ou "PDV #VD-0044"
  clienteId?: string;
  clienteNome: string;
  clienteDocumento: string;
  clienteCidade: string;
  clienteEstado: string;
  naturezaOperacao: string; // "Venda de mercadoria / consumíveis"
  cfop: string; // "5102"
  valorTotal: number;
  status: 'Autorizada' | 'Cancelada';
  protocoloAutorizacao: string;
  motivoCancelamento?: string;
  dataCancelamento?: string;
  protocoloCancelamento?: string;
  itens: {
    codigo: string;
    descricao: string;
    ncm: string;
    quantidade: number;
    unidade: string;
    valorUnitario: number;
    valorTotal: number;
  }[];
}

export interface NotaFiscalNfse {
  id: string;
  numero: string; // Ex: "2026/000085"
  codigoVerificacao: string; // Ex: "A8F3-7C21-99B4"
  dataEmissao: string;
  origemTipo: 'OS';
  origemNumero: string; // Ex: "OS #2026-0101"
  clienteId?: string;
  clienteNome: string;
  clienteDocumento: string;
  clienteCidade: string;
  clienteEstado: string;
  itemLc116: string; // "14.01"
  descricaoLc116: string; // "Lubrificação, revisão, conserto, restauração e manutenção de máquinas"
  discriminacaoServico: string;
  valorServicos: number;
  aliquotaIss: number; // 2.0
  valorIss: number;
  status: 'Autorizada' | 'Cancelada';
  protocoloAutorizacao: string;
  motivoCancelamento?: string;
  dataCancelamento?: string;
  protocoloCancelamento?: string;
}

