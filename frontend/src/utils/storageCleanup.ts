import { supabase } from '@/integrations/supabase/client';

/**
 * Delete specific lovable uploaded files from storage
 * These are test/placeholder images that should be removed
 */
export const deleteUploadedScreenshots = async () => {
  const filesToDelete = [
    'lovable-uploads/28a7b1bf-3631-42ba-ab7e-d0557c2d9bae.png',
    'lovable-uploads/d6afa97d-dc19-4ce0-9426-ba291ed29f50.png',
    'lovable-uploads/fd5c2456-b137-4f5e-92b6-91e67819b497.png'
  ];

  const results = [];
  
  for (const filePath of filesToDelete) {
    try {
      // Extract bucket and path
      const [bucket, ...pathParts] = filePath.split('/');
      const path = pathParts.join('/');
      
      // Attempt to delete from public bucket
      const { error } = await supabase.storage
        .from('public')
        .remove([path]);

      if (error) {
        console.log(`Could not delete ${filePath}: ${error.message}`);
        results.push({ file: filePath, success: false, error: error.message });
      } else {
        console.log(`Successfully deleted ${filePath}`);
        results.push({ file: filePath, success: true });
      }
    } catch (error) {
      console.error(`Error deleting ${filePath}:`, error);
      results.push({ file: filePath, success: false, error: String(error) });
    }
  }

  return results;
};
