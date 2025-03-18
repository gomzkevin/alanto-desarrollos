
import React from 'react';
import { 
  FormField, 
  EstadoSelect, 
  DatePickerField, 
  FormActions 
} from './components/FormInputs';
import SearchableEntitySelect from './components/SearchableEntitySelect';
import useUnidadForm from './hooks/useUnidadForm';
import useVendedores from './hooks/useVendedores';
import { Input } from "@/components/ui/input";

interface UnidadFormProps {
  unidad?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  leads: any[];
}

export const UnidadForm = ({ unidad, onSubmit, onCancel, leads }: UnidadFormProps) => {
  const { vendedores } = useVendedores();
  
  const { 
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
    precioFormateado,
    handlePrecioChange,
    prepareFormData 
  } = useUnidadForm({ unidad, leads, vendedores });
  
  const handleFormSubmit = (data: any) => {
    const formattedData = prepareFormData(data);
    onSubmit(formattedData);
  };

  // Filter out any empty or undefined options
  const filteredLeads = leads.filter(lead => lead && lead.id);
  const filteredVendedores = vendedores.filter(vendedor => vendedor && vendedor.id);

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="numero" className="font-medium text-sm">Número/Identificador *</label>
            <input
              id="numero"
              className={`w-full px-3 py-2 border ${!!errors.numero ? 'border-red-500' : 'border-gray-300'} rounded-md bg-gray-100`}
              placeholder="Ej. A101, Casa 5, etc."
              {...register('numero', { required: true })}
              readOnly={!!unidad}
            />
            {!!errors.numero && (
              <p className="text-sm text-red-500">Este campo es requerido</p>
            )}
          </div>
          
          <FormField
            label="Nivel/Piso"
            id="nivel"
            placeholder="Ej. 1, PB, etc."
            {...register('nivel')}
          />
        </div>
        
        <EstadoSelect 
          value={estado} 
          onChange={handleEstadoChange} 
        />
        
        {(estado === 'apartado' || estado === 'en_proceso' || estado === 'vendido') && (
          <>
            <div className="space-y-2">
              <label htmlFor="precio_venta" className="font-medium text-sm">Precio de Venta</label>
              <Input
                id="precio_venta"
                formatCurrency
                value={precioFormateado}
                onChange={handlePrecioChange}
                placeholder="$0"
                className="bg-white"
              />
            </div>
            
            <div className="space-y-2">
              <label className="font-medium text-sm">Comprador</label>
              <SearchableEntitySelect
                value={watch('comprador_id') || ''}
                onChange={handleLeadChange}
                placeholder="Buscar cliente..."
                options={filteredLeads}
                emptyMessage="No se encontraron clientes con ese nombre."
              />
            </div>
            
            <div className="space-y-2">
              <label className="font-medium text-sm">Vendedor</label>
              <SearchableEntitySelect
                value={watch('vendedor_id') || ''}
                onChange={handleVendedorChange}
                placeholder="Buscar vendedor..."
                options={filteredVendedores}
                emptyMessage="No se encontraron vendedores con ese nombre."
              />
            </div>
            
            <DatePickerField
              label="Fecha de Venta/Apartado"
              date={fechaVenta}
              onSelect={setFechaVenta}
            />
          </>
        )}
        
        <FormActions onCancel={onCancel} isEdit={!!unidad} />
      </form>
    </div>
  );
};

export default UnidadForm;
