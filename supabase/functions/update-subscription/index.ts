
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
    const { subscriptionId, newPlanId } = await req.json();
    
    if (!subscriptionId || !newPlanId) {
      return new Response(
        JSON.stringify({ error: 'Faltan parámetros requeridos (subscriptionId, newPlanId)' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Obtener datos del plan
    const { data: planData, error: planError } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/subscription_plans?id=eq.${newPlanId}`,
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
    
    // Obtener detalles de la suscripción actual
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Determinar el tipo de producto basado en las características del plan
    let productId = null;
    if (plan.features && typeof plan.features === 'object' && plan.features.tipo) {
      // Mapear el tipo de plan a un producto de Stripe
      if (plan.features.tipo === 'desarrollo') {
        productId = 'prod_RyqU9V2MUpdoAE'; // Plan por Desarrollo
      } else if (plan.features.tipo === 'prototipo') {
        productId = 'prod_RyqQdayNykeJTM'; // Plan por Prototipos
      }
    }

    if (!productId) {
      return new Response(
        JSON.stringify({ error: 'No se pudo determinar el producto para este plan' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    let priceId = plan.stripe_price_id;

    // Si no tenemos un stripe_price_id o estamos cambiando de tipo de plan, creamos un nuevo precio
    const currentItemPrice = await stripe.prices.retrieve(subscription.items.data[0].price.id);
    const currentProductId = currentItemPrice.product;
    
    // Si estamos cambiando de tipo de producto (desarrollo a prototipo o viceversa)
    // o si no tenemos un price_id, necesitamos crear un nuevo precio
    if (!priceId || currentProductId !== productId) {
      console.log(`Creando nuevo precio para cambio de plan. Producto actual: ${currentProductId}, Nuevo producto: ${productId}`);
      
      // Crear un nuevo precio en Stripe
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: Math.round(plan.price * 100), // Convertir a centavos
        currency: 'mxn',
        recurring: {
          interval: plan.interval === 'month' ? 'month' : 'year',
        },
        metadata: {
          plan_id: newPlanId
        }
      });

      priceId = price.id;

      // Actualizar el plan en Supabase con el nuevo price_id
      await fetch(
        `${Deno.env.get('SUPABASE_URL')}/rest/v1/subscription_plans?id=eq.${newPlanId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ stripe_price_id: priceId }),
        }
      );
    }

    // Actualizar la suscripción en Stripe
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
      proration_behavior: 'create_prorations',
      items: [
        {
          id: subscription.items.data[0].id,
          price: priceId,
        },
      ],
      metadata: {
        plan_id: newPlanId
      }
    });

    // Actualizar la suscripción en la base de datos
    await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/subscriptions?stripe_subscription_id=eq.${subscriptionId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          plan_id: newPlanId,
          updated_at: new Date().toISOString(),
          status: 'active',
          cancel_at_period_end: false
        }),
      }
    );

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Suscripción actualizada correctamente',
        subscription: updatedSubscription
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error('Error al actualizar la suscripción:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});
