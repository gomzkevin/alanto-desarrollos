
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ClientConfig } from './types';

export const useClientCreation = () => {
  const { toast } = useToast();

  const createNewClient = async (
    clientConfig: ClientConfig,
    empresaId?: number
  ): Promise<{ success: boolean; clientId?: string }> => {
    const { isExistingClient, newClientData } = clientConfig;
    
    // Si es un cliente existente, no creamos uno nuevo
    if (isExistingClient) {
      return { success: true };
    }
    
    const { nombre, email, telefono } = newClientData;
    
    if (!nombre) {
      toast({
        title: 'Error',
        description: 'Se requiere un nombre para crear un nuevo cliente',
        variant: 'destructive',
      });
      return { success: false };
    }
    
    console.log('Creando nuevo cliente con datos:', { nombre, email, telefono, empresaId });
    
    // Verificar que los datos requeridos estén presentes y crear el lead con valores predeterminados
    const leadData = {
      nombre,
      email,
      telefono,
      estado: 'nuevo',
      subestado: 'sin_contactar',
      empresa_id: empresaId,
      origen: 'cotizacion_directa', // Añadir un origen para identificar leads creados desde cotizaciones
      fecha_creacion: new Date().toISOString()
    };
    
    console.log('Insertando nuevo lead con datos:', leadData);
    
    try {
      // Create the lead explicitly with an insert operation and specify the return type
      const { data, error: leadError } = await supabase
        .from('leads')
        .insert([leadData])
        .select('id, nombre');
      
      if (leadError) {
        console.error('Error creando nuevo lead:', leadError);
        toast({
          title: 'Error',
          description: `No se pudo crear el cliente: ${leadError.message}`,
          variant: 'destructive',
        });
        return { success: false };
      }
      
      console.log('Respuesta de creación de lead:', data);
      
      if (data && data.length > 0) {
        console.log('Nuevo cliente creado exitosamente:', data[0]);
        return { success: true, clientId: data[0].id };
      } else {
        console.error('No se recibieron datos después de la inserción del lead');
        toast({
          title: 'Error',
          description: 'No se pudo crear el cliente, no se recibieron datos del servidor',
          variant: 'destructive',
        });
        return { success: false };
      }
    } catch (insertError) {
      console.error('Excepción durante la creación del lead:', insertError);
      toast({
        title: 'Error',
        description: 'Error interno al crear el cliente',
        variant: 'destructive',
      });
      return { success: false };
    }
  };

  return {
    createNewClient
  };
};

export default useClientCreation;
