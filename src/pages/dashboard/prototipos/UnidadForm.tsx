
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
import { useNavigate } from 'react-router-dom';
import useUnitSale from '@/hooks/useUnitSale';
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
  isSubmitting: externalIsSubmitting = false
}: UnidadFormProps) => {
  const { vendedores } = useVendedores();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estado para la alerta de redirección
  const [showRedirectAlert, setShowRedirectAlert] = useState(false);
  const [targetVentaId, setTargetVentaId] = useState<string | null>(null);
  
  // Estado de seguimiento para creación de ventas
  const [unidadModificada, setUnidadModificada] = useState<string | undefined>(undefined);
  const { waitForVenta } = useUnitSale(unidadModificada);
  
  // Hook para el formulario
  const {
    formData,
    precioFormateado,
    isEditing,
    isSubmitting: formIsSubmitting,
    handleChange,
    handleSubmit: originalHandleSubmit,
    setFormData
  } = useUnidadForm({ 
    unidad, 
    onSubmit: async (data) => {
      try {
        // 1. Guardar el estado original para comparación
        const estadoOriginal = unidad?.estado;
        const estadoNuevo = data.estado;
        
        // 2. Enviar la actualización al servidor
        await onSubmit(data);
        
        // 3. Mostrar mensaje de éxito
        toast({
          title: "Cambios guardados",
          description: `La unidad ${data.numero} ha sido ${isEditing ? 'actualizada' : 'creada'} correctamente.`
        });
        
        // 4. Verificar si potencialmente se creará una venta (solo para ediciones)
        const posibleCreacionVenta = isEditing && 
          estadoOriginal === 'disponible' && 
          (estadoNuevo === 'apartado' || estadoNuevo === 'en_proceso');
        
        console.log('Verificación de creación de venta:', {
          isEditing,
          estadoOriginal,
          estadoNuevo,
          posibleCreacionVenta
        });
        
        // 5. Si es probable que se haya creado una venta, buscarla
        if (posibleCreacionVenta && unidad?.id) {
          setUnidadModificada(unidad.id);
          
          // Esperar a que se cree la venta (con reintentos)
          const ventaEncontrada = await waitForVenta(unidad.id);
          
          if (ventaEncontrada) {
            console.log(`Venta encontrada: ${ventaEncontrada}`);
            setTargetVentaId(ventaEncontrada);
            setShowRedirectAlert(true);
          } else {
            console.log('No se encontró venta después de la modificación');
          }
          
          // Limpiar el seguimiento
          setUnidadModificada(undefined);
        }
      } catch (error) {
        console.error('Error al procesar el formulario:', error);
        toast({
          title: "Error",
          description: "No se pudieron guardar los cambios. Intente nuevamente.",
          variant: "destructive"
        });
      }
    }, 
    onCancel 
  });
  
  // Combinar estados de carga
  const isFormDisabled = externalIsSubmitting || formIsSubmitting;
  
  // Manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (isFormDisabled) return;
    
    // Registrar datos para depuración
    console.log('Enviando formulario:', {
      estadoPrevio: unidad?.estado,
      estadoNuevo: formData.estado
    });
    
    originalHandleSubmit(e);
  };
  
  // Manejar redirección a la página de venta
  const handleRedirectToVenta = () => {
    if (targetVentaId) {
      navigate(`/dashboard/ventas/${targetVentaId}`);
    }
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
      {/* Alerta de redirección a ventas */}
      {showRedirectAlert && targetVentaId && (
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
