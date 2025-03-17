
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

  // Get fields for the resource type
  const fields = useResourceFields(resourceType, selectedDesarrolloId);

  // Use the resource form hook to get all the necessary handlers and state
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
    setResource,
    handleDateChange
  } = useResourceForm({
    resourceType,
    resourceId,
    desarrolloId: selectedDesarrolloId,
    lead_id,
    prototipo_id,
    defaultValues,
    onSuccess,
    onSave
  });

  // Set the desarrollo_id from the resource only once after initial load
  useEffect(() => {
    if (resource && !selectedDesarrolloId) {
      const resourceAny = resource as any;
      if (resourceAny.desarrollo_id) {
        setSelectedDesarrolloId(resourceAny.desarrollo_id);
      }
    }
  }, [resource, selectedDesarrolloId]);

  const handleDesarrolloSelect = (desarrolloId: string) => {
    setSelectedDesarrolloId(desarrolloId);
    
    if (resource) {
      const updatedResource = {
        ...resource,
        desarrollo_id: desarrolloId,
        prototipo_id: ''
      };
      setResource(updatedResource);
    }
  };

  const handleSave = async () => {
    if (resource) {
      const resourceAny = resource as any;
      
      if (resourceType === 'cotizaciones') {
        const cotizacionData = resourceAny;
        
        if (!isExistingClient && !resourceId) {
          if (!newClientData.nombre) {
            toast({
              title: 'Error',
              description: 'El nombre del cliente es obligatorio',
              variant: 'destructive',
            });
            return;
          }
        } else if (isExistingClient && !cotizacionData.lead_id) {
          toast({
            title: 'Error',
            description: 'Debe seleccionar un cliente',
            variant: 'destructive',
          });
          return;
        }
        
        if (!cotizacionData.desarrollo_id) {
          toast({
            title: 'Error',
            description: 'Debe seleccionar un desarrollo',
            variant: 'destructive',
          });
          return;
        }
        
        if (!cotizacionData.prototipo_id) {
          toast({
            title: 'Error',
            description: 'Debe seleccionar un prototipo',
            variant: 'destructive',
          });
          return;
        }
      }
      
      if (!isExistingClient && resourceType === 'cotizaciones' && !resourceId) {
        try {
          if (!newClientData.nombre) {
            toast({
              title: 'Error',
              description: 'El nombre del cliente es obligatorio',
              variant: 'destructive',
            });
            return;
          }
          
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
          
          if (newLead) {
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
        console.log('Saving resource with data:', resource);
        saveResource(resource).then(success => {
          if (success) {
            handleOpenChange(false);
          }
        });
      }
    } else {
      toast({
        title: 'Error',
        description: 'No hay datos para guardar',
        variant: 'destructive',
      });
    }
  };

  // Reset client data when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      const resourceAny = resource as any;
      const hasLeadId = lead_id || (resource && resourceAny && resourceAny.lead_id);
      setIsExistingClient(!!hasLeadId);
    } else {
      setNewClientData({
        nombre: '',
        email: '',
        telefono: ''
      });
    }
  }, [isOpen, lead_id, resource]);

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

  const handleNewClientDataChange = (field: string, value: string) => {
    setNewClientData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
