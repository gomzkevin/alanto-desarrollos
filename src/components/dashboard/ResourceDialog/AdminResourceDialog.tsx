
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import ResourceDialog from './index';
import { ResourceType } from './types';
import { usePermissions } from '@/hooks/usePermissions';
import { useUserRole } from '@/hooks/useUserRole';

interface AdminResourceDialogProps {
  resourceType: ResourceType;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  onSuccess?: () => void;
  desarrolloId?: string;
  prototipo_id?: string;
  lead_id?: string;
  resourceId?: string;
  open?: boolean;
  onClose?: () => void;
  defaultValues?: Record<string, any>;
}

const AdminResourceDialog: React.FC<AdminResourceDialogProps> = ({
  resourceType,
  buttonText,
  buttonIcon,
  buttonVariant = 'default',
  onSuccess,
  desarrolloId,
  prototipo_id,
  lead_id,
  resourceId,
  open,
  onClose,
  defaultValues
}) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  
  const { isLoading: isUserLoading } = useUserRole();
  
  const { 
    canCreateDesarrollo, 
    canCreatePrototipo, 
    canCreateLead,
    canCreateCotizacion,
    canCreateUnidad,
    hasActiveSubscription
  } = usePermissions();

  // Update permissions loaded state
  useEffect(() => {
    // Check if subscription info is loaded asynchronously
    const checkPermissions = async () => {
      if (!isUserLoading) {
        await hasActiveSubscription();
        setPermissionsLoaded(true);
      }
    };
    
    checkPermissions();
  }, [isUserLoading, hasActiveSubscription]);

  // Check if button should be disabled based on resource type
  const isDisabled = React.useMemo(() => {
    // Always enable editing existing resources
    if (resourceId) return false;
    
    // If permissions aren't loaded yet, disable by default
    if (!permissionsLoaded) return true;
    
    if (resourceType === 'desarrollos') {
      return !canCreateDesarrollo();
    } else if (resourceType === 'prototipos') {
      return !canCreatePrototipo();
    } else if (resourceType === 'leads') {
      return !canCreateLead();
    } else if (resourceType === 'cotizaciones') {
      return !canCreateCotizacion();
    } else if (resourceType === 'unidades') {
      return !canCreateUnidad();
    }
    
    return false;
  }, [resourceType, resourceId, permissionsLoaded, canCreateDesarrollo, canCreatePrototipo, canCreateLead, canCreateCotizacion, canCreateUnidad]);

  const handleOpen = () => {
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    handleClose();
  };

  // Use provided open state if it exists, otherwise use internal state
  const isOpen = open !== undefined ? open : dialogOpen;

  // Log states for debugging
  console.log(`AdminResourceDialog for ${resourceType}:`, {
    permissionsLoaded,
    isDisabled,
    resourceId: resourceId || 'none'
  });

  return (
    <>
      {/* Only render button if open is not controlled externally */}
      {open === undefined && (
        <Button 
          variant={buttonVariant} 
          onClick={handleOpen}
          className="border-2 border-gray-200 shadow-sm hover:bg-indigo-600"
          disabled={isDisabled}
        >
          {buttonIcon}
          {buttonText || `Nuevo ${resourceType.slice(0, -1)}`}
        </Button>
      )}

      <ResourceDialog
        open={isOpen}
        onClose={handleClose}
        resourceType={resourceType}
        onSuccess={handleSuccess}
        desarrolloId={desarrolloId}
        prototipo_id={prototipo_id}
        lead_id={lead_id}
        resourceId={resourceId}
        defaultValues={defaultValues}
      />
    </>
  );
};

export default AdminResourceDialog;
