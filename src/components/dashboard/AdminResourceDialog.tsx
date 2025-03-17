import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil } from 'lucide-react';
import { AdminResourceDialogProps } from './ResourceDialog/types';
import { useResourceForm } from './ResourceDialog/hooks/useResourceForm';
import { useResourceFields } from './ResourceDialog/hooks/useResourceFields';
import { ResourceDialogContent } from './ResourceDialog/components/ResourceDialogContent';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminResourceDialog = ({
  open,
  onClose,
  resourceType,
  resourceId,
  onSave,
  buttonText = 'Editar',
  buttonIcon,
  buttonVariant = 'outline',
  onSuccess,
  desarrolloId,
  lead_id,
  prototipo_id,
  defaultValues
}: AdminResourceDialogProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [isExistingClient, setIsExistingClient] = useState(true);
  const [newClientData, setNewClientData] = useState({
    nombre: '',
    email: '',
    telefono: ''
  });
  
  const [selectedDesarrolloId, setSelectedDesarrolloId] = useState<string | undefined>(
    desarrolloId || undefined
  );
  
  const isOpen = open !== undefined ? open : dialogOpen;
  
  const handleOpenChange = (newOpen: boolean) => {
    if (onClose && !newOpen) {
      onClose();
    }
    setDialogOpen(newOpen);
  };

  console.log('AdminResourceDialog - open prop:', open);
  console.log('AdminResourceDialog - dialogOpen state:', dialogOpen);
  console.log('AdminResourceDialog - isOpen calculated:', isOpen);
  console.log('AdminResourceDialog - resourceType:', resourceType);
  console.log('AdminResourceDialog - resourceId:', resourceId);
  console.log('AdminResourceDialog - selectedDesarrolloId:', selectedDesarrolloId);

  const fields = useResourceFields(resourceType, selectedDesarrolloId);

  return (
    <>
      {open === undefined && (
        <Button
          variant={buttonVariant as any}
          size="sm"
          onClick={() => handleOpenChange(true)}
          type="button"
        >
          {buttonIcon || (resourceId ? <Pencil className="h-4 w-4 mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />)}
          {buttonText}
        </Button>
      )}
      
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <ResourceDialogContent
          isOpen={isOpen}
          onClose={() => handleOpenChange(false)}
          resourceType={resourceType}
          resourceId={resourceId}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          resource={resource}
          fields={fields}
          selectedAmenities={selectedAmenities}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
          handleSwitchChange={handleSwitchChange}
          handleLeadSelect={handleLeadSelect}
          handleAmenitiesChange={handleAmenitiesChange}
          saveResource={handleSave}
          desarrolloId={selectedDesarrolloId}
          prototipo_id={prototipo_id}
          lead_id={lead_id}
          handleImageUpload={handleImageUpload}
          uploading={uploading}
          isExistingClient={isExistingClient}
          onExistingClientChange={setIsExistingClient}
          newClientData={newClientData}
          onNewClientDataChange={handleNewClientDataChange}
          onDesarrolloSelect={handleDesarrolloSelect}
          handleDateChange={handleDateChange}
        />
      </Dialog>
    </>
  );
};

export default AdminResourceDialog;
