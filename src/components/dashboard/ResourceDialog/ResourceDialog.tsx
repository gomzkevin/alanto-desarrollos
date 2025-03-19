
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ResourceDialogProps } from './types';
import { ResourceDialogContent } from './components/ResourceDialogContent';

const ResourceDialog: React.FC<ResourceDialogProps> = ({
  open = false,
  onClose,
  resourceType,
  resourceId,
  onSuccess,
  desarrolloId,
  lead_id,
  prototipo_id
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <ResourceDialogContent
          resourceType={resourceType}
          resourceId={resourceId}
          onSuccess={onSuccess}
          onCancel={onClose}
          desarrolloId={desarrolloId}
          lead_id={lead_id}
          prototipo_id={prototipo_id}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ResourceDialog;
