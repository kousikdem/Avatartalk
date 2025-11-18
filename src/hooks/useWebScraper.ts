import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ScrapedData {
  id: string;
  url: string;
  title: string;
  content: string;
  created_at: string;
}

export const useWebScraper = () => {
  const [scrapedData, setScrapedData] = useState<ScrapedData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchScrapedData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('training_documents')
        .select('*')
        .eq('file_type', 'web_scraped')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mapped = (data || []).map(item => ({
        id: item.id,
        url: item.filename,
        title: item.filename,
        content: item.extracted_content || '',
        created_at: item.created_at
      }));
      
      setScrapedData(mapped);
    } catch (error) {
      console.error('Error fetching scraped data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch scraped data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const scrapeUrl = useCallback(async (url: string) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('web-scraper', {
        body: { url }
      });

      if (error) throw error;

      // Save to training_documents
      const { data: savedData, error: saveError } = await supabase
        .from('training_documents')
        .insert({
          user_id: user.id,
          filename: url,
          file_type: 'web_scraped',
          file_size: data.content?.length || 0,
          file_path: url,
          extracted_content: data.content,
          processing_status: 'completed'
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setScrapedData(prev => [{
        id: savedData.id,
        url: url,
        title: data.title || url,
        content: data.content || '',
        created_at: savedData.created_at
      }, ...prev]);

      toast({
        title: "Success",
        description: "URL scraped successfully",
      });

      return savedData;
    } catch (error) {
      console.error('Error scraping URL:', error);
      toast({
        title: "Error",
        description: "Failed to scrape URL",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const deleteScrapedData = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('training_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setScrapedData(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "Success",
        description: "Scraped data deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting scraped data:', error);
      toast({
        title: "Error",
        description: "Failed to delete scraped data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    scrapedData,
    isLoading,
    fetchScrapedData,
    scrapeUrl,
    deleteScrapedData
  };
};
