
import React from 'react';
import { Button } from '@/components/ui/button';
import ResourceDialog from './ResourceDialog';
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
  onClose
}) => {
  const [isOpen, setIsOpen] = React.useState(open || false);

  // Update internal state when open prop changes
  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
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

  return (
    <>
      {/* Only show button if open/onClose aren't provided as props */}
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
      />
    </>
  );
};

export default AdminResourceDialog;
