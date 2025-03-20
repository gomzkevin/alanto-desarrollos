
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import SearchableEntitySelect from './components/SearchableEntitySelect';
import useVendedores from './hooks/useVendedores';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useUnidadForm from './hooks/useUnidadForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showRedirectAlert, setShowRedirectAlert] = useState(false);
  const [ventaId, setVentaId] = useState<string | null>(null);
  const [isSubmittingInternal, setIsSubmittingInternal] = useState(false);
  
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
      try {
        setIsSubmittingInternal(true);
        
        // Si estamos editando y cambiando a un estado que genera venta
        const creatingVenta = isEditing && 
          unidad?.estado === 'disponible' && 
          (data.estado === 'apartado' || data.estado === 'en_proceso');
        
        console.log('Submitting unidad data:', data);
        console.log('Original unidad estado:', unidad?.estado);
        console.log('New unidad estado:', data.estado);
        console.log('Will create venta?', creatingVenta);
        
        // Primero dejamos que se complete la actualización de la unidad
        await onSubmit(data);
        
        toast({
          title: "Unidad actualizada",
          description: `La unidad ${data.numero} ha sido actualizada correctamente.`
        });
        
        // Si se creará una venta, consultamos para obtener su ID
        if (creatingVenta) {
          console.log('Checking for created venta for unidad:', unidad?.id);
          // Esperamos un momento para que el trigger de Supabase tenga tiempo de ejecutarse
          setTimeout(async () => {
            try {
              const { data: ventaData, error } = await supabase
                .from('ventas')
                .select('id')
                .eq('unidad_id', unidad.id)
                .limit(1)
                .single();
              
              if (error) {
                console.error('Error al buscar la venta creada:', error);
                setIsSubmittingInternal(false);
                return;
              }
              
              console.log('Found venta data:', ventaData);
              
              if (ventaData) {
                setVentaId(ventaData.id);
                setShowRedirectAlert(true);
              }
              setIsSubmittingInternal(false);
            } catch (error) {
              console.error('Error al buscar la venta creada:', error);
              setIsSubmittingInternal(false);
            }
          }, 1500); // Esperar para que el trigger de Supabase tenga tiempo
        } else {
          setIsSubmittingInternal(false);
        }
      } catch (error) {
        console.error('Error en el procesamiento del formulario:', error);
        toast({
          title: "Error",
          description: "No se pudo actualizar la unidad. Intente nuevamente.",
          variant: "destructive"
        });
        setIsSubmittingInternal(false);
      }
    }, 
    onCancel 
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isSubmittingInternal) return;
    
    // Registrar el estado previo y nuevo para debugging
    console.log('Form submission - Current estado:', unidad?.estado);
    console.log('Form submission - New estado:', formData.estado);
    
    originalHandleSubmit(e);
  };
  
  // Manejo de redirección a la venta
  const handleRedirectToVenta = () => {
    if (ventaId) {
      navigate(`/dashboard/ventas/${ventaId}`);
    }
  };
  
  // Handle lead selection - cleanup to prevent stale references
  const handleLeadSelect = React.useCallback((lead: any) => {
    if (!lead) return;
    
    setFormData(prev => ({
      ...prev,
      comprador_id: lead.id,
      comprador_nombre: lead.nombre
    }));
  }, [setFormData]);
  
  // Handle vendedor selection - cleanup to prevent stale references
  const handleVendedorSelect = React.useCallback((vendedor: any) => {
    if (!vendedor) return;
    
    setFormData(prev => ({
      ...prev,
      vendedor_id: vendedor.id,
      vendedor_nombre: vendedor.nombre
    }));
  }, [setFormData]);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Alerta de redirección a ventas */}
      {showRedirectAlert && ventaId && (
        <Alert className="bg-green-50 border-green-200 mb-4">
          <InfoIcon className="h-4 w-4 text-green-500" />
          <AlertDescription className="flex justify-between items-center">
            <span>¡Se ha creado una venta! ¿Deseas ir a la página de detalle para completar la información?</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2 border-green-500 text-green-600 hover:bg-green-100"
              onClick={handleRedirectToVenta}
            >
              Ir a la venta
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isEditing && (
        <Alert className="bg-blue-50 border-blue-200 mb-4">
          <InfoIcon className="h-4 w-4 text-blue-500" />
          <AlertDescription>
            Al cambiar el estado de una unidad a "apartado" o "en proceso", se creará automáticamente una 
            venta en el sistema. Si asignas un comprador, se vinculará a la venta.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Basic Information Fields */}
      <div className="space-y-2">
        <Label htmlFor="numero">Número *</Label>
        {isEditing ? (
          // Read-only input for editing existing units - applying proper read-only styling
          <Input
            id="numero"
            name="numero"
            value={formData.numero}
            readOnly
            disabled
            className="bg-gray-100 text-gray-800 cursor-not-allowed"
          />
        ) : (
          // Editable input for new units
          <Input
            id="numero"
            name="numero"
            value={formData.numero}
            onChange={handleChange}
            placeholder="Ej. A101"
            required
            disabled={isSubmitting || isSubmittingInternal}
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
          disabled={isSubmitting || isSubmittingInternal}
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
          disabled={isSubmitting || isSubmittingInternal}
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
          disabled={isSubmitting || isSubmittingInternal}
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
            disabled={isSubmitting || isSubmittingInternal}
          />
          
          <SearchableEntitySelect
            label="Vendedor"
            entities={vendedores}
            value={formData.vendedor_id}
            displayValue={formData.vendedor_nombre}
            onSelect={handleVendedorSelect}
            placeholder="Seleccionar vendedor"
            disabled={isSubmitting || isSubmittingInternal}
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
              disabled={isSubmitting || isSubmittingInternal}
            />
          </div>
        </>
      )}
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting || isSubmittingInternal}
        >
          Cancelar
        </Button>
        <Button 
          type="submit"
          disabled={!formData.numero || isSubmitting || isSubmittingInternal}
        >
          {isSubmitting || isSubmittingInternal ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
        </Button>
      </div>
    </form>
  );
};

export default UnidadForm;
