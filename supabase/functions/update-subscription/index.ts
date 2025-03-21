
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
    console.log('Iniciando actualización de suscripción');
    const { subscriptionId, newPlanId, updateUsage = false } = await req.json();
    
    if (!subscriptionId && !updateUsage) {
      console.error('Parámetros faltantes:', { subscriptionId, newPlanId });
      return new Response(
        JSON.stringify({ error: 'Faltan parámetros requeridos (subscriptionId, newPlanId)' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Si es solo una actualización de uso, no necesitamos el newPlanId
    if (updateUsage && subscriptionId) {
      return await handleUsageUpdate(subscriptionId);
    }

    console.log(`Actualizando suscripción ${subscriptionId} al plan ${newPlanId}`);

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
    console.log('Plan encontrado:', plan);
    
    // Obtener detalles de la suscripción actual
    let subscription;
    try {
      console.log(`Recuperando suscripción de Stripe: ${subscriptionId}`);
      subscription = await stripe.subscriptions.retrieve(subscriptionId);
      console.log('Suscripción recuperada con éxito:', subscription.id);
    } catch (stripeError) {
      console.error('Error al recuperar suscripción de Stripe:', stripeError);
      return new Response(
        JSON.stringify({ 
          error: 'No se pudo encontrar la suscripción en Stripe',
          details: stripeError.message
        }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    if (!subscription) {
      console.error('Suscripción no encontrada en Stripe:', subscriptionId);
      return new Response(
        JSON.stringify({ error: 'No se encontró información en Stripe para esta suscripción' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    if (subscription.items.data.length === 0) {
      console.error('La suscripción no tiene items:', subscriptionId);
      return new Response(
        JSON.stringify({ error: 'La suscripción no tiene ítems asociados' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
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
      console.error('No se pudo determinar el producto para este plan:', plan);
      return new Response(
        JSON.stringify({ error: 'No se pudo determinar el producto para este plan' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    let priceId = plan.stripe_price_id;
    console.log('Price ID inicial:', priceId);

    // Si no tenemos un stripe_price_id o estamos cambiando de tipo de plan, creamos un nuevo precio
    let currentProductId;
    try {
      const currentItemPrice = await stripe.prices.retrieve(subscription.items.data[0].price.id);
      currentProductId = currentItemPrice.product;
      console.log('Producto actual:', currentProductId, 'Nuevo producto:', productId);
    } catch (priceError) {
      console.error('Error al recuperar el precio actual:', priceError);
      return new Response(
        JSON.stringify({ 
          error: 'No se pudo recuperar la información del precio actual',
          details: priceError.message
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    // Si estamos cambiando de tipo de producto (desarrollo a prototipo o viceversa)
    // o si no tenemos un price_id, necesitamos crear un nuevo precio
    if (!priceId || currentProductId !== productId) {
      console.log(`Creando nuevo precio para cambio de plan. Producto actual: ${currentProductId}, Nuevo producto: ${productId}`);
      
      try {
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
        console.log('Nuevo precio creado:', priceId);

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
      } catch (createPriceError) {
        console.error('Error al crear nuevo precio en Stripe:', createPriceError);
        return new Response(
          JSON.stringify({ 
            error: 'No se pudo crear un nuevo precio en Stripe',
            details: createPriceError.message
          }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
    }

    // Actualizar la suscripción en Stripe
    let updatedSubscription;
    try {
      console.log(`Actualizando suscripción ${subscriptionId} con precio ${priceId}`);
      updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
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
      console.log('Suscripción actualizada en Stripe:', updatedSubscription.id);
    } catch (updateError) {
      console.error('Error al actualizar la suscripción en Stripe:', updateError);
      return new Response(
        JSON.stringify({ 
          error: 'Error al actualizar la suscripción en Stripe',
          details: updateError.message
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Actualizar la suscripción en la base de datos
    try {
      console.log(`Actualizando suscripción en Supabase para: ${subscriptionId}`);
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
      console.log('Suscripción actualizada en Supabase');
    } catch (supabaseError) {
      console.error('Error al actualizar la suscripción en Supabase:', supabaseError);
      // Continuamos aunque falle la actualización en Supabase, ya que la actualización en Stripe fue exitosa
    }

    // Si acabamos de cambiar el plan, también actualizamos el uso
    if (updatedSubscription) {
      // Intentamos actualizar la información de uso inmediatamente después
      try {
        await handleUsageUpdate(subscriptionId);
      } catch (usageError) {
        console.error('Error al actualizar el uso después del cambio de plan:', usageError);
        // No interrumpimos el flujo si falla, ya que el cambio de plan fue exitoso
      }
    }

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
    console.error('Error general al actualizar la suscripción:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error al actualizar la suscripción',
        message: error.message,
        stack: error.stack
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});

// Función para manejar la actualización de uso y facturación
async function handleUsageUpdate(subscriptionId: string) {
  console.log(`Actualizando información de uso para suscripción: ${subscriptionId}`);
  
  try {
    // 1. Obtener la suscripción actual de Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // 2. Obtener la suscripción y el plan de Supabase
    const { data: supabaseData, error } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/subscriptions?stripe_subscription_id=eq.${subscriptionId}&select=*,subscription_plans(*)`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
      }
    ).then(r => r.json());
    
    if (error || !supabaseData || supabaseData.length === 0) {
      console.error('Error al obtener datos de Supabase:', error);
      throw new Error('No se pudo encontrar la información de suscripción en Supabase');
    }
    
    const subData = supabaseData[0];
    const planFeatures = subData.subscription_plans.features;
    const planId = subData.plan_id;
    const empresaId = subData.empresa_id;
    const resourceType = planFeatures?.tipo || null;
    
    if (!resourceType) {
      throw new Error('El plan no tiene tipo de recurso definido');
    }
    
    // 3. Contar los recursos según el tipo de plan
    let resourceCount = 0;
    if (resourceType === 'desarrollo' && empresaId) {
      // Contar desarrollos
      const { count, error: countError } = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/rest/v1/desarrollos?empresa_id=eq.${empresaId}&select=count=exact`,
        {
          method: 'HEAD',
          headers: {
            'Content-Type': 'application/json',
            'Apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Prefer': 'count=exact',
          },
        }
      ).then(r => ({
        count: parseInt(r.headers.get('content-range')?.split('/')[1] || '0', 10),
        error: r.ok ? null : 'Error en conteo'
      }));
      
      if (countError) {
        console.error('Error al contar desarrollos:', countError);
      } else {
        resourceCount = count;
      }
    } else if (resourceType === 'prototipo' && empresaId) {
      // Obtener desarrollos de la empresa
      const { data: desarrollos, error: desarError } = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/rest/v1/desarrollos?empresa_id=eq.${empresaId}&select=id`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
        }
      ).then(r => r.json());
      
      if (desarError || !desarrollos) {
        console.error('Error al obtener desarrollos:', desarError);
      } else if (desarrollos.length > 0) {
        // Obtener todos los IDs de desarrollos
        const desarrolloIds = desarrollos.map((d: any) => d.id);
        
        // Contar prototipos
        const { count, error: protoError } = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/rest/v1/prototipos?desarrollo_id=in.(${desarrolloIds.join(',')})&select=count=exact`,
          {
            method: 'HEAD',
            headers: {
              'Content-Type': 'application/json',
              'Apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              'Prefer': 'count=exact',
            },
          }
        ).then(r => ({
          count: parseInt(r.headers.get('content-range')?.split('/')[1] || '0', 10),
          error: r.ok ? null : 'Error en conteo'
        }));
        
        if (protoError) {
          console.error('Error al contar prototipos:', protoError);
        } else {
          resourceCount = count;
        }
      }
    }
    
    console.log(`Recursos contados: ${resourceCount} ${resourceType}s`);
    
    // 4. Calcular precio adicional por unidad
    const precioUnidad = planFeatures?.precio_por_unidad || 0;
    const currentBilling = resourceCount * precioUnidad;
    console.log(`Precio calculado: ${resourceCount} x $${precioUnidad} = $${currentBilling}`);
    
    // 5. Actualizar el invoice item en Stripe para reflejar el uso
    const invoiceItems = await stripe.invoiceItems.list({
      subscription: subscriptionId,
      pending: true
    });
    
    // Eliminar ítems de factura pendientes para esta suscripción para evitar duplicados
    for (const item of invoiceItems.data) {
      if (item.description?.includes('Cargo por recursos adicionales')) {
        await stripe.invoiceItems.del(item.id);
        console.log(`Eliminado ítem de factura previo: ${item.id}`);
      }
    }
    
    // Añadir nuevo ítem de factura si hay recursos adicionales
    if (currentBilling > 0) {
      const invoiceItem = await stripe.invoiceItems.create({
        customer: subscription.customer as string,
        subscription: subscriptionId,
        amount: Math.round(currentBilling * 100), // Convertir a centavos
        currency: 'mxn',
        description: `Cargo por recursos adicionales - ${resourceCount} ${resourceType}s`,
        metadata: {
          resource_count: resourceCount.toString(),
          resource_type: resourceType,
          price_per_unit: precioUnidad.toString()
        }
      });
      
      console.log(`Ítem de factura creado: ${invoiceItem.id} por $${currentBilling}`);
    }
    
    // 6. Actualizar los metadatos de la suscripción
    await stripe.subscriptions.update(subscriptionId, {
      metadata: {
        plan_id: planId,
        resource_count: resourceCount.toString(),
        resource_type: resourceType,
        calculated_billing: currentBilling.toString()
      }
    });
    
    console.log('Metadatos de suscripción actualizados en Stripe');
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Información de uso actualizada correctamente',
        usage: {
          resourceCount,
          resourceType,
          pricePerUnit: precioUnidad,
          calculatedBilling: currentBilling
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  } catch (error) {
    console.error('Error al actualizar información de uso:', error);
    return new Response(
      JSON.stringify({
        error: 'Error al actualizar información de uso',
        message: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
}
