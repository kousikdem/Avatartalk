import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WebTrainingData {
  id: string;
  url: string;
  scraped_content?: string;
  scraping_status: string;
  error_message?: string;
  created_at: string;
}

export const useWebTraining = () => {
  const [webData, setWebData] = useState<WebTrainingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const { toast } = useToast();

  const fetchWebData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('web_training_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebData(data || []);
    } catch (error) {
      console.error('Error fetching web data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch web training data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const scrapeUrl = useCallback(async (url: string) => {
    setIsScraping(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Call edge function to scrape URL
      const { data, error } = await supabase.functions.invoke('web-scraper', {
        body: { url }
      });

      if (error) throw error;

      await fetchWebData();
      
      toast({
        title: "Success",
        description: "URL scraped successfully",
      });

      return data;
    } catch (error) {
      console.error('Error scraping URL:', error);
      toast({
        title: "Error",
        description: "Failed to scrape URL",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsScraping(false);
    }
  }, [toast, fetchWebData]);

  const deleteWebData = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('web_training_data')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWebData(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "Success",
        description: "Web data deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting web data:', error);
      toast({
        title: "Error",
        description: "Failed to delete web data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    webData,
    isLoading,
    isScraping,
    fetchWebData,
    scrapeUrl,
    deleteWebData
  };
};