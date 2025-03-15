
import FormFields from './FormFields';
import { FormValues } from './types';

interface GenericFormProps {
  fields: any[];
  resource: FormValues | null;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleSwitchChange: (name: string, checked: boolean) => void;
  handleDateChange: (date: Date | undefined) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAmenitiesChange: (amenities: string[]) => void;
  selectedDate?: Date;
  uploading: boolean;
  selectedAmenities: string[];
  desarrolloId?: string;
  resourceId?: string;
  resourceType: string;
}

export default function GenericForm({
  fields,
  resource,
  handleChange,
  handleSelectChange,
  handleSwitchChange,
  handleDateChange,
  handleImageUpload,
  handleAmenitiesChange,
  selectedDate,
  uploading,
  selectedAmenities,
  desarrolloId,
  resourceId,
  resourceType
}: GenericFormProps) {
  return (
    <div className="grid gap-4 py-4">
      <FormFields
        fields={fields}
        resource={resource}
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
        handleSwitchChange={handleSwitchChange}
        handleDateChange={handleDateChange}
        handleImageUpload={handleImageUpload}
        handleAmenitiesChange={handleAmenitiesChange}
        selectedDate={selectedDate}
        uploading={uploading}
        selectedAmenities={selectedAmenities}
        desarrolloId={desarrolloId}
        resourceId={resourceId}
        resourceType={resourceType}
      />
    </div>
  );
}
