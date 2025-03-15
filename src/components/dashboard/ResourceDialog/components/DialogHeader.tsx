
import React from 'react';
import { 
  DialogHeader as UIDialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { ResourceType } from '../types';

interface DialogHeaderProps {
  resourceType: ResourceType;
  resourceId?: string;
  onClose: () => void;
}

export function DialogHeader({ resourceType, resourceId, onClose }: DialogHeaderProps) {
  const getResourceTitle = () => {
    // Convertir resourceType a singular y en español
    let resourceLabel = '';
    
    switch (resourceType) {
      case 'desarrollos':
        resourceLabel = 'desarrollo';
        break;
      case 'prototipos':
        resourceLabel = 'prototipo';
        break;
      case 'leads':
        resourceLabel = 'lead';
        break;
      case 'cotizaciones':
        resourceLabel = 'cotización';
        break;
      case 'unidades':
        resourceLabel = 'unidad';
        break;
    }
    
    return resourceLabel;
  };
  
  const resourceLabel = getResourceTitle();
  
  return (
    <UIDialogHeader>
      <DialogTitle>
        {resourceId ? `Editar ${resourceLabel}` : `Nuevo ${resourceLabel}`}
      </DialogTitle>
      <DialogDescription>
        {resourceId 
          ? `Actualiza la información de este ${resourceLabel}` 
          : `Completa el formulario para crear un nuevo ${resourceLabel}`}
      </DialogDescription>
    </UIDialogHeader>
  );
}
