
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

// Mapeo de IDs de planes a productos de Stripe
const STRIPE_PRODUCTS = {
  desarrollo: Deno.env.get('STRIPE_PRODUCT_DESARROLLO') || 'prod_RyqU9V2MUpdoAE',
  prototipo: Deno.env.get('STRIPE_PRODUCT_PROTOTIPO') || 'prod_RyqQdayNykeJTM',
};

serve(async (req) => {
  // Manejar la petición de preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Obtener datos del cuerpo de la petición
    const { userId, planType, planId, pricePerUnit, empresaId } = await req.json();
    
    if (!userId || !planType || !planId) {
      return new Response(
        JSON.stringify({ error: 'Faltan parámetros requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

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

    // Crear un nuevo cliente en Stripe
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.nombre,
      metadata: {
        userId: userId,
        empresaId: user.empresa_id?.toString() || empresaId?.toString() || ''
      }
    });

    // Verificar que el producto existe
    const stripeProductId = STRIPE_PRODUCTS[planType];
    if (!stripeProductId) {
      return new Response(
        JSON.stringify({ error: 'Tipo de plan no válido' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Crear un precio en Stripe para el producto
    const price = await stripe.prices.create({
      currency: 'mxn',
      product: stripeProductId,
      unit_amount: Math.round((pricePerUnit || 100) * 100), // Stripe usa centavos
      recurring: {
        interval: 'month', // o 'year' según sea necesario
        usage_type: 'licensed',
      },
    });

    // Crear una suscripción en Stripe
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      metadata: {
        userId: userId,
        planId: planId,
      },
    });

    // Guardar la suscripción en la base de datos
    const { data: subscriptionData, error: subscriptionError } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          user_id: userId,
          plan_id: planId,
          empresa_id: user.empresa_id || empresaId,
          status: subscription.status,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: customer.id,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: false,
        }),
      }
    ).then(r => r.json());

    if (subscriptionError) {
      console.error('Error guardando suscripción en Supabase:', subscriptionError);
      return new Response(
        JSON.stringify({ error: 'Error guardando suscripción', details: subscriptionError }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Preparar respuesta con los detalles de la suscripción
    return new Response(
      JSON.stringify({ 
        success: true,
        subscription: subscription,
        supabaseSubscription: subscriptionData
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error('Error creando suscripción de prueba:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});
