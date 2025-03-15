
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EditIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks';
import AdminResourceDialog from './ResourceDialog';

type Desarrollo = Tables<"desarrollos">;

interface DesarrolloEditButtonProps {
  desarrollo: Desarrollo;
  onSuccess: () => void;
}

const DesarrolloEditButton = ({ desarrollo, onSuccess }: DesarrolloEditButtonProps) => {
  const { isAdmin } = useUserRole();
  
  if (!isAdmin()) {
    return null;
  }
  
  return (
    <AdminResourceDialog 
      resourceType="desarrollos" 
      buttonText="Editar desarrollo" 
      buttonIcon={<EditIcon className="h-4 w-4 mr-2" />}
      buttonVariant="outline"
      resourceId={desarrollo.id}
      onSuccess={onSuccess}
    />
  );
};

export default DesarrolloEditButton;
