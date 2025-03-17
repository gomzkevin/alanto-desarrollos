
import { useState } from 'react';
import { FormValues } from '../types';

export const useFormHandlers = (
  resource: FormValues | null,
  setResource: React.Dispatch<React.SetStateAction<FormValues | null>>,
  setSelectedStatus: (status: string | null) => void,
  setUsarFiniquito: (checked: boolean) => void,
  setSelectedAmenities: (amenities: string[]) => void
) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | FormValues) => {
    if (!resource) return;

    if ('target' in e) {
      // It's an event
      const { name, value, type } = e.target;
      let updatedValue: any = value;
      
      if (type === 'number') {
        updatedValue = value === '' ? null : Number(value);
      }
      
      console.log(`Updating resource field ${name} with value:`, updatedValue);
      setResource({ ...resource, [name]: updatedValue });
    } else {
      // It's a direct values object
      console.log(`Updating resource with form values:`, e);
      setResource({ ...resource, ...e });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (!resource) return;
    
    if (name === 'estado' && resource.hasOwnProperty('subestado')) {
      setSelectedStatus(value);
    }
    
    console.log(`Updating resource select field ${name} with value:`, value);
    setResource({ ...resource, [name]: value });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    if (!resource) return;
    
    if (name === 'usar_finiquito') {
      setUsarFiniquito(checked);
    }
    
    console.log(`Updating resource switch field ${name} with value:`, checked);
    setResource({ ...resource, [name]: checked });
  };

  const handleAmenitiesChange = (amenities: string[]) => {
    if (!resource) return;
    
    setSelectedAmenities(amenities);
    console.log(`Updating amenities with:`, amenities);
    setResource({ ...resource, amenidades: amenities });
  };

  const handleLeadSelect = (leadId: string, leadName: string) => {
    if (!resource) return;
    
    // Si estamos en unidades, también guardamos el nombre para mostrar
    if (resource.hasOwnProperty('comprador_id')) {
      console.log(`Selected lead for unit: ${leadId} - ${leadName}`);
      setResource({ 
        ...resource, 
        comprador_id: leadId,
        comprador_nombre: leadName
      });
    } else {
      console.log(`Selected lead: ${leadId}`);
      setResource({ ...resource, lead_id: leadId });
    }
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (!resource) return;
    
    console.log(`Updating resource date field ${name} with value:`, date);
    setResource({ ...resource, [name]: date });
  };

  return {
    handleChange,
    handleSelectChange,
    handleSwitchChange,
    handleAmenitiesChange,
    handleLeadSelect,
    handleDateChange
  };
};
