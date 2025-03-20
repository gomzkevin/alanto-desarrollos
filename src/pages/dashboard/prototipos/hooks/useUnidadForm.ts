
import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';

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
    estado: 'disponible',
    precio_venta: '',
    comprador_id: '',
    comprador_nombre: '',
    vendedor_id: '',
    vendedor_nombre: '',
    fecha_venta: ''
  });
  
  // Estado para el precio formateado (visual)
  const [precioFormateado, setPrecioFormateado] = useState('');
  // Estado para controlar el envío del formulario
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Inicializar el formulario con los datos de la unidad cuando está en modo edición
  useEffect(() => {
    if (unidad) {
      console.log("Inicializando formulario con datos:", unidad);
      
      // Actualizar el estado del formulario
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
      
      // Formatear el precio para visualización
      if (unidad.precio_venta) {
        setPrecioFormateado(formatCurrency(unidad.precio_venta));
      }
    }
  }, [unidad]);
  
  // Manejar cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Caso especial para precio_venta: formatear para visualización
    if (name === 'precio_venta') {
      // Remover caracteres no numéricos para almacenar solo el valor
      const numericValue = value.replace(/[^0-9]/g, '');
      
      // Actualizar el estado del formulario con el valor numérico
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
      
      // Formatear el valor para visualización
      if (numericValue) {
        setPrecioFormateado(formatCurrency(Number(numericValue)));
      } else {
        setPrecioFormateado('');
      }
      return;
    }
    
    // Caso especial: Si el estado cambia a disponible, resetear campos relacionados
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
    
    // Actualización normal para otros campos
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Preparar datos para enviar
      const dataToSubmit = {
        ...formData,
        // Si fecha_venta es vacío, establecer a null para compatibilidad con la base de datos
        fecha_venta: formData.fecha_venta || null
      };
      
      console.log("Enviando datos del formulario:", dataToSubmit);
      
      // Llamar a la función onSubmit proporcionada
      await onSubmit(dataToSubmit);
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    formData,
    precioFormateado,
    isEditing,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFormData
  };
};

export default useUnidadForm;
