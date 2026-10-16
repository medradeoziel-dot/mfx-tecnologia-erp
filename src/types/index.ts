export interface Cliente {
  id: string;
  documento: string; // CPF ou CNPJ
  nome: string; // Nome ou Razão Social
  nomeFantasia?: string;
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

export type CategoriaItem = 
  | 'Consumíveis' 
  | 'Serviços Laser' 
  | 'Serviços Oxicorte' 
  | 'Serviços Plasma' 
  | 'Peças & Acessórios';

export interface ItemOS {
  id: string;
  categoria: CategoriaItem;
  codigo: string;
  descricao: string;
  precoUnitario: number;
  quantidade: number;
  valorTotal: number;
  prazoEntrega: string;
}

export type StatusOS = 'Orçamento' | 'Aprovado' | 'Em Execução' | 'Concluído' | 'Faturado' | 'Cancelado';

export interface OrdemServico {
  id: string;
  numeroOS: string;
  clienteId: string;
  clienteNome: string;
  clienteDocumento: string;
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
