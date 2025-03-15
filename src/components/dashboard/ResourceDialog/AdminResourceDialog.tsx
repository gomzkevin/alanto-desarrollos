import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AdminResourceDialogProps, FormValues } from './types';
import useResourceData from './useResourceData';
import useResourceActions from './useResourceActions';
import DesarrolloForm from './DesarrolloForm';
import GenericForm from './GenericForm';

const AdminResourceDialog = ({ 
  open, 
  onClose, 
  resourceType, 
  resourceId, 
  onSave,
  buttonText,
  buttonIcon,
  buttonVariant = 'default',
  onSuccess,
  desarrolloId,
  lead_id
}: AdminResourceDialogProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDesarrolloId, setSelectedDesarrolloId] = useState<string | null>(desarrolloId || null);
  const [usarFiniquito, setUsarFiniquito] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  const isOpen = open !== undefined ? open : dialogOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (onClose && !newOpen) {
      onClose();
    }
    setDialogOpen(newOpen);
  };

  const resourceDataDeps = {
    resourceType,
    resourceId,
    desarrolloId,
    lead_id,
    selectedDesarrolloId,
    selectedStatus,
    usarFiniquito,
    selectedAmenities,
  };

  const { 
    resource, 
    setResource, 
    fields, 
    isLoading 
  } = useResourceData({
    ...resourceDataDeps,
    onStatusChange: setSelectedStatus,
    onAmenitiesChange: setSelectedAmenities
  });

  const resourceActionsDeps = {
    resourceType,
    resourceId, 
    desarrolloId,
    selectedAmenities
  };

  const {
    isSubmitting,
    uploading,
    handleImageUpload,
    saveResource
  } = useResourceActions({
    ...resourceActionsDeps,
    onClose: () => handleOpenChange(false),
    onSave,
    onSuccess
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (resource) {
      if (type === 'number') {
        setResource({ ...resource, [name]: value === '' ? '' : Number(value) } as FormValues);
      } else {
        setResource({ ...resource, [name]: value } as FormValues);
      }
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (resource) {
      setResource({ ...resource, [name]: value } as FormValues);
      
      if (name === 'desarrollo_id') {
        setSelectedDesarrolloId(value);
        if (resource) {
          setResource({ ...resource, prototipo_id: '' } as FormValues);
        }
      }
      
      if (name === 'estado') {
        setSelectedStatus(value);
        setResource({ ...resource, subestado: '' } as FormValues);
      }
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    if (resource) {
      console.log(`Switch ${name} changed to:`, checked);
      setResource({ ...resource, [name]: checked } as FormValues);
      
      if (name === 'usar_finiquito') {
        setUsarFiniquito(checked);
      }
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && resource) {
      setResource({ ...resource, ultimo_contacto: date.toISOString() } as FormValues);
    }
  };

  const handleAmenitiesChange = (amenities: string[]) => {
    setSelectedAmenities(amenities);
    if (resource && resourceType === 'desarrollos') {
      setResource({ 
        ...resource, 
        amenidades: amenities 
      } as FormValues);
    }
  };

  const renderTriggerButton = () => {
    if (open === undefined) {
      return (
        <Button onClick={() => setDialogOpen(true)} variant={buttonVariant as any}>
          {buttonIcon}
          {buttonText || 'Nuevo recurso'}
        </Button>
      );
    }
    return null;
  };

  return (
    <>
      {renderTriggerButton()}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {resourceId ? `Editar ${resourceType}` : `Crear nuevo ${resourceType}`}
            </DialogTitle>
            <DialogDescription>
              {resourceId ? 'Modifica los campos del recurso.' : 'Ingresa los datos del nuevo recurso.'}
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              {resourceType === 'desarrollos' ? (
                <DesarrolloForm
                  fields={fields}
                  resource={resource}
                  handleChange={handleChange}
                  handleSelectChange={handleSelectChange}
                  handleSwitchChange={handleSwitchChange}
                  handleDateChange={handleDateChange}
                  handleImageUpload={handleImageUpload}
                  handleAmenitiesChange={handleAmenitiesChange}
                  selectedDate={selectedDate}
                  uploading={uploading}
                  selectedAmenities={selectedAmenities}
                  resourceId={resourceId}
                />
              ) : (
                <GenericForm
                  fields={fields}
                  resource={resource}
                  handleChange={handleChange}
                  handleSelectChange={handleSelectChange}
                  handleSwitchChange={handleSwitchChange}
                  handleDateChange={handleDateChange}
                  handleImageUpload={handleImageUpload}
                  handleAmenitiesChange={handleAmenitiesChange}
                  selectedDate={selectedDate}
                  uploading={uploading}
                  selectedAmenities={selectedAmenities}
                  desarrolloId={desarrolloId}
                  resourceId={resourceId}
                  resourceType={resourceType}
                />
              )}
            </>
          )}

          <DialogFooter className="mt-6 flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              onClick={() => resource && saveResource(resource)} 
              disabled={isSubmitting || !resource}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminResourceDialog;
