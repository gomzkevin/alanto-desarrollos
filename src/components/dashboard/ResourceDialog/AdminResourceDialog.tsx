
import React, { useState, useEffect } from 'react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit } from 'lucide-react';
import { AdminResourceDialogProps, ResourceType, FormValues } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import ResourceDialogContent from './components/ResourceDialogContent';
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

  // If open prop changes, update internal state
  useEffect(() => {
    if (open !== undefined) {
      setDialogOpen(open);
    }
  }, [open]);

  // Track desarrolloId changes
  useEffect(() => {
    if (desarrolloId) {
      setSelectedDesarrolloId(desarrolloId);
    }
  }, [desarrolloId]);

  // Handle close
  const handleCloseDialog = () => {
    setDialogOpen(false);
    if (onClose) onClose();
  };

  // Handle form submission
  const handleSubmit = async (values: FormValues) => {
    // For desarrollos, ensure amenities are included
    if (resourceType === 'desarrollos') {
      values.amenidades = selectedAmenities;
    }

    // Merge with default values if any
    if (defaultValues) {
      values = { ...defaultValues, ...values };
    }

    // Handle specific fields based on resource type
    if (resourceType === 'cotizaciones') {
      // Ensure lead_id is set if not in values and provided as prop
      if (!values.lead_id && lead_id) {
        values.lead_id = lead_id;
      }

      // Ensure prototipo_id is set if not in values and provided as prop
      if (!values.prototipo_id && prototipo_id) {
        values.prototipo_id = prototipo_id;
      }

      // If finiquito option is not used, remove monto_finiquito
      if (!usarFiniquito) {
        delete values.monto_finiquito;
      }
      
      values.usar_finiquito = usarFiniquito;
    }

    // Save the resource
    return await saveResource(values);
  };

  // Generate tabs for fields if any field has a tab property
  const hasTabsConfig = fields.some(field => field.tab);
  const tabsConfig = hasTabsConfig 
    ? [...new Set(fields.filter(f => f.tab).map(f => f.tab))] 
    : [];

  // Update active tab when tab configuration changes
  useEffect(() => {
    if (tabsConfig.length > 0 && tabsConfig[0]) {
      setActiveTab(tabsConfig[0]);
    }
  }, [tabsConfig]);

  // Filter fields by current active tab
  const currentTabFields = hasTabsConfig 
    ? fields.filter(field => field.tab === activeTab)
    : fields;

  // Button component to trigger the dialog
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
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          uploading={uploading}
          resourceType={resourceType}
          resourceId={resourceId}
          resource={resource}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          usarFiniquito={usarFiniquito}
          setUsarFiniquito={setUsarFiniquito}
          selectedDesarrolloId={selectedDesarrolloId}
          setSelectedDesarrolloId={setSelectedDesarrolloId}
          handleImageUpload={handleImageUpload}
          selectedAmenities={selectedAmenities}
          setSelectedAmenities={setSelectedAmenities}
          setResource={setResource}
        >
          {isLoading ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <>
              {hasTabsConfig && (
                <>
                  <Tabs 
                    defaultValue={tabsConfig[0]} 
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                      {tabsConfig.map(tab => (
                        <TabsTrigger key={tab} value={tab} className="capitalize">
                          {tab}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    <Separator className="my-4" />
                    
                    {tabsConfig.map(tab => (
                      <TabsContent key={tab} value={tab} className="space-y-4 py-2">
                        {currentTabFields.map((field, index) => (
                          <div key={`${field.name}-${index}`} className="space-y-1">
                            <div className="grid grid-cols-1 gap-4">
                              {field.name in (resource || {}) && field.type && (
                                <div className="space-y-1">
                                  {/* Field will be rendered by FormRenderer component */}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </TabsContent>
                    ))}
                  </Tabs>
                </>
              )}
            </>
          )}
        </ResourceDialogContent>
      )}
    </Dialog>
  );
};

export default AdminResourceDialog;
