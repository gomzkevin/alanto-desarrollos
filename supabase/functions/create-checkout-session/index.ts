
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Stripe } from "https://esm.sh/stripe@12.18.0?target=deno";

// Inicializar Stripe con la clave secreta de API
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
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
    // Obtener datos del cuerpo de la petición
    const { planId, userId, successUrl, cancelUrl } = await req.json();
    
    if (!planId || !userId || !successUrl || !cancelUrl) {
      return new Response(
        JSON.stringify({ error: 'Faltan parámetros requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Obtener detalles del plan desde Supabase
    const { data: planData, error: planError } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/subscription_plans?id=eq.${planId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
      }
    ).then(r => r.json());

    if (planError || !planData || planData.length === 0) {
      console.error('Error obteniendo detalles del plan:', planError);
      return new Response(
        JSON.stringify({ error: 'Plan no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const plan = planData[0];
    
    // Obtener información del usuario
    const { data: userData, error: userError } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/usuarios?auth_id=eq.${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
      }
    ).then(r => r.json());

    if (userError || !userData || userData.length === 0) {
      console.error('Error obteniendo información del usuario:', userError);
      return new Response(
        JSON.stringify({ error: 'Usuario no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const user = userData[0];

    // Verificar si el usuario ya tiene un cliente de Stripe
    let customerId;
    const { data: subscriptionData, error: subscriptionError } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/subscriptions?user_id=eq.${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
      }
    ).then(r => r.json());

    if (subscriptionError) {
      console.error('Error verificando suscripción existente:', subscriptionError);
    }

    // Si el usuario ya tiene un cliente de Stripe, usarlo
    if (subscriptionData && subscriptionData.length > 0 && subscriptionData[0].stripe_customer_id) {
      customerId = subscriptionData[0].stripe_customer_id;
    } else {
      // Crear un nuevo cliente en Stripe
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.nombre,
        metadata: {
          userId: userId,
          empresaId: user.empresa_id?.toString() || ''
        }
      });
      
      customerId = customer.id;
    }

    // Crear una sesión de checkout de Stripe
    let session;
    if (plan.stripe_price_id) {
      // Si el plan ya tiene un ID de precio de Stripe, usarlo
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price: plan.stripe_price_id,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: userId,
          planId: planId,
        },
      });
    } else {
      // Si no tiene ID de precio de Stripe, crear un precio temporal
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price_data: {
              currency: 'mxn',
              product_data: {
                name: plan.name,
                description: plan.description || '',
              },
              unit_amount: Math.round(plan.price * 100), // Stripe usa centavos
              recurring: {
                interval: plan.interval === 'month' ? 'month' : 'year',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: userId,
          planId: planId,
        },
      });
    }

    // Preparar respuesta con la URL de checkout
    return new Response(
      JSON.stringify({ 
        checkoutUrl: session.url,
        sessionId: session.id
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error('Error creando sesión de checkout:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});
