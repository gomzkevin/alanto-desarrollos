
import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AdminResourceDialogProps, FormValues } from './types';
import DesarrolloForm from './DesarrolloForm';
import GenericForm from './GenericForm';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resource, setResource] = useState<FormValues | null>(null);
  const { toast } = useToast();
  
  const isOpen = open !== undefined ? open : dialogOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (onClose && !newOpen) {
      onClose();
    }
    setDialogOpen(newOpen);
  };

  // Cargar datos iniciales
  useEffect(() => {
    const fetchResource = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      
      try {
        if (resourceId) {
          // Cargar recurso existente
          let query;
          
          if (resourceType === 'desarrollos') {
            query = supabase.from('desarrollos').select('*').eq('id', resourceId).single();
          } else if (resourceType === 'prototipos') {
            query = supabase.from('prototipos').select('*').eq('id', resourceId).single();
          } else if (resourceType === 'leads') {
            query = supabase.from('leads').select('*').eq('id', resourceId).single();
          } else if (resourceType === 'cotizaciones') {
            query = supabase.from('cotizaciones').select('*').eq('id', resourceId).single();
          }
          
          const { data, error } = await query;
          if (error) throw error;
          
          if (resourceType === 'desarrollos' && data.amenidades) {
            // Convertir amenidades si es necesario
            try {
              if (typeof data.amenidades === 'string') {
                data.amenidades = JSON.parse(data.amenidades);
              }
            } catch (e) {
              console.error('Error parsing amenidades:', e);
              data.amenidades = [];
            }
          }
          
          setResource(data);
        } else {
          // Crear nuevo recurso con valores por defecto
          if (resourceType === 'desarrollos') {
            setResource({
              nombre: '',
              ubicacion: '',
              total_unidades: 0,
              unidades_disponibles: 0,
              avance_porcentaje: 0,
              descripcion: '',
              amenidades: [],
              moneda: 'MXN'
            });
          } else if (resourceType === 'prototipos' && desarrolloId) {
            setResource({
              desarrollo_id: desarrolloId,
              nombre: '',
              tipo: '',
              precio: 0,
              total_unidades: 0,
              unidades_disponibles: 0
            });
          } else if (resourceType === 'leads') {
            setResource({
              nombre: '',
              email: '',
              telefono: '',
              estado: 'nuevo',
              subestado: 'sin_contactar'
            });
          } else if (resourceType === 'cotizaciones') {
            setResource({
              lead_id: lead_id || '',
              desarrollo_id: '',
              prototipo_id: '',
              monto_anticipo: 0,
              numero_pagos: 0,
              usar_finiquito: false
            });
          }
        }
      } catch (error) {
        console.error('Error al cargar el recurso:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar la información del recurso',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResource();
  }, [isOpen, resourceId, resourceType, desarrolloId, lead_id, toast]);

  // Guardar recurso
  const saveResource = async (formData: FormValues) => {
    setIsSubmitting(true);
    
    try {
      let response;
      
      if (resourceId) {
        // Actualizar recurso existente
        if (resourceType === 'desarrollos') {
          // Asegurar que amenidades es un string JSON para guardar
          const dataToSave = { ...formData };
          if (dataToSave.amenidades && Array.isArray(dataToSave.amenidades)) {
            dataToSave.amenidades = JSON.stringify(dataToSave.amenidades);
          }
          
          response = await supabase.from('desarrollos').update(dataToSave).eq('id', resourceId);
        } else if (resourceType === 'prototipos') {
          response = await supabase.from('prototipos').update(formData).eq('id', resourceId);
        } else if (resourceType === 'leads') {
          response = await supabase.from('leads').update(formData).eq('id', resourceId);
        } else if (resourceType === 'cotizaciones') {
          response = await supabase.from('cotizaciones').update(formData).eq('id', resourceId);
        }
      } else {
        // Crear nuevo recurso
        if (resourceType === 'desarrollos') {
          // Asegurar que amenidades es un string JSON para guardar
          const dataToSave = { ...formData };
          if (dataToSave.amenidades && Array.isArray(dataToSave.amenidades)) {
            dataToSave.amenidades = JSON.stringify(dataToSave.amenidades);
          }
          
          response = await supabase.from('desarrollos').insert(dataToSave);
        } else if (resourceType === 'prototipos') {
          response = await supabase.from('prototipos').insert(formData);
        } else if (resourceType === 'leads') {
          response = await supabase.from('leads').insert(formData);
        } else if (resourceType === 'cotizaciones') {
          response = await supabase.from('cotizaciones').insert(formData);
        }
      }
      
      if (response.error) throw response.error;
      
      toast({
        title: 'Éxito',
        description: resourceId ? 'Recurso actualizado correctamente' : 'Recurso creado correctamente',
      });
      
      if (onSave) onSave();
      if (onSuccess) onSuccess();
      
      handleOpenChange(false);
    } catch (error) {
      console.error('Error al guardar el recurso:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el recurso',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
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
                  resource={resource}
                  setResource={setResource}
                  resourceId={resourceId}
                />
              ) : (
                <GenericForm
                  resource={resource}
                  setResource={setResource}
                  resourceType={resourceType}
                  resourceId={resourceId}
                  desarrolloId={desarrolloId}
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
