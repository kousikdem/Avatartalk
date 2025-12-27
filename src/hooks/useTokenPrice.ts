import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Default fallback price (1M tokens = ₹1000)
const DEFAULT_PRICE_PER_MILLION = 1000;

interface LimitValue {
  limit?: number;
  enabled?: boolean;
}

export const useTokenPrice = () => {
  const [pricePerMillion, setPricePerMillion] = useState<number>(DEFAULT_PRICE_PER_MILLION);
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
          setPricePerMillion(limitValue.limit);
        } else {
          setPricePerMillion(DEFAULT_PRICE_PER_MILLION);
        }
      } else {
        setPricePerMillion(DEFAULT_PRICE_PER_MILLION);
      }
    } catch (error) {
      console.error('Error fetching token price:', error);
      setPricePerMillion(DEFAULT_PRICE_PER_MILLION);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  // Calculate tokens from rupees
  const tokensFromRupees = (rupees: number): number => {
    return Math.floor((rupees / pricePerMillion) * 1000000);
  };

  // Calculate rupees from tokens
  const rupeesFromTokens = (tokens: number): number => {
    return (tokens / 1000000) * pricePerMillion;
  };

  // Tokens per rupee
  const tokensPerRupee = 1000000 / pricePerMillion;

  return {
    pricePerMillion,
    tokensPerRupee,
    tokensFromRupees,
    rupeesFromTokens,
    loading,
    refetch: fetchPrice
  };
};
