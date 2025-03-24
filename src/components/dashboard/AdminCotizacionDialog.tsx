
import React from 'react';
import { Button } from '@/components/ui/button';
import CotizacionDialog from './ResourceDialog/CotizacionDialog';
import { PlusCircle } from 'lucide-react';

interface AdminCotizacionDialogProps {
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  onSuccess?: () => void;
  desarrolloId?: string;
  lead_id?: string;
  resourceId?: string;
  open?: boolean;
  onClose?: () => void;
  defaultValues?: Record<string, any>;
}

const AdminCotizacionDialog: React.FC<AdminCotizacionDialogProps> = ({
  buttonText = "Nueva cotización",
  buttonIcon = <PlusCircle className="mr-2 h-4 w-4" />,
  buttonVariant = 'default',
  onSuccess,
  desarrolloId,
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
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4 py-2 shadow-md hover:shadow-lg transition-all duration-200"
        >
          {buttonIcon}
          {buttonText}
        </Button>
      )}

      <CotizacionDialog
        open={isOpen}
        onClose={handleClose}
        resourceId={resourceId}
        onSuccess={handleSuccess}
        desarrolloId={desarrolloId}
        lead_id={lead_id}
        defaultValues={defaultValues}
      />
    </>
  );
};

export default AdminCotizacionDialog;
