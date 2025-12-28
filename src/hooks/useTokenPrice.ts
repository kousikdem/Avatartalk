import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Default fallback price (1M tokens = ₹1000)
const DEFAULT_PRICE_PER_MILLION = 1000;

interface LimitValue {
  limit?: number;
  enabled?: boolean;
}

export const useTokenPrice = () => {
  const [pricePerMillionINR, setPricePerMillionINR] = useState<number>(DEFAULT_PRICE_PER_MILLION);
  const [loading, setLoading] = useState(true);

  const fetchPrice = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ai_system_limits')
        .select('limit_value')
        .eq('limit_key', 'gift_token_price_per_million')
        .maybeSingle();

      if (!error && data?.limit_value) {
        const limitValue = data.limit_value as LimitValue;
        if (limitValue.limit) {
          setPricePerMillionINR(limitValue.limit);
        } else {
          setPricePerMillionINR(DEFAULT_PRICE_PER_MILLION);
        }
      } else {
        setPricePerMillionINR(DEFAULT_PRICE_PER_MILLION);
      }
    } catch (error) {
      console.error('Error fetching token price:', error);
      setPricePerMillionINR(DEFAULT_PRICE_PER_MILLION);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  // Calculate tokens from rupees (INR base)
  const tokensFromRupees = (rupees: number): number => {
    return Math.floor((rupees / pricePerMillionINR) * 1000000);
  };

  // Calculate rupees from tokens (INR base)
  const rupeesFromTokens = (tokens: number): number => {
    return (tokens / 1000000) * pricePerMillionINR;
  };

  // Tokens per rupee
  const tokensPerRupee = 1000000 / pricePerMillionINR;

  // For backward compatibility, also export pricePerMillion
  return {
    pricePerMillion: pricePerMillionINR,
    pricePerMillionINR,
    tokensPerRupee,
    tokensFromRupees,
    rupeesFromTokens,
    loading,
    refetch: fetchPrice
  };
};
