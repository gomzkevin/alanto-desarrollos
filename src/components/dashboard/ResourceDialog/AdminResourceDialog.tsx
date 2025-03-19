
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
}

const AdminResourceDialog: React.FC<AdminResourceDialogProps> = ({
  resourceType,
  buttonText,
  buttonIcon,
  buttonVariant = 'default',
  onSuccess,
  desarrolloId,
  prototipo_id,
  lead_id
}) => {
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    handleClose();
  };

  return (
    <>
      <Button 
        variant={buttonVariant} 
        onClick={handleOpen}
      >
        {buttonIcon}
        {buttonText || `Nuevo ${resourceType.slice(0, -1)}`}
      </Button>

      <ResourceDialog
        open={open}
        onClose={handleClose}
        resourceType={resourceType}
        onSuccess={handleSuccess}
        desarrolloId={desarrolloId}
        prototipo_id={prototipo_id}
        lead_id={lead_id}
      />
    </>
  );
};

export default AdminResourceDialog;
