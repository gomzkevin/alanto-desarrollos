
import { useState, useEffect, useCallback } from 'react';
import { formatCurrency } from '@/lib/utils';

interface UseUnidadFormProps {
  unidad?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const useUnidadForm = ({ unidad, onSubmit, onCancel }: UseUnidadFormProps) => {
  const isEditing = !!unidad;
  
  // Form state
  const [formData, setFormData] = useState({
    numero: '',
    nivel: '',
    estado: 'disponible',
    precio_venta: '',
    comprador_id: '',
    comprador_nombre: '',
    vendedor_id: '',
    vendedor_nombre: '',
    fecha_venta: ''
  });
  
  // State to track the formatted price display
  const [precioFormateado, setPrecioFormateado] = useState('');
  
  // Initialize form with unidad data if editing - with cleanup on unmount
  useEffect(() => {
    let isMounted = true;
    
    if (unidad && isMounted) {
      console.log("Setting form data from unidad:", unidad);
      // Set the raw form data
      setFormData({
        numero: unidad.numero || '',
        nivel: unidad.nivel || '',
        estado: unidad.estado || 'disponible',
        precio_venta: unidad.precio_venta || '',
        comprador_id: unidad.comprador_id || '',
        comprador_nombre: unidad.comprador_nombre || '',
        vendedor_id: unidad.vendedor_id || '',
        vendedor_nombre: unidad.vendedor_nombre || '',
        fecha_venta: unidad.fecha_venta || ''
      });
      
      // Format the price for display
      if (unidad.precio_venta && isMounted) {
        setPrecioFormateado(formatCurrency(unidad.precio_venta));
      }
    }
    
    return () => { isMounted = false; };
  }, [unidad]);
  
  // Handle input changes with stable callback
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log("Unidad form change:", name, value);
    
    // Special handling for precio_venta field to format the display
    if (name === 'precio_venta') {
      // Remove non-numeric characters for storing the raw value
      const numericValue = value.replace(/[^0-9]/g, '');
      
      // Update the form data with the numeric value
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
      
      // Format the value for display if it's not empty
      if (numericValue) {
        setPrecioFormateado(formatCurrency(Number(numericValue)));
      } else {
        setPrecioFormateado('');
      }
      return;
    }
    
    // Special handling for estado field to reset related fields when changed to 'disponible'
    if (name === 'estado' && value === 'disponible') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        comprador_id: '',
        comprador_nombre: '',
        vendedor_id: '',
        vendedor_nombre: '',
        fecha_venta: ''
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);
  
  // Handle form submission with stable callback
  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Submitting form data:", formData);
    
    // Prepare data to submit - handle empty date properly
    const dataToSubmit = {
      ...formData,
      // If fecha_venta is empty string, set to null for database compatibility
      fecha_venta: formData.fecha_venta || null
    };
    
    onSubmit(dataToSubmit);
  }, [formData, onSubmit]);
  
  return {
    formData,
    precioFormateado,
    isEditing,
    handleChange,
    handleSubmit,
    setPrecioFormateado,
    setFormData
  };
};

export default useUnidadForm;
