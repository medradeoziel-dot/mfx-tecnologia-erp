export interface InscricaoEstadualBrasilApi {
  inscricao_estadual: string;
  ativo?: boolean;
  estado?: string;
}

export interface BrasilApiCnpjResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  inscricoes_estaduais?: InscricaoEstadualBrasilApi[];
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  ddd_telefone_1?: string;
  ddd_telefone_2?: string;
  email?: string;
  situacao_cadastral?: string;
  descricao_situacao_cadastral?: string;
}

export interface BrasilApiCepResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service?: string;
}

export const cleanDigits = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const fetchCnpjData = async (cnpjInput: string): Promise<BrasilApiCnpjResponse | null> => {
  const digits = cleanDigits(cnpjInput);
  if (digits.length !== 14) {
    throw new Error('CNPJ deve conter 14 dígitos numéricos.');
  }

  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('CNPJ não encontrado na base pública da Receita Federal.');
      }
      throw new Error(`Erro na consulta BrasilAPI (HTTP ${res.status}).`);
    }
    const data: BrasilApiCnpjResponse = await res.json();
    return data;
  } catch (err: any) {
    console.warn('Erro ao consultar BrasilAPI CNPJ:', err);
    throw err;
  }
};

export const fetchCepData = async (cepInput: string): Promise<{
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
} | null> => {
  const digits = cleanDigits(cepInput);
  if (digits.length !== 8) {
    throw new Error('CEP deve conter 8 dígitos.');
  }

  // Tenta primeiro BrasilAPI v2
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${digits}`);
    if (res.ok) {
      const data: BrasilApiCepResponse = await res.json();
      return {
        cep: data.cep,
        logradouro: data.street || '',
        bairro: data.neighborhood || '',
        cidade: data.city || '',
        estado: data.state || '',
      };
    }
  } catch (e) {
    console.warn('BrasilAPI CEP indisponível, tentando ViaCEP fallback...');
  }

  // Fallback ViaCEP
  try {
    const resVia = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (resVia.ok) {
      const viaData = await resVia.json();
      if (!viaData.erro) {
        return {
          cep: viaData.cep,
          logradouro: viaData.logradouro || '',
          bairro: viaData.bairro || '',
          cidade: viaData.localidade || '',
          estado: viaData.uf || '',
        };
      }
    }
  } catch (errVia) {
    console.warn('Erro ViaCEP:', errVia);
  }

  throw new Error('Não foi possível localizar o endereço pelo CEP.');
};
