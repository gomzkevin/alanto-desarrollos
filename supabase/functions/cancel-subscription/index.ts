
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Stripe } from "https://esm.sh/stripe@12.18.0?target=deno";

// Inicializar Stripe con la clave secreta de API
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || 'sk_test_51R4saiPGxxD3ciXynuLwEj9C344ivGAsOQrN45H6ZP3gw12aywXd9Tui4dzY8iqGPvXLdusBiIxGi4zjy17hI7AH00jfDMq5GL', {
  apiVersion: '2023-10-16',
});

// Definir los encabezados CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Manejar la petición de preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subscriptionId } = await req.json();
    
    if (!subscriptionId) {
      return new Response(
        JSON.stringify({ error: 'Falta el ID de suscripción' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Obtener datos de autenticación del usuario
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`Procesando cancelación para suscripción: ${subscriptionId}`);

    // En este punto simplemente devolveremos éxito, ya que la desactivación
    // ahora se maneja directamente en el cliente a través de la actualización
    // en la base de datos
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Solicitud de cancelación procesada correctamente',
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error('Error al cancelar suscripción:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});
