
import { useState, useEffect } from 'react';

interface UseUnidadFormProps {
  unidad?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export const useUnidadForm = ({ unidad, onSubmit, onCancel }: UseUnidadFormProps) => {
  const isEditing = !!unidad;
  
  // Form state - inicializado con valores por defecto
  const [formData, setFormData] = useState({
    numero: '',
    nivel: '',
    estado: 'disponible'
  });
  
  // Inicializar el formulario con los datos de la unidad cuando está en modo edición
  useEffect(() => {
    if (unidad) {
      console.log("Inicializando formulario con datos:", unidad);
      
      // Actualizar el estado del formulario
      setFormData({
        numero: unidad.numero || '',
        nivel: unidad.nivel || '',
        estado: unidad.estado || 'disponible'
      });
    }
  }, [unidad]);
  
  // Manejar cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Actualización normal para campos
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      // Preparar datos para enviar
      const dataToSubmit = {
        ...formData
      };
      
      console.log("Enviando datos del formulario:", dataToSubmit);
      
      // Llamar a la función onSubmit proporcionada
      await onSubmit(dataToSubmit);
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
    }
  };
  
  return {
    formData,
    isEditing,
    handleChange,
    handleSubmit,
    setFormData
  };
};

export default useUnidadForm;
