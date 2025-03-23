
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseTableHelpers = () => {
  /**
   * Checks if a specific column exists in a Supabase table
   */
  const hasColumn = async (tableName: string, columnName: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('has_column', {
        table_name: tableName,
        column_name: columnName
      });
      
      if (error) {
        console.error(`Error checking for column ${columnName} in table ${tableName}:`, error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error(`Error in hasColumn for ${tableName}.${columnName}:`, error);
      return false;
    }
  };
  
  return {
    hasColumn
  };
};

export default useSupabaseTableHelpers;
