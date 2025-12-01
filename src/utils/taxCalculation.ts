// Tax rates for GST (Indian taxation)
export const TAX_RATES: Record<string, { rate: number; label: string }> = {
  'zero': { rate: 0, label: '0% (Exempt)' },
  'reduced': { rate: 5, label: '5% GST' },
  'standard-12': { rate: 12, label: '12% GST' },
  'standard': { rate: 18, label: '18% GST' },
  'luxury': { rate: 28, label: '28% GST' },
};

export const getTaxRate = (taxClass: string | null): number => {
  if (!taxClass) return 0;
  return TAX_RATES[taxClass]?.rate || 0;
};

export const getTaxLabel = (taxClass: string | null): string => {
  if (!taxClass) return 'No Tax';
  return TAX_RATES[taxClass]?.label || 'No Tax';
};

export const calculateTax = (amount: number, taxClass: string | null, taxable: boolean = true): number => {
  if (!taxable || !taxClass) return 0;
  const rate = getTaxRate(taxClass);
  return Math.round((amount * rate) / 100);
};

export const calculateTotalWithTax = (
  subtotal: number,
  taxClass: string | null,
  taxable: boolean = true,
  shipping: number = 0
): { subtotal: number; tax: number; shipping: number; total: number } => {
  const tax = calculateTax(subtotal, taxClass, taxable);
  return {
    subtotal,
    tax,
    shipping,
    total: subtotal + tax + shipping
  };
};
