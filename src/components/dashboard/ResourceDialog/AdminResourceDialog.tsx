
import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil } from 'lucide-react';
import { AdminResourceDialogProps } from './types';
import { useResourceForm } from './hooks/useResourceForm';
import { useResourceFields } from './hooks/useResourceFields';
import { ResourceDialogContent } from './components/ResourceDialogContent';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDesarrolloStats } from '@/hooks';

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

  const fields = useResourceFields(resourceType);

  // Filter out the image-upload field for prototipos
  const filteredFields = resourceType === 'prototipos' ? 
    fields.filter(field => field.type !== 'image-upload') : 
    fields;

  const { data: desarrolloStats } = useDesarrolloStats(
    resourceType === 'desarrollos' && resourceId ? resourceId : undefined
  );

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

  useEffect(() => {
    if (resource && !selectedDesarrolloId) {
      const resourceAny = resource as any;
      if (resourceAny.desarrollo_id) {
        setSelectedDesarrolloId(resourceAny.desarrollo_id);
      }
    }
  }, [resource, selectedDesarrolloId]);

  useEffect(() => {
    if (resource && resourceType === 'desarrollos' && desarrolloStats) {
      setResource({
        ...resource,
        unidades_disponibles: desarrolloStats.unidadesDisponibles,
        avance_porcentaje: desarrolloStats.avanceComercial
      });
    }
  }, [desarrolloStats, resource, resourceType, setResource]);

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

  const handleSave = async (): Promise<boolean> => {
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
            return false;
          }
        } else if (isExistingClient && !cotizacionData.lead_id) {
          toast({
            title: 'Error',
            description: 'Debe seleccionar un cliente',
            variant: 'destructive',
          });
          return false;
        }
        
        if (!cotizacionData.desarrollo_id) {
          toast({
            title: 'Error',
            description: 'Debe seleccionar un desarrollo',
            variant: 'destructive',
          });
          return false;
        }
        
        if (!cotizacionData.prototipo_id) {
          toast({
            title: 'Error',
            description: 'Debe seleccionar un prototipo',
            variant: 'destructive',
          });
          return false;
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
            return false;
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
            
            const success = await saveResource(updatedResource);
            if (success) {
              handleOpenChange(false);
            }
            return success;
          }
          return false;
        } catch (error: any) {
          console.error('Error creando nuevo lead:', error);
          toast({
            title: 'Error',
            description: `No se pudo crear el nuevo cliente: ${error.message}`,
            variant: 'destructive',
          });
          return false;
        }
      } else {
        const success = await saveResource(resource);
        if (success) {
          handleOpenChange(false);
          if (onSuccess) {
            onSuccess();
          }
        }
        return success;
      }
    }
    return false;
  };

  useEffect(() => {
    if (isOpen) {
      const resourceAny = resource as any;
      const hasLeadId = lead_id || (resource && resourceAny.lead_id);
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
          fields={filteredFields}
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
