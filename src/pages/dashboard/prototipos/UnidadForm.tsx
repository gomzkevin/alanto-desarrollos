
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import SearchableEntitySelect from './components/SearchableEntitySelect';
import useVendedores from './hooks/useVendedores';
import FormInputs from './components/FormInputs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
      {/* Basic Information Fields */}
      <div className="space-y-2">
        <Label htmlFor="numero">Número *</Label>
        <Input
          id="numero"
          name="numero"
          value={formData.numero}
          onChange={handleChange}
          placeholder="Ej. A101"
          required
          disabled={isSubmitting}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="nivel">Nivel</Label>
        <Input
          id="nivel"
          name="nivel"
          value={formData.nivel}
          onChange={handleChange}
          placeholder="Ej. 1"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="estado">Estado *</Label>
        <Select 
          name="estado" 
          value={formData.estado} 
          onValueChange={(value) => handleChange({
            target: { name: 'estado', value }
          } as React.ChangeEvent<HTMLSelectElement>)}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="disponible">Disponible</SelectItem>
            <SelectItem value="apartado">Apartado</SelectItem>
            <SelectItem value="en_proceso">En Proceso</SelectItem>
            <SelectItem value="vendido">Vendido</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="precio_venta">Precio de Venta</Label>
        <Input
          id="precio_venta"
          name="precio_venta"
          value={formData.precio_venta}
          onChange={handleChange}
          placeholder="Ej. 1500000"
          type="number"
          min="0"
          step="1000"
          disabled={isSubmitting}
        />
      </div>
      
      {formData.estado !== 'disponible' && (
        <>
          <SearchableEntitySelect
            label="Comprador"
            entities={leads}
            value={formData.comprador_id}
            displayValue={formData.comprador_nombre}
            onSelect={handleLeadSelect}
            placeholder="Seleccionar comprador"
            disabled={isSubmitting}
          />
          
          <SearchableEntitySelect
            label="Vendedor"
            entities={vendedores}
            value={formData.vendedor_id}
            displayValue={formData.vendedor_nombre}
            onSelect={handleVendedorSelect}
            placeholder="Seleccionar vendedor"
            disabled={isSubmitting}
          />
          
          <div className="space-y-2">
            <Label className="block text-sm font-medium" htmlFor="fechaVenta">
              Fecha de Venta
            </Label>
            <Input
              type="date"
              id="fechaVenta"
              name="fecha_venta"
              value={formData.fecha_venta ? formData.fecha_venta.slice(0, 10) : ''}
              onChange={handleChange}
              className="w-full"
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
