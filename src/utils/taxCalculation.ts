// Country-wise tax configuration
export interface CountryTaxConfig {
  name: string;
  code: string;
  taxType: string;
  rates: { key: string; rate: number; label: string }[];
}

export const COUNTRY_TAX_CONFIG: Record<string, CountryTaxConfig> = {
  IN: {
    name: 'India',
    code: 'IN',
    taxType: 'GST',
    rates: [
      { key: 'zero', rate: 0, label: '0% (Exempt)' },
      { key: 'reduced', rate: 5, label: '5% GST' },
      { key: 'standard-12', rate: 12, label: '12% GST' },
      { key: 'standard', rate: 18, label: '18% GST' },
      { key: 'luxury', rate: 28, label: '28% GST' },
    ],
  },
  US: {
    name: 'United States',
    code: 'US',
    taxType: 'Sales Tax',
    rates: [
      { key: 'zero', rate: 0, label: '0% (Exempt)' },
      { key: 'low', rate: 4, label: '4% Sales Tax' },
      { key: 'standard', rate: 6, label: '6% Sales Tax' },
      { key: 'high', rate: 8, label: '8% Sales Tax' },
      { key: 'highest', rate: 10, label: '10% Sales Tax' },
    ],
  },
  GB: {
    name: 'United Kingdom',
    code: 'GB',
    taxType: 'VAT',
    rates: [
      { key: 'zero', rate: 0, label: '0% (Zero Rate)' },
      { key: 'reduced', rate: 5, label: '5% VAT (Reduced)' },
      { key: 'standard', rate: 20, label: '20% VAT (Standard)' },
    ],
  },
  DE: {
    name: 'Germany',
    code: 'DE',
    taxType: 'VAT',
    rates: [
      { key: 'zero', rate: 0, label: '0% (Exempt)' },
      { key: 'reduced', rate: 7, label: '7% VAT (Reduced)' },
      { key: 'standard', rate: 19, label: '19% VAT (Standard)' },
    ],
  },
  FR: {
    name: 'France',
    code: 'FR',
    taxType: 'VAT',
    rates: [
      { key: 'zero', rate: 0, label: '0% (Exempt)' },
      { key: 'super-reduced', rate: 2.1, label: '2.1% VAT (Super Reduced)' },
      { key: 'reduced', rate: 5.5, label: '5.5% VAT (Reduced)' },
      { key: 'intermediate', rate: 10, label: '10% VAT (Intermediate)' },
      { key: 'standard', rate: 20, label: '20% VAT (Standard)' },
    ],
  },
  CA: {
    name: 'Canada',
    code: 'CA',
    taxType: 'GST/HST',
    rates: [
      { key: 'zero', rate: 0, label: '0% (Exempt)' },
      { key: 'gst', rate: 5, label: '5% GST' },
      { key: 'hst-13', rate: 13, label: '13% HST' },
      { key: 'hst-15', rate: 15, label: '15% HST' },
    ],
  },
  AU: {
    name: 'Australia',
    code: 'AU',
    taxType: 'GST',
    rates: [
      { key: 'zero', rate: 0, label: '0% (GST Free)' },
      { key: 'standard', rate: 10, label: '10% GST' },
    ],
  },
  JP: {
    name: 'Japan',
    code: 'JP',
    taxType: 'Consumption Tax',
    rates: [
      { key: 'zero', rate: 0, label: '0% (Exempt)' },
      { key: 'reduced', rate: 8, label: '8% (Reduced)' },
      { key: 'standard', rate: 10, label: '10% (Standard)' },
    ],
  },
  SG: {
    name: 'Singapore',
    code: 'SG',
    taxType: 'GST',
    rates: [
      { key: 'zero', rate: 0, label: '0% (Exempt)' },
      { key: 'standard', rate: 9, label: '9% GST' },
    ],
  },
  AE: {
    name: 'United Arab Emirates',
    code: 'AE',
    taxType: 'VAT',
    rates: [
      { key: 'zero', rate: 0, label: '0% (Zero Rate)' },
      { key: 'standard', rate: 5, label: '5% VAT' },
    ],
  },
  BR: {
    name: 'Brazil',
    code: 'BR',
    taxType: 'ICMS',
    rates: [
      { key: 'zero', rate: 0, label: '0% (Exempt)' },
      { key: 'reduced', rate: 7, label: '7% ICMS' },
      { key: 'standard-12', rate: 12, label: '12% ICMS' },
      { key: 'standard', rate: 18, label: '18% ICMS' },
      { key: 'high', rate: 25, label: '25% ICMS' },
    ],
  },
  MX: {
    name: 'Mexico',
    code: 'MX',
    taxType: 'IVA',
    rates: [
      { key: 'zero', rate: 0, label: '0% (Exempt)' },
      { key: 'standard', rate: 16, label: '16% IVA' },
    ],
  },
  ZA: {
    name: 'South Africa',
    code: 'ZA',
    taxType: 'VAT',
    rates: [
      { key: 'zero', rate: 0, label: '0% (Zero Rate)' },
      { key: 'standard', rate: 15, label: '15% VAT' },
    ],
  },
  NZ: {
    name: 'New Zealand',
    code: 'NZ',
    taxType: 'GST',
    rates: [
      { key: 'zero', rate: 0, label: '0% (Exempt)' },
      { key: 'standard', rate: 15, label: '15% GST' },
    ],
  },
  IT: {
    name: 'Italy',
    code: 'IT',
    taxType: 'VAT',
    rates: [
      { key: 'zero', rate: 0, label: '0% (Exempt)' },
      { key: 'super-reduced', rate: 4, label: '4% VAT (Super Reduced)' },
      { key: 'reduced', rate: 10, label: '10% VAT (Reduced)' },
      { key: 'standard', rate: 22, label: '22% VAT (Standard)' },
    ],
  },
  ES: {
    name: 'Spain',
    code: 'ES',
    taxType: 'VAT',
    rates: [
      { key: 'zero', rate: 0, label: '0% (Exempt)' },
      { key: 'super-reduced', rate: 4, label: '4% VAT (Super Reduced)' },
      { key: 'reduced', rate: 10, label: '10% VAT (Reduced)' },
      { key: 'standard', rate: 21, label: '21% VAT (Standard)' },
    ],
  },
  CN: {
    name: 'China',
    code: 'CN',
    taxType: 'VAT',
    rates: [
      { key: 'zero', rate: 0, label: '0% (Exempt)' },
      { key: 'reduced', rate: 6, label: '6% VAT' },
      { key: 'standard-9', rate: 9, label: '9% VAT' },
      { key: 'standard', rate: 13, label: '13% VAT' },
    ],
  },
  KR: {
    name: 'South Korea',
    code: 'KR',
    taxType: 'VAT',
    rates: [
      { key: 'zero', rate: 0, label: '0% (Exempt)' },
      { key: 'standard', rate: 10, label: '10% VAT' },
    ],
  },
  OTHER: {
    name: 'Other',
    code: 'OTHER',
    taxType: 'Tax',
    rates: [
      { key: 'zero', rate: 0, label: '0% (No Tax)' },
      { key: 'low', rate: 5, label: '5% Tax' },
      { key: 'standard', rate: 10, label: '10% Tax' },
      { key: 'high', rate: 15, label: '15% Tax' },
      { key: 'highest', rate: 20, label: '20% Tax' },
    ],
  },
};

// Get all countries for dropdown
export const getCountryList = () => {
  return Object.values(COUNTRY_TAX_CONFIG).map(config => ({
    code: config.code,
    name: config.name,
    taxType: config.taxType,
  }));
};

// Get tax rates for a specific country
export const getTaxRatesForCountry = (countryCode: string) => {
  const config = COUNTRY_TAX_CONFIG[countryCode] || COUNTRY_TAX_CONFIG.OTHER;
  return config.rates;
};

// Get tax type label for a country
export const getTaxTypeForCountry = (countryCode: string) => {
  const config = COUNTRY_TAX_CONFIG[countryCode] || COUNTRY_TAX_CONFIG.OTHER;
  return config.taxType;
};

// Parse tax_class which now includes country code (e.g., "IN:standard" or legacy "standard")
export const parseTaxClass = (taxClass: string | null): { countryCode: string; rateKey: string } => {
  if (!taxClass) return { countryCode: 'IN', rateKey: 'zero' };
  
  if (taxClass.includes(':')) {
    const [countryCode, rateKey] = taxClass.split(':');
    return { countryCode, rateKey };
  }
  
  // Legacy format - assume India GST
  return { countryCode: 'IN', rateKey: taxClass };
};

// Format tax_class for storage
export const formatTaxClass = (countryCode: string, rateKey: string): string => {
  return `${countryCode}:${rateKey}`;
};

// Get tax rate from tax_class
export const getTaxRate = (taxClass: string | null): number => {
  const { countryCode, rateKey } = parseTaxClass(taxClass);
  const rates = getTaxRatesForCountry(countryCode);
  const rate = rates.find(r => r.key === rateKey);
  return rate?.rate || 0;
};

// Get tax label from tax_class
export const getTaxLabel = (taxClass: string | null): string => {
  if (!taxClass) return 'No Tax';
  
  const { countryCode, rateKey } = parseTaxClass(taxClass);
  const config = COUNTRY_TAX_CONFIG[countryCode] || COUNTRY_TAX_CONFIG.OTHER;
  const rate = config.rates.find(r => r.key === rateKey);
  
  if (!rate) return 'No Tax';
  return `${rate.label} (${config.name})`;
};

// Get short tax label (without country)
export const getShortTaxLabel = (taxClass: string | null): string => {
  if (!taxClass) return 'No Tax';
  
  const { countryCode, rateKey } = parseTaxClass(taxClass);
  const rates = getTaxRatesForCountry(countryCode);
  const rate = rates.find(r => r.key === rateKey);
  
  return rate?.label || 'No Tax';
};

// Calculate tax amount
export const calculateTax = (amount: number, taxClass: string | null, taxable: boolean = true): number => {
  if (!taxable || !taxClass) return 0;
  const rate = getTaxRate(taxClass);
  return Math.round((amount * rate) / 100);
};

// Calculate total with tax breakdown
export const calculateTotalWithTax = (
  subtotal: number,
  taxClass: string | null,
  taxable: boolean = true,
  shipping: number = 0
): { subtotal: number; tax: number; taxRate: number; taxLabel: string; shipping: number; total: number } => {
  const tax = calculateTax(subtotal, taxClass, taxable);
  const taxRate = getTaxRate(taxClass);
  const taxLabel = getShortTaxLabel(taxClass);
  
  return {
    subtotal,
    tax,
    taxRate,
    taxLabel,
    shipping,
    total: subtotal + tax + shipping
  };
};
