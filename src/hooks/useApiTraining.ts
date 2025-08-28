
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ApiTrainingData {
  id: string;
  api_endpoint: string;
  api_method: string;
  api_headers: Record<string, string>;
  response_data?: any;
  training_context?: string;
  created_at: string;
}

interface ApiTestRequest {
  endpoint: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
}

export const useApiTraining = () => {
  const [apiData, setApiData] = useState<ApiTrainingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const { toast } = useToast();

  const handleError = (error: any, action: string) => {
    console.error(`Error in ${action}:`, error);
    
    let errorMessage = `Failed to ${action}`;
    if (error?.message) {
      errorMessage = error.message;
    }

    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const fetchApiData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setApiData([]);
        return;
      }

      // Since we might not have the api_training_data table, let's handle this gracefully
      const { data, error } = await supabase
        .from('api_training_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('API training data table might not exist yet');
        setApiData([]);
        return;
      }
      
      setApiData(data?.map(item => ({
        id: item.id,
        api_endpoint: item.api_endpoint,
        api_method: item.api_method,
        api_headers: item.api_headers as Record<string, string>,
        response_data: item.response_data,
        training_context: item.training_context,
        created_at: item.created_at
      })) || []);
    } catch (error) {
      console.log('Error fetching API data:', error);
      setApiData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const testApiEndpoint = useCallback(async (request: ApiTestRequest) => {
    setIsTestingApi(true);
    try {
      const response = await fetch(request.endpoint, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          ...request.headers
        },
        body: request.method !== 'GET' ? JSON.stringify(request.body) : undefined
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      
      toast({
        title: "API Test Successful",
        description: "API endpoint is working correctly",
      });

      return {
        success: true,
        data: responseData,
        status: response.status
      };
    } catch (error) {
      console.error('API test failed:', error);
      toast({
        title: "API Test Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    } finally {
      setIsTestingApi(false);
    }
  }, [toast]);

  const saveApiTrainingData = useCallback(async (
    endpoint: string,
    method: string,
    headers: Record<string, string>,
    responseData: any,
    context?: string
  ) => {
    setIsLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Try to save but handle if table doesn't exist
      const { data, error } = await supabase
        .from('api_training_data')
        .insert({
          user_id: user.id,
          api_endpoint: endpoint,
          api_method: method,
          api_headers: headers,
          response_data: responseData,
          training_context: context
        })
        .select()
        .single();

      if (error) {
        console.log('Could not save to api_training_data table:', error);
        toast({
          title: "Info",
          description: "API training data table needs to be set up first",
        });
        return;
      }

      const newData = {
        id: data.id,
        api_endpoint: data.api_endpoint,
        api_method: data.api_method,
        api_headers: data.api_headers as Record<string, string>,
        response_data: data.response_data,
        training_context: data.training_context,
        created_at: data.created_at
      };

      setApiData(prev => [newData, ...prev]);
      
      toast({
        title: "Success",
        description: "API training data saved successfully",
      });

      return data;
    } catch (error) {
      handleError(error, 'save API training data');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const deleteApiData = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('api_training_data')
        .delete()
        .eq('id', id);

      if (error) {
        console.log('Could not delete from api_training_data table:', error);
        return;
      }

      setApiData(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "Success",
        description: "API training data deleted successfully",
      });
    } catch (error) {
      handleError(error, 'delete API training data');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    apiData,
    isLoading,
    isTestingApi,
    fetchApiData,
    testApiEndpoint,
    saveApiTrainingData,
    deleteApiData
  };
};
