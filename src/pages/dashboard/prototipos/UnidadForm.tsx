
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import SearchableEntitySelect from './components/SearchableEntitySelect';
import useVendedores from './hooks/useVendedores';
import FormInputs from './components/FormInputs';

interface UnidadFormProps {
  unidad?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  leads: any[];
  isSubmitting?: boolean;
}

export const UnidadForm = ({ 
  unidad, 
  onSubmit, 
  onCancel, 
  leads,
  isSubmitting = false
}: UnidadFormProps) => {
  const { vendedores } = useVendedores();
  
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
  
  // Initialize form with unidad data if editing
  useEffect(() => {
    if (unidad) {
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
    }
  }, [unidad]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
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
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  // Handle lead selection
  const handleLeadSelect = (lead: any) => {
    if (!lead) return;
    
    setFormData(prev => ({
      ...prev,
      comprador_id: lead.id,
      comprador_nombre: lead.nombre
    }));
  };
  
  // Handle vendedor selection
  const handleVendedorSelect = (vendedor: any) => {
    if (!vendedor) return;
    
    setFormData(prev => ({
      ...prev,
      vendedor_id: vendedor.id,
      vendedor_nombre: vendedor.nombre
    }));
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInputs 
        formData={formData}
        onChange={handleChange}
      />
      
      {formData.estado !== 'disponible' && (
        <>
          <div className="space-y-2">
            <SearchableEntitySelect
              label="Comprador"
              entities={leads}
              value={formData.comprador_id}
              displayValue={formData.comprador_nombre}
              onSelect={handleLeadSelect}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <SearchableEntitySelect
              label="Vendedor"
              entities={vendedores}
              value={formData.vendedor_id}
              displayValue={formData.vendedor_nombre}
              onSelect={handleVendedorSelect}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium" htmlFor="fechaVenta">
              Fecha de Venta
            </label>
            <input
              type="date"
              id="fechaVenta"
              name="fecha_venta"
              value={formData.fecha_venta ? formData.fecha_venta.slice(0, 10) : ''}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              disabled={isSubmitting}
            />
          </div>
        </>
      )}
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button 
          type="submit"
          disabled={!formData.numero || isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : (unidad ? 'Actualizar' : 'Crear')}
        </Button>
      </div>
    </form>
  );
};

export default UnidadForm;
