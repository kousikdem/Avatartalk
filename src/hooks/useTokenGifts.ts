import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SenderProfile {
  display_name: string | null;
  username: string | null;
  profile_pic_url: string | null;
}

interface TokenGift {
  id: string;
  sender_id: string;
  receiver_id: string;
  amount: number;
  amount_paid: number;
  currency: string;
  message: string | null;
  status: string;
  created_at: string;
  completed_at: string | null;
  sender?: SenderProfile | null;
}

export const useTokenGifts = (userId?: string) => {
  const [receivedGifts, setReceivedGifts] = useState<TokenGift[]>([]);
  const [sentGifts, setSentGifts] = useState<TokenGift[]>([]);
  const [totalReceived, setTotalReceived] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchGifts = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch received gifts (without join due to multiple relations)
      const { data: received, error: receivedError } = await supabase
        .from('token_gifts')
        .select('*')
        .eq('receiver_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(50);

      if (receivedError) {
        console.error('Error fetching received gifts:', receivedError);
      } else {
        // Fetch sender profiles separately
        const senderIds = [...new Set((received || []).map(g => g.sender_id))];
        const { data: senders } = await supabase
          .from('profiles')
          .select('id, display_name, username, profile_pic_url')
          .in('id', senderIds);

        const senderMap = new Map(senders?.map(s => [s.id, s]) || []);
        
        const giftsWithSenders: TokenGift[] = (received || []).map(gift => ({
          ...gift,
          sender: senderMap.get(gift.sender_id) as SenderProfile | null
        }));

        setReceivedGifts(giftsWithSenders);
        const total = giftsWithSenders.reduce((sum, gift) => sum + gift.amount, 0);
        setTotalReceived(total);
      }

      // Fetch sent gifts
      const { data: sent, error: sentError } = await supabase
        .from('token_gifts')
        .select('*')
        .eq('sender_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(50);

      if (sentError) {
        console.error('Error fetching sent gifts:', sentError);
      } else {
        setSentGifts(sent || []);
      }
    } catch (error) {
      console.error('Error in fetchGifts:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchGifts();
  }, [fetchGifts]);

  // Subscribe to new gifts
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('token-gifts-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'token_gifts',
        filter: `receiver_id=eq.${userId}`
      }, () => {
        fetchGifts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchGifts]);

  return {
    receivedGifts,
    sentGifts,
    totalReceived,
    loading,
    refetch: fetchGifts
  };
};
