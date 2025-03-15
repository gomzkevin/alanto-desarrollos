
import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AdminResourceDialogProps } from './types';
import { useResourceForm } from './hooks/useResourceForm';
import { useResourceFields } from './hooks/useResourceFields';
import { ResourceDialogContent } from './components/ResourceDialogContent';
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
  
  // Control de estado del diálogo
  const isOpen = open !== undefined ? open : dialogOpen;
  
  const handleOpenChange = (newOpen: boolean) => {
    if (onClose && !newOpen) {
      onClose();
    }
    setDialogOpen(newOpen);
  };

  // Get form fields based on resource type
  const fields = useResourceFields(resourceType);

  // Use resource form hook
  const {
    isLoading,
    isSubmitting,
    resource,
    selectedAmenities,
    handleChange,
    handleSelectChange,
    handleSwitchChange,
    handleLeadSelect,
    handleAmenitiesChange,
    saveResource,
    setResource
  } = useResourceForm({
    resourceType,
    resourceId,
    desarrolloId,
    lead_id,
    prototipo_id,
    defaultValues,
    onSuccess,
    onSave
  });

  // Handler for save button
  const handleSave = async () => {
    if (resource) {
      // Si no es un cliente existente y estamos creando una cotización, crear el lead primero
      if (!isExistingClient && resourceType === 'cotizaciones' && !resourceId) {
        try {
          // Crear nuevo lead
          const { data: newLead, error: leadError } = await supabase
            .from('leads')
            .insert({
              nombre: newClientData.nombre,
              email: newClientData.email,
              telefono: newClientData.telefono,
              estado: 'nuevo',
              subestado: 'sin_contactar'
            })
            .select('id, nombre')
            .single();
          
          if (leadError) throw leadError;
          
          // Actualizar el resource con el ID del nuevo lead
          if (newLead) {
            setResource({
              ...resource,
              lead_id: newLead.id
            });
            
            // Guardar la cotización con el nuevo lead
            const updatedResource = {
              ...resource,
              lead_id: newLead.id
            };
            
            saveResource(updatedResource).then(success => {
              if (success) {
                handleOpenChange(false);
              }
            });
          }
        } catch (error: any) {
          console.error('Error creando nuevo lead:', error);
          toast({
            title: 'Error',
            description: `No se pudo crear el nuevo cliente: ${error.message}`,
            variant: 'destructive',
          });
        }
      } else {
        // Flujo normal para clientes existentes o recursos que no son cotizaciones
        saveResource(resource).then(success => {
          if (success) {
            handleOpenChange(false);
          }
        });
      }
    }
  };
  
  // Reset client type when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      // Si hay un lead_id proporcionado o en el recurso, establecer como cliente existente
      const hasLeadId = lead_id || (resource && (resource as any).lead_id);
      setIsExistingClient(!!hasLeadId);
    } else {
      // Resetear al cerrar
      setNewClientData({
        nombre: '',
        email: '',
        telefono: ''
      });
    }
  }, [isOpen, lead_id, resource]);

  // Handler for image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${resourceType}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    try {
      const { data, error } = await supabase.storage
        .from('desarrollo-images')
        .upload(fileName, file);
      
      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('desarrollo-images')
        .getPublicUrl(fileName);
      
      if (resource) {
        setResource({
          ...resource,
          imagen_url: urlData.publicUrl
        });
      }
      
      toast({
        title: 'Imagen subida',
        description: 'La imagen ha sido subida correctamente',
      });
    } catch (error: any) {
      console.error('Error subiendo imagen:', error);
      toast({
        title: 'Error',
        description: `No se pudo subir la imagen: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  // Handler for change in new client data
  const handleNewClientDataChange = (field: string, value: string) => {
    setNewClientData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  return (
    <>
      {/* Botón para abrir el diálogo si no se proporciona 'open' */}
      {open === undefined && (
        <Button
          variant={buttonVariant as any}
          size="sm"
          onClick={() => handleOpenChange(true)}
          type="button"
        >
          {buttonIcon || <PlusCircle className="h-4 w-4 mr-2" />}
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
          desarrolloId={desarrolloId}
          prototipo_id={prototipo_id}
          lead_id={lead_id}
          handleImageUpload={handleImageUpload}
          uploading={uploading}
          isExistingClient={isExistingClient}
          onExistingClientChange={setIsExistingClient}
          newClientData={newClientData}
          onNewClientDataChange={handleNewClientDataChange}
        />
      </Dialog>
    </>
  );
};

export default AdminResourceDialog;
