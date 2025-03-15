
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FormFields from './FormFields';
import { FormValues } from './types';
import { useEffect, useState } from 'react';

interface DesarrolloFormProps {
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
  resourceId?: string;
}

export default function DesarrolloForm({
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
  resourceId
}: DesarrolloFormProps) {
  const [activeTab, setActiveTab] = useState("general");
  
  return (
    <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-4 mb-4">
        <TabsTrigger value="general" className="text-center">General</TabsTrigger>
        <TabsTrigger value="amenidades" className="text-center">Amenidades</TabsTrigger>
        <TabsTrigger value="media" className="text-center">Media</TabsTrigger>
        <TabsTrigger value="financiero" className="text-center">Financiero</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general" className="space-y-4 pt-2">
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
          tabName="general"
          resourceId={resourceId}
          resourceType="desarrollos"
        />
      </TabsContent>
      
      <TabsContent value="amenidades" className="space-y-4 pt-2">
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
          tabName="amenidades"
          resourceId={resourceId}
          resourceType="desarrollos"
        />
      </TabsContent>
      
      <TabsContent value="media" className="space-y-4 pt-2">
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
          tabName="media"
          resourceId={resourceId}
          resourceType="desarrollos"
        />
      </TabsContent>
      
      <TabsContent value="financiero" className="space-y-4 pt-2">
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
          tabName="financiero"
          resourceId={resourceId}
          resourceType="desarrollos"
        />
      </TabsContent>
    </Tabs>
  );
}
