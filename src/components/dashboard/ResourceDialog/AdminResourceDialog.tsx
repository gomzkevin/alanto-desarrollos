import React, { useState, useEffect } from 'react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit } from 'lucide-react';
import { AdminResourceDialogProps, ResourceType, FormValues } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ResourceDialogContent } from './components/ResourceDialogContent';
import useResourceData from './useResourceData';
import useResourceActions from './useResourceActions';

const AdminResourceDialog: React.FC<AdminResourceDialogProps> = ({
  open,
  onClose,
  resourceType,
  resourceId,
  onSave,
  buttonText,
  buttonIcon = <PlusCircle className="mr-2 h-4 w-4" />,
  buttonVariant = 'default',
  onSuccess,
  desarrolloId,
  lead_id,
  prototipo_id,
  defaultValues
}) => {
  const [dialogOpen, setDialogOpen] = useState(open || false);
  const [usarFiniquito, setUsarFiniquito] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedDesarrolloId, setSelectedDesarrolloId] = useState<string | null>(desarrolloId || null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('general');

  const { resource, setResource, fields, isLoading } = useResourceData({
    resourceType,
    resourceId,
    desarrolloId,
    lead_id,
    selectedDesarrolloId,
    selectedStatus,
    usarFiniquito,
    selectedAmenities,
    onStatusChange: setSelectedStatus,
    onAmenitiesChange: setSelectedAmenities
  });

  const { isSubmitting, uploading, handleImageUpload, saveResource } = useResourceActions({
    resourceType,
    resourceId,
    desarrolloId,
    onClose: () => {
      setDialogOpen(false);
      if (onClose) onClose();
    },
    onSave,
    onSuccess,
    selectedAmenities
  });

  useEffect(() => {
    if (open !== undefined) {
      setDialogOpen(open);
    }
  }, [open]);

  useEffect(() => {
    if (desarrolloId) {
      setSelectedDesarrolloId(desarrolloId);
    }
  }, [desarrolloId]);

  const handleCloseDialog = () => {
    setDialogOpen(false);
    if (onClose) onClose();
  };

  const handleSubmit = async (values: FormValues) => {
    if (resourceType === 'desarrollos') {
      values.amenidades = selectedAmenities;
    }

    if (defaultValues) {
      values = { ...defaultValues, ...values };
    }

    if (resourceType === 'cotizaciones') {
      if (!values.lead_id && lead_id) {
        values.lead_id = lead_id;
      }

      if (!values.prototipo_id && prototipo_id) {
        values.prototipo_id = prototipo_id;
      }

      if (!usarFiniquito) {
        delete values.monto_finiquito;
      }
      
      values.usar_finiquito = usarFiniquito;
    }

    return await saveResource(values);
  };

  const hasTabsConfig = fields.some(field => field.tab);
  const tabsConfig = hasTabsConfig 
    ? [...new Set(fields.filter(f => f.tab).map(f => f.tab))] 
    : [];

  useEffect(() => {
    if (tabsConfig.length > 0 && tabsConfig[0]) {
      setActiveTab(tabsConfig[0]);
    }
  }, [tabsConfig]);

  const currentTabFields = hasTabsConfig 
    ? fields.filter(field => field.tab === activeTab)
    : fields;

  const TriggerButton = buttonText ? (
    <Button variant={buttonVariant as any}>
      {buttonIcon}
      {buttonText}
    </Button>
  ) : null;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {TriggerButton && <DialogTrigger asChild>{TriggerButton}</DialogTrigger>}
      
      {dialogOpen && (
        <ResourceDialogContent
          isOpen={dialogOpen}
          onClose={handleCloseDialog}
          resourceType={resourceType}
          resourceId={resourceId}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          resource={resource}
          fields={fields}
          selectedAmenities={selectedAmenities}
          handleChange={(e) => {
            const { name, value } = e.target;
            setResource(prev => ({ ...prev, [name]: value }));
          }}
          handleSelectChange={(name, value) => {
            setResource(prev => ({ ...prev, [name]: value }));
          }}
          handleSwitchChange={(name, checked) => {
            setResource(prev => ({ ...prev, [name]: checked }));
          }}
          handleAmenitiesChange={setSelectedAmenities}
          saveResource={handleSubmit}
          desarrolloId={desarrolloId}
          prototipo_id={prototipo_id}
          lead_id={lead_id}
          handleImageUpload={handleImageUpload}
          uploading={uploading}
          handleDateChange={(name, date) => {
            setResource(prev => ({ ...prev, [name]: date }));
          }}
        />
      )}
    </Dialog>
  );
};

export default AdminResourceDialog;
