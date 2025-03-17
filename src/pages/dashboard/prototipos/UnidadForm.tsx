
import React from 'react';
import { 
  FormField, 
  EstadoSelect, 
  DatePickerField, 
  EntitySelect, 
  FormActions 
} from './components/FormInputs';
import SearchableEntitySelect from './components/SearchableEntitySelect';
import useUnidadForm from './hooks/useUnidadForm';
import useVendedores from './hooks/useVendedores';

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
          <FormField
            label="Número/Identificador *"
            id="numero"
            placeholder="Ej. A101, Casa 5, etc."
            {...register('numero', { required: true })}
            error={!!errors.numero}
          />
          
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
            <FormField
              label="Precio de Venta"
              id="precio_venta"
              type="number"
              placeholder="0.00"
              {...register('precio_venta')}
            />
            
            <SearchableEntitySelect
              label="Comprador"
              value={watch('comprador_id') || ''}
              onChange={(leadId, leadName) => handleLeadChange(leadId, leadName)}
              placeholder="Buscar cliente..."
              options={filteredLeads}
              emptyMessage="No se encontraron clientes con ese nombre."
            />
            
            <EntitySelect
              label="Vendedor"
              value={watch('vendedor_id') || ''}
              onChange={handleVendedorChange}
              placeholder="Selecciona un vendedor"
              options={filteredVendedores}
              emptyOption={true}
            />
            
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
