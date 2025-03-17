import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface UnidadFormData {
  numero: string;
  nivel: string;
  estado: string;
  precio_venta: string | number;
  comprador_id: string;
  comprador_nombre: string;
  vendedor_id: string;
  vendedor_nombre: string;
  fecha_venta: string;
}

interface UnidadFormHookProps {
  unidad?: any;
  leads: any[];
  vendedores: any[];
}

export const useUnidadForm = ({ unidad, leads, vendedores }: UnidadFormHookProps) => {
  const [estado, setEstado] = useState(unidad?.estado || 'disponible');
  const [fechaVenta, setFechaVenta] = useState<Date | undefined>(
    unidad?.fecha_venta ? new Date(unidad.fecha_venta) : undefined
  );
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<UnidadFormData>({
    defaultValues: {
      numero: unidad?.numero || '',
      nivel: unidad?.nivel || '',
      estado: unidad?.estado || 'disponible',
      precio_venta: unidad?.precio_venta || '',
      comprador_id: unidad?.comprador_id || '',
      comprador_nombre: unidad?.comprador_nombre || '',
      vendedor_id: unidad?.vendedor_id || '',
      vendedor_nombre: unidad?.vendedor_nombre || '',
      fecha_venta: unidad?.fecha_venta || ''
    }
  });
  
  // Update form values when date changes
  useEffect(() => {
    if (fechaVenta) {
      setValue('fecha_venta', fechaVenta.toISOString());
    } else {
      setValue('fecha_venta', '');
    }
  }, [fechaVenta, setValue]);
  
  // Update estado in form when it changes
  useEffect(() => {
    setValue('estado', estado);
  }, [estado, setValue]);
  
  const handleLeadChange = (leadId: string, leadName?: string) => {
    if (leadId) {
      // If leadName is provided, use it
      if (leadName) {
        setValue('comprador_id', leadId);
        setValue('comprador_nombre', leadName);
      } else {
        // Otherwise find the lead by ID
        const selectedLead = leads.find(lead => lead.id === leadId);
        if (selectedLead) {
          setValue('comprador_id', selectedLead.id);
          setValue('comprador_nombre', selectedLead.nombre);
        }
      }
    } else {
      setValue('comprador_id', '');
      setValue('comprador_nombre', '');
    }
  };
  
  const handleVendedorChange = (vendedorId: string) => {
    const selectedVendedor = vendedores.find(v => v.id === vendedorId);
    if (selectedVendedor) {
      setValue('vendedor_id', selectedVendedor.id);
      setValue('vendedor_nombre', selectedVendedor.nombre);
    } else {
      setValue('vendedor_id', '');
      setValue('vendedor_nombre', '');
    }
  };
  
  const handleEstadoChange = (value: string) => {
    setEstado(value);
    setValue('estado', value);
  };
  
  const prepareFormData = (data: UnidadFormData) => {
    // Format data for submission
    return {
      ...data,
      precio_venta: data.precio_venta ? parseFloat(data.precio_venta.toString()) : null,
      fecha_venta: fechaVenta ? fechaVenta.toISOString() : null
    };
  };

  return {
    estado,
    fechaVenta,
    setFechaVenta,
    register,
    handleSubmit,
    watch,
    errors,
    handleLeadChange,
    handleVendedorChange,
    handleEstadoChange,
    prepareFormData
  };
};

export default useUnidadForm;
