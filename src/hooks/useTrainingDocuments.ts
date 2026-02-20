import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TrainingDocument {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  file_path: string;
  processing_status: string;
  extracted_content?: string;
  created_at: string;
}

export const useTrainingDocuments = () => {
  const [documents, setDocuments] = useState<TrainingDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('training_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const uploadDocument = useCallback(async (file: File) => {
    setIsLoading(true);
    setUploadProgress(0);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('training-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save document metadata to database
      const { data, error } = await supabase
        .from('training_documents')
        .insert({
          user_id: user.id,
          filename: file.name,
          file_type: file.type,
          file_size: file.size,
          file_path: uploadData.path,
          processing_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setDocuments(prev => [data, ...prev]);
      
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      return data;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  }, [toast]);

  const deleteDocument = useCallback(async (id: string, filePath: string) => {
    setIsLoading(true);
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('training-documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error } = await supabase
        .from('training_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDocuments(prev => prev.filter(doc => doc.id !== id));
      
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    documents,
    isLoading,
    uploadProgress,
    fetchDocuments,
    uploadDocument,
    deleteDocument
  };
};