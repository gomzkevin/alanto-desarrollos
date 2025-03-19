
import React from 'react';
import { Button } from '@/components/ui/button';
import ResourceDialog from './index';
import { ResourceType } from './types';

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
  defaultValues?: Record<string, any>; // Added defaultValues prop
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

  return (
    <>
      {/* Only render button if open is not controlled externally */}
      {open === undefined && (
        <Button 
          variant={buttonVariant} 
          onClick={handleOpen}
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
        defaultValues={defaultValues} // Pass defaultValues to ResourceDialog
      />
    </>
  );
};

export default AdminResourceDialog;
