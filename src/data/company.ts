export const MFX_COMPANY = {
  razaoSocial: 'MFx Tecnologia Industrial Ltda',
  nomeFantasia: 'MFx Tecnologia Industrial',
  cnpj: '34.375.789-0001/87',
  inscricaoEstadual: '154.892.411.112',
  endereco: 'Rua Sargento Andiras, nº 874',
  bairro: 'Centro',
  cidade: 'Agudos',
  estado: 'SP',
  cep: '17120-031',
  telefone: '(14) 3262-1080',
  whatsapp: '(14) 99845-7721',
  email: 'contato@mfxindustrial.com.br',
  emailComercial: 'comercial@mfxindustrial.com.br',
  site: 'www.mfxindustrial.com.br',
  slogan: 'LASER FIBRA, PLASMA, OXI-CORTE',
  subtitulo: 'Assistência Técnica Especializada, Retrofit & Consumíveis Industriais',
  valorKmPadrao: 2.50,
  valorHoraPadrao: 100.00,
};

export interface ItemPredefinido {
  categoria: 'Consumíveis' | 'Serviços Laser' | 'Serviços Oxicorte' | 'Serviços Plasma' | 'Peças & Acessórios';
  codigo: string;
  descricao: string;
  precoSugerido: number;
  prazoSugerido: string;
}

export const CATALOGO_PREDEFINIDO: ItemPredefinido[] = [
  // Consumíveis Laser Fibra
  {
    categoria: 'Consumíveis',
    codigo: 'MFX-LP30-15',
    descricao: 'Lente de Proteção Laser Fibra D30 x 1.5mm Quartzo Fundido 1064nm',
    precoSugerido: 120.00,
    prazoSugerido: 'Pronta Entrega',
  },
  {
    categoria: 'Consumíveis',
    codigo: 'MFX-BD-15',
    descricao: 'Bico Laser Duplo Cromado D32 H15 Calibre 1.5mm',
    precoSugerido: 85.00,
    prazoSugerido: 'Pronta Entrega',
  },
  {
    categoria: 'Consumíveis',
    codigo: 'MFX-BS-20',
    descricao: 'Bico Laser Simples Cromado D32 H15 Calibre 2.0mm (Inox/Alumínio)',
    precoSugerido: 85.00,
    prazoSugerido: 'Pronta Entrega',
  },
  {
    categoria: 'Consumíveis',
    codigo: 'MFX-AC-28',
    descricao: 'Anel Cerâmico para Cabeçote de Corte Raytools / WSX D28mm',
    precoSugerido: 220.00,
    prazoSugerido: 'Pronta Entrega',
  },
  {
    categoria: 'Consumíveis',
    codigo: 'MFX-CC-01',
    descricao: 'Cabo Sensor Capacitivo SMA x BNC para Controle de Altura BCS100',
    precoSugerido: 340.00,
    prazoSugerido: 'Pronta Entrega',
  },
  
  // Consumíveis Plasma & Oxicorte
  {
    categoria: 'Consumíveis',
    codigo: 'MFX-BP-105',
    descricao: 'Bico de Plasma Alta Definição 105A (Corte Aço Carbono)',
    precoSugerido: 95.00,
    prazoSugerido: 'Pronta Entrega',
  },
  {
    categoria: 'Consumíveis',
    codigo: 'MFX-EP-100',
    descricao: 'Eletrodo de Plasma Híbrido Cobre/Háfnio 100A',
    precoSugerido: 110.00,
    prazoSugerido: 'Pronta Entrega',
  },
  {
    categoria: 'Consumíveis',
    codigo: 'MFX-BO-1502',
    descricao: 'Bico de Corte Oxicorte 1502 GLP/Oxigênio nº 02 (Chapas 1/2" a 1")',
    precoSugerido: 68.00,
    prazoSugerido: 'Pronta Entrega',
  },
  {
    categoria: 'Consumíveis',
    codigo: 'MFX-VC-04',
    descricao: 'Válvula de Retenção Corta-Chama para Maçarico Oxicorte',
    precoSugerido: 145.00,
    prazoSugerido: 'Pronta Entrega',
  },

  // Serviços Especializados
  {
    categoria: 'Serviços Laser',
    codigo: 'MFX-SRV-LASER-01',
    descricao: 'Alinhamento Óptico do Feixe de Laser Fibra, Colimação e Foco',
    precoSugerido: 650.00,
    prazoSugerido: 'Imediato (In-loco)',
  },
  {
    categoria: 'Serviços Laser',
    codigo: 'MFX-SRV-LASER-02',
    descricao: 'Manutenção Preventiva de Cabeçote de Corte e Troca de Selos/Anéis',
    precoSugerido: 480.00,
    prazoSugerido: 'Imediato (In-loco)',
  },
  {
    categoria: 'Serviços Oxicorte',
    codigo: 'MFX-SRV-OXI-01',
    descricao: 'Revisão Geral do Maçarico de Oxicorte, Troca de Gaxetas e Calibração de Pressão',
    precoSugerido: 350.00,
    prazoSugerido: 'Imediato (In-loco)',
  },
  {
    categoria: 'Serviços Plasma',
    codigo: 'MFX-SRV-PLAS-01',
    descricao: 'Diagnóstico de Arco Piloto e Revisão da Fonte Plasma CNC',
    precoSugerido: 550.00,
    prazoSugerido: 'Imediato (In-loco)',
  },
  {
    categoria: 'Peças & Acessórios',
    codigo: 'MFX-CABO-COM',
    descricao: 'Cabo de Comunicação Industrial Blindado CNC RS232/Ethernet 15m',
    precoSugerido: 290.00,
    prazoSugerido: '2 a 3 dias úteis',
  },
];
