export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatNumber = (value: number | undefined | null, decimals = 2): string => {
  if (value === undefined || value === null || isNaN(value)) return '0,00';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatCpfCnpj = (val: string): string => {
  const digits = val.replace(/\D/g, '');
  if (digits.length <= 11) {
    // CPF: 000.000.000-00
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  } else {
    // CNPJ: 00.000.000/0000-00
    return digits
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
      .slice(0, 18);
  }
};

export const formatCep = (val: string): string => {
  const digits = val.replace(/\D/g, '');
  return digits.replace(/(\d{5})(\d{1,3})$/, '$1-$2').slice(0, 9);
};

export const formatPhone = (val: string): string => {
  const digits = val.replace(/\D/g, '');
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3').slice(0, 14);
  }
  return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').slice(0, 15);
};

export const formatDateBr = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR');
  } catch {
    return dateStr;
  }
};
