
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import SearchableEntitySelect from './components/SearchableEntitySelect';
import useVendedores from './hooks/useVendedores';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useUnidadForm from './hooks/useUnidadForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UnidadFormProps {
  unidad?: any;
  onSubmit: (data: any) => Promise<void>;
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
  const { toast } = useToast();
  
  // Estados locales del formulario
  const [submitting, setSubmitting] = useState(false);
  
  // Combinar estados de carga
  const isFormDisabled = isSubmitting || submitting;
  
  // Hook para el formulario
  const {
    formData,
    precioFormateado,
    isEditing,
    handleChange,
    handleSubmit: originalHandleSubmit,
    setFormData
  } = useUnidadForm({
    unidad,
    onSubmit: async (data) => {
      if (isFormDisabled) return;
      
      try {
        setSubmitting(true);
        
        // Registrar para debug
        console.log('Enviando formulario con datos:', data);
        
        // Enviar al servidor
        await onSubmit(data);
        
        // Mensaje de éxito
        toast({
          title: "Cambios guardados",
          description: `La unidad ${data.numero} ha sido ${isEditing ? 'actualizada' : 'creada'} correctamente.`
        });
      } catch (error) {
        console.error('Error al procesar el formulario:', error);
        toast({
          title: "Error",
          description: "No se pudieron guardar los cambios. Intente nuevamente.",
          variant: "destructive"
        });
      } finally {
        setSubmitting(false);
      }
    },
    onCancel
  });
  
  // Manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (isFormDisabled) return;
    originalHandleSubmit(e);
  };
  
  // Manejar selección de lead (comprador)
  const handleLeadSelect = (lead: any) => {
    if (!lead) return;
    
    setFormData(prev => ({
      ...prev,
      comprador_id: lead.id,
      comprador_nombre: lead.nombre
    }));
  };
  
  // Manejar selección de vendedor
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
      {isEditing && (
        <Alert className="bg-blue-50 border-blue-200 mb-4">
          <InfoIcon className="h-4 w-4 text-blue-500" />
          <AlertDescription>
            Al cambiar el estado de una unidad a "apartado" o "en proceso", se creará automáticamente una 
            venta en el sistema. Si asignas un comprador, se vinculará a la venta.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Campos del formulario */}
      <div className="space-y-2">
        <Label htmlFor="numero">Número *</Label>
        {isEditing ? (
          <Input
            id="numero"
            name="numero"
            value={formData.numero}
            readOnly
            disabled
            className="bg-gray-100 text-gray-800 cursor-not-allowed"
          />
        ) : (
          <Input
            id="numero"
            name="numero"
            value={formData.numero}
            onChange={handleChange}
            placeholder="Ej. A101"
            required
            disabled={isFormDisabled}
          />
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="nivel">Nivel</Label>
        <Input
          id="nivel"
          name="nivel"
          value={formData.nivel}
          onChange={handleChange}
          placeholder="Ej. 1"
          disabled={isFormDisabled}
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
          disabled={isFormDisabled}
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
        {(formData.estado === 'apartado' || formData.estado === 'en_proceso') && (
          <p className="text-xs text-blue-600 mt-1">
            Este estado creará una venta automáticamente.
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="precio_venta">Precio de Venta</Label>
        <Input
          id="precio_venta"
          name="precio_venta"
          value={precioFormateado}
          onChange={handleChange}
          placeholder="Ej. $1,500,000"
          className="font-medium"
          disabled={isFormDisabled}
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
            disabled={isFormDisabled}
          />
          
          <SearchableEntitySelect
            label="Vendedor"
            entities={vendedores}
            value={formData.vendedor_id}
            displayValue={formData.vendedor_nombre}
            onSelect={handleVendedorSelect}
            placeholder="Seleccionar vendedor"
            disabled={isFormDisabled}
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
              disabled={isFormDisabled}
            />
          </div>
        </>
      )}
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isFormDisabled}
        >
          Cancelar
        </Button>
        <Button 
          type="submit"
          disabled={!formData.numero || isFormDisabled}
        >
          {isFormDisabled ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
        </Button>
      </div>
    </form>
  );
};

export default UnidadForm;
