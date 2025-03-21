
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Stripe } from "https://esm.sh/stripe@12.18.0?target=deno";

// Inicializar Stripe con la clave secreta de API
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

// Definir los encabezados CORS para permitir peticiones desde cualquier origen
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Log información general de la solicitud para depuración
  console.log(`Webhook recibido: ${req.method} ${req.url} en ${new Date().toISOString()}`);
  console.log(`Headers: ${JSON.stringify(Object.fromEntries(req.headers))}`);
  
  // Manejar la petición de preflight OPTIONS
  if (req.method === 'OPTIONS') {
    console.log('Petición OPTIONS recibida, devolviendo headers CORS');
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    // Obtener el cuerpo de la petición y la firma
    const signature = req.headers.get('stripe-signature');
    
    // Log para depuración
    if (!signature) {
      console.log('No se encontró firma de Stripe en el encabezado');
    } else {
      console.log(`Firma de Stripe recibida: ${signature.substring(0, 20)}...`);
    }
    
    // Verificar que el webhook secret está configurado
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.log('Error: STRIPE_WEBHOOK_SECRET no está configurado');
      return new Response(JSON.stringify({ 
        error: 'Webhook secret not configured',
        timestamp: new Date().toISOString() 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } else {
      console.log('STRIPE_WEBHOOK_SECRET está configurado correctamente');
    }
    
    // Clonar la request para poder leer el cuerpo más de una vez
    const bodyText = await req.text();
    console.log(`Cuerpo de la petición: ${bodyText.substring(0, 200)}...`);
    
    if (!signature) {
      return new Response(JSON.stringify({ 
        error: 'No signature provided',
        timestamp: new Date().toISOString() 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Construir el evento desde el cuerpo y la firma
    let event;
    try {
      event = stripe.webhooks.constructEvent(bodyText, signature, webhookSecret);
      console.log(`Evento construido exitosamente: ${event.type}`);
    } catch (err) {
      console.log(`Error al verificar webhook: ${err.message}`);
      return new Response(JSON.stringify({ 
        error: `Webhook Error: ${err.message}`,
        timestamp: new Date().toISOString() 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('Evento de Stripe recibido:', event.type);
    console.log('Datos del evento:', JSON.stringify(event.data.object).substring(0, 300) + '...');

    // Manejar diferentes tipos de eventos
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        // Actualizar suscripción en la base de datos
        await handleSubscriptionChange(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        // Marcar suscripción como inactiva
        await handleSubscriptionCancelled(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        // Confirmar pago exitoso
        await handlePaymentSucceeded(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        // Manejar fallo de pago
        await handlePaymentFailed(event.data.object);
        break;
        
      default:
        console.log(`Evento no manejado: ${event.type}`);
    }

    // Responder con éxito
    return new Response(JSON.stringify({ 
      received: true, 
      type: event.type,
      timestamp: new Date().toISOString() 
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    console.error('Error procesando webhook:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message,
      timestamp: new Date().toISOString() 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

// Función para manejar la creación o actualización de suscripciones
async function handleSubscriptionChange(subscription: any) {
  console.log('Manejando cambio de suscripción:', subscription.id);
  
  // Datos a actualizar en la tabla de suscripciones
  const dataToUpdate = {
    status: subscription.status,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  };

  console.log('Datos a actualizar:', JSON.stringify(dataToUpdate));

  // Buscar al usuario basado en el cliente de Stripe
  const { data: supabaseResponse, error } = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/rest/v1/subscriptions?stripe_customer_id=eq.${subscription.customer}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
    }
  ).then(r => r.json());

  if (error) {
    console.error('Error buscando suscripción:', error);
    return;
  }

  console.log('Respuesta de Supabase:', JSON.stringify(supabaseResponse));

  // Si encontramos la suscripción, actualizarla
  if (supabaseResponse && supabaseResponse.length > 0) {
    const subscriptionId = supabaseResponse[0].id;
    console.log(`Actualizando suscripción existente con ID: ${subscriptionId}`);
    
    await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/subscriptions?id=eq.${subscriptionId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(dataToUpdate),
      }
    );
    
    console.log('Suscripción actualizada:', subscriptionId);
  } else {
    console.error('No se encontró suscripción para cliente:', subscription.customer);
  }
}

// Función para manejar cancelaciones de suscripciones
async function handleSubscriptionCancelled(subscription: any) {
  console.log('Manejando cancelación de suscripción:', subscription.id);

  // Actualizar el estado de la suscripción a "cancelled"
  await fetch(
    `${Deno.env.get('SUPABASE_URL')}/rest/v1/subscriptions?stripe_subscription_id=eq.${subscription.id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      }),
    }
  );
  
  console.log('Suscripción marcada como cancelada');
}

// Función para manejar pagos exitosos
async function handlePaymentSucceeded(invoice: any) {
  console.log('Pago exitoso para factura:', invoice.id);
  
  // Si hay una suscripción asociada, actualizar su estado
  if (invoice.subscription) {
    await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/subscriptions?stripe_subscription_id=eq.${invoice.subscription}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          status: 'active',
          updated_at: new Date().toISOString(),
        }),
      }
    );
    
    console.log('Estado de suscripción actualizado a active');
  }
}

// Función para manejar fallos de pago
async function handlePaymentFailed(invoice: any) {
  console.log('Pago fallido para factura:', invoice.id);
  
  // Si hay una suscripción asociada, marcarla como pago_fallido
  if (invoice.subscription) {
    await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/subscriptions?stripe_subscription_id=eq.${invoice.subscription}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          status: 'payment_failed',
          updated_at: new Date().toISOString(),
        }),
      }
    );
    
    console.log('Estado de suscripción actualizado a payment_failed');
  }
}
