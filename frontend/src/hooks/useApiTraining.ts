
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

  const handleError = useCallback((error: any, operation: string) => {
    console.error(`❌ ${operation} failed:`, error);
    
    let errorMessage = `Failed to ${operation.toLowerCase()}`;
    
    if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
    
    return { success: false, error: errorMessage };
  }, [toast]);

  const fetchApiData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('api_training_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      const formattedData = (data || []).map(item => ({
        id: item.id,
        api_endpoint: item.api_endpoint,
        api_method: item.api_method,
        api_headers: item.api_headers as Record<string, string>,
        response_data: item.response_data,
        training_context: item.training_context,
        created_at: item.created_at
      }));

      setApiData(formattedData);
      console.log(`✅ Fetched ${formattedData.length} API training records`);
      
    } catch (error) {
      handleError(error, 'Fetch API training data');
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const testApiEndpoint = useCallback(async (request: ApiTestRequest) => {
    setIsTestingApi(true);
    try {
      // Input validation
      if (!request.endpoint || !request.method) {
        throw new Error('API endpoint and method are required');
      }

      // Validate URL format
      try {
        new URL(request.endpoint);
      } catch {
        throw new Error('Invalid API endpoint URL format');
      }

      console.log(`🔄 Testing API: ${request.method} ${request.endpoint}`);

      const response = await fetch(request.endpoint, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          ...request.headers
        },
        body: request.method !== 'GET' && request.body ? JSON.stringify(request.body) : undefined
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json().catch(() => null);
      
      console.log(`✅ API test successful: ${response.status}`);
      
      toast({
        title: "API Test Successful",
        description: `API endpoint returned ${response.status}`,
      });

      return {
        success: true,
        data: responseData,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error) {
      console.error('❌ API test failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      toast({
        title: "API Test Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return {
        success: false,
        error: errorMessage
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
      // Input validation
      if (!endpoint || !method) {
        throw new Error('API endpoint and method are required');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated. Please log in to save API training data.');
      }

      console.log(`💾 Saving API training data: ${method} ${endpoint}`);

      const { data, error } = await supabase
        .from('api_training_data')
        .insert({
          user_id: user.id,
          api_endpoint: endpoint,
          api_method: method,
          api_headers: headers || {},
          response_data: responseData,
          training_context: context
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
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
      
      console.log(`✅ API training data saved: ${data.id}`);
      
      toast({
        title: "Success",
        description: "API training data saved successfully",
      });

      return data;
    } catch (error) {
      handleError(error, 'Save API training data');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, toast]);

  const deleteApiData = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      if (!id) {
        throw new Error('API training data ID is required');
      }

      console.log(`🗑️ Deleting API training data: ${id}`);

      const { error } = await supabase
        .from('api_training_data')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      setApiData(prev => prev.filter(item => item.id !== id));
      
      console.log(`✅ API training data deleted: ${id}`);
      
      toast({
        title: "Success",
        description: "API training data deleted successfully",
      });
    } catch (error) {
      handleError(error, 'Delete API training data');
    } finally {
      setIsLoading(false);
    }
  }, [handleError, toast]);

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
