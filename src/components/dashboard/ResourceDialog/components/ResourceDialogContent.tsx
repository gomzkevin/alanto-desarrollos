
import React from 'react';
import { DialogContent } from '@/components/ui/dialog';
import GenericForm from '../GenericForm';
import { DialogHeader } from './DialogHeader';
import { DialogFooter } from './DialogFooter';
import { FieldDefinition, FormValues, ResourceType } from '../types';

interface ResourceDialogContentProps {
  isOpen: boolean;
  onClose: () => void;
  resourceType: ResourceType;
  resourceId?: string;
  isLoading: boolean;
  isSubmitting: boolean;
  resource: FormValues | null;
  fields: FieldDefinition[];
  selectedAmenities: string[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleSwitchChange: (name: string, checked: boolean) => void;
  handleLeadSelect: (leadId: string, leadName: string) => void;
  handleAmenitiesChange: (amenities: string[]) => void;
  saveResource: () => void;
  desarrolloId?: string;
  prototipo_id?: string;
  lead_id?: string;
  handleImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading?: boolean;
}

export function ResourceDialogContent({
  isOpen,
  onClose,
  resourceType,
  resourceId,
  isLoading,
  isSubmitting,
  resource,
  fields,
  selectedAmenities,
  handleChange,
  handleSelectChange,
  handleSwitchChange,
  handleLeadSelect,
  handleAmenitiesChange,
  saveResource,
  desarrolloId,
  prototipo_id,
  lead_id,
  handleImageUpload,
  uploading
}: ResourceDialogContentProps) {
  if (!isOpen) return null;

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader 
        resourceType={resourceType} 
        resourceId={resourceId}
        onClose={onClose}
      />
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
        </div>
      ) : (
        <>
          <GenericForm
            fields={fields}
            resource={resource}
            handleChange={handleChange}
            handleSelectChange={handleSelectChange}
            handleSwitchChange={handleSwitchChange}
            resourceType={resourceType}
            resourceId={resourceId}
            handleAmenitiesChange={handleAmenitiesChange}
            selectedAmenities={selectedAmenities}
            desarrolloId={desarrolloId}
            prototipo_id={prototipo_id}
            lead_id={lead_id}
            handleLeadSelect={handleLeadSelect}
            handleImageUpload={handleImageUpload}
            uploading={uploading}
          />
          
          <DialogFooter
            onClose={onClose}
            onSave={saveResource}
            isSubmitting={isSubmitting}
            disabled={!resource}
          />
        </>
      )}
    </DialogContent>
  );
}
