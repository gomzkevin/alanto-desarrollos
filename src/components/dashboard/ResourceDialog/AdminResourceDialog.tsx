
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
  const [selectedDesarrolloId, setSelectedDesarrolloId] = useState<string>(desarrolloId || '');
  
  const isOpen = open !== undefined ? open : dialogOpen;
  
  const handleOpenChange = (newOpen: boolean) => {
    if (onClose && !newOpen) {
      onClose();
    }
    setDialogOpen(newOpen);
  };

  const fields = useResourceFields(resourceType);

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
    desarrolloId: selectedDesarrolloId || desarrolloId,
    lead_id,
    prototipo_id,
    defaultValues,
    onSuccess,
    onSave
  });

  // Update selectedDesarrolloId when resource changes
  useEffect(() => {
    if (resource && resourceType === 'cotizaciones') {
      const cotizacionData = resource as any;
      if (cotizacionData.desarrollo_id) {
        setSelectedDesarrolloId(cotizacionData.desarrollo_id);
      }
    }
  }, [resource, resourceType]);

  // Custom function to handle desarrollo selection
  const handleDesarrolloSelect = (desarrolloId: string) => {
    setSelectedDesarrolloId(desarrolloId);
    if (resource) {
      // Update resource with new desarrollo_id
      const updatedResource = {
        ...resource,
        desarrollo_id: desarrolloId,
        // Reset prototipo_id when desarrollo changes
        prototipo_id: ''
      };
      setResource(updatedResource);
    }
  };

  const handleSave = async () => {
    if (resource) {
      if (resourceType === 'cotizaciones') {
        const cotizacionData = resource as any;
        
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
        saveResource(resource).then(success => {
          if (success) {
            handleOpenChange(false);
          }
        });
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      const hasLeadId = lead_id || (resource && (resource as any).lead_id);
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
          desarrolloId={selectedDesarrolloId || desarrolloId}
          prototipo_id={prototipo_id}
          lead_id={lead_id}
          handleImageUpload={handleImageUpload}
          uploading={uploading}
          isExistingClient={isExistingClient}
          onExistingClientChange={setIsExistingClient}
          newClientData={newClientData}
          onNewClientDataChange={handleNewClientDataChange}
          onDesarrolloSelect={handleDesarrolloSelect}
        />
      </Dialog>
    </>
  );
};

export default AdminResourceDialog;
