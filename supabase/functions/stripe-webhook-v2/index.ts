
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import Stripe from 'https://esm.sh/stripe@14.0.0';

// Definir los encabezados CORS de forma más amplia para asegurar compatibilidad
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  console.log("Webhook v2: Solicitud recibida:", req.method, new URL(req.url).pathname);
  
  // Manejar solicitudes preflight CORS
  if (req.method === "OPTIONS") {
    console.log("Webhook v2: Manejando solicitud OPTIONS");
    return new Response(null, {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    // Verificar que sea una solicitud POST
    if (req.method !== "POST") {
      console.error(`Webhook v2: Método no soportado: ${req.method}`);
      return new Response(
        JSON.stringify({ error: `Método ${req.method} no permitido`, success: false }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 405,
        }
      );
    }

    // Obtener la firma de Stripe del encabezado
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      console.error("Webhook v2: Firma de Stripe no encontrada en los encabezados");
      return new Response(
        JSON.stringify({ error: "Firma de Stripe no proporcionada", success: false }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 400,
        }
      );
    }

    // Obtener el cuerpo de la solicitud sin procesar - IMPORTANTE para la verificación de firma
    const rawBody = await req.text();
    console.log("Webhook v2: Longitud del cuerpo recibido:", rawBody.length);
    
    // Inicializar Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeSecretKey || !webhookSecret) {
      console.error("Webhook v2: Configuración de Stripe incompleta", { 
        tieneStripeKey: !!stripeSecretKey, 
        tieneWebhookSecret: !!webhookSecret 
      });
      return new Response(
        JSON.stringify({ error: "Configuración de Stripe incompleta", success: false }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 500,
        }
      );
    }

    console.log("Webhook v2: Configuración de Stripe encontrada, inicializando cliente");
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-02-24.acacia",
    });

    // Verificar la firma del webhook y construir el evento
    let event;
    try {
      console.log("Webhook v2: Verificando firma con secreto:", webhookSecret.substring(0, 3) + "...");
      console.log("Webhook v2: Encabezado de firma:", signature);
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      console.log(`Webhook v2: Verificación de firma exitosa para evento: ${event.type}`);
    } catch (err) {
      console.error(`Webhook v2: Verificación de firma fallida: ${err.message}`);
      return new Response(
        JSON.stringify({ 
          error: `Error de verificación de firma: ${err.message}`, 
          success: false 
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 401,
        }
      );
    }

    // Crear cliente de Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Webhook v2: Configuración de Supabase incompleta");
      return new Response(
        JSON.stringify({ error: "Configuración de Supabase incompleta", success: false }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 500,
        }
      );
    }
    
    console.log("Webhook v2: Configuración de Supabase encontrada, inicializando cliente");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Manejar el evento
    console.log(`Webhook v2: Procesando evento: ${event.type}`);
    
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object, supabase);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, supabase, stripe);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, supabase);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object, supabase, stripe);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object, supabase);
        break;
      default:
        console.log(`Webhook v2: Tipo de evento no manejado: ${event.type}`);
    }

    console.log("Webhook v2: Procesamiento de webhook exitoso");
    return new Response(
      JSON.stringify({ received: true, success: true }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Webhook v2: Error procesando webhook:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Ocurrió un error inesperado", 
        stack: error.stack,
        success: false
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});

// Manejador para evento checkout.session.completed
async function handleCheckoutSessionCompleted(session, supabase) {
  console.log('Webhook v2: Procesando evento checkout.session.completed:', JSON.stringify(session, null, 2));
  
  try {
    // Extraer metadatos de la sesión
    const { user_id, plan_id, empresa_id } = session.metadata || {};
    
    if (!user_id || !plan_id) {
      console.error("Webhook v2: Metadatos requeridos faltantes en la sesión:", session.metadata);
      return;
    }
    
    // Verificar si la suscripción ya fue creada por otro evento
    const { data: existingSubscription, error: checkError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', session.subscription)
      .maybeSingle();
      
    if (checkError) {
      console.error("Webhook v2: Error verificando suscripción existente:", checkError);
      throw checkError;
    }
    
    if (existingSubscription) {
      console.log("Webhook v2: La suscripción ya existe, omitiendo creación:", existingSubscription.id);
      return;
    }
    
    // Crear un nuevo registro de suscripción
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        user_id,
        plan_id,
        empresa_id: empresa_id || null,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: null  // Se actualizará cuando recibamos los detalles de la suscripción
      })
      .select()
      .single();
      
    if (subscriptionError) {
      console.error("Webhook v2: Error creando suscripción:", subscriptionError);
      throw subscriptionError;
    }
    
    console.log("Webhook v2: Suscripción creada exitosamente:", subscription.id);
    
  } catch (error) {
    console.error("Webhook v2: Error en handleCheckoutSessionCompleted:", error);
    throw error;
  }
}

// Manejador para eventos customer.subscription.created o customer.subscription.updated
async function handleSubscriptionUpdated(subscription, supabase, stripe) {
  console.log('Webhook v2: Procesando evento de actualización de suscripción ID:', subscription.id);
  
  try {
    // Si la suscripción fue recién creada, asegurémonos de tener los datos del plan
    if (!subscription.metadata?.plan_id) {
      console.log("Webhook v2: La suscripción carece de metadatos plan_id, intentando recuperar de items de suscripción");
      
      // Obtener los items de la suscripción para identificar el precio/plan
      const subscriptionItems = await stripe.subscriptionItems.list({
        subscription: subscription.id,
      });
      
      if (subscriptionItems.data.length > 0) {
        const priceId = subscriptionItems.data[0].price.id;
        
        // Buscar el plan con este ID de precio
        const { data: plans, error: planError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('stripe_price_id', priceId)
          .maybeSingle();
          
        if (planError) {
          console.error("Webhook v2: Error encontrando plan por ID de precio:", planError);
        } else if (plans) {
          console.log("Webhook v2: Plan encontrado para ID de precio:", plans.id);
          
          // Actualizar los metadatos de la suscripción en Stripe
          await stripe.subscriptions.update(subscription.id, {
            metadata: {
              plan_id: plans.id,
              ...subscription.metadata
            }
          });
        }
      }
    }
    
    // Encontrar la suscripción en nuestra base de datos
    const { data: subscriptionData, error: findError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscription.id)
      .maybeSingle();
      
    if (findError) {
      console.error("Webhook v2: Error encontrando suscripción:", findError);
      throw findError;
    }
    
    if (!subscriptionData) {
      console.log("Webhook v2: Suscripción no encontrada en base de datos, creando nuevo registro");
      
      // Encontrar información del cliente
      let customerId, userId, empresaId;
      
      // Primero intentar extraer de metadatos
      userId = subscription.metadata?.user_id;
      empresaId = subscription.metadata?.empresa_id;
      
      // Si no está en metadatos, intentar obtener usuario del email del cliente
      if (!userId && subscription.customer_email) {
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', subscription.customer_email)
          .maybeSingle();
          
        if (userError) {
          console.error("Webhook v2: Error encontrando usuario por email:", userError);
        } else if (userData) {
          userId = userData.auth_id;
          empresaId = userData.empresa_id;
        }
      }
      
      if (!userId) {
        console.error("Webhook v2: No se pudo determinar ID de usuario para suscripción", subscription.id);
        return;
      }
      
      // Determinar ID del plan desde metadatos o items de suscripción
      let planId = subscription.metadata?.plan_id;
      
      if (!planId) {
        // Intentar encontrar el plan por el ID de precio
        const subscriptionItems = await stripe.subscriptionItems.list({
          subscription: subscription.id,
        });
        
        if (subscriptionItems.data.length > 0) {
          const priceId = subscriptionItems.data[0].price.id;
          
          const { data: plans, error: planError } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('stripe_price_id', priceId)
            .maybeSingle();
            
          if (!planError && plans) {
            planId = plans.id;
          }
        }
      }
      
      if (!planId) {
        console.error("Webhook v2: No se pudo determinar ID del plan para suscripción", subscription.id);
        return;
      }
      
      // Crear nuevo registro de suscripción
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          empresa_id: empresaId,
          stripe_customer_id: subscription.customer,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end
        });
        
      if (insertError) {
        console.error("Webhook v2: Error creando nueva suscripción:", insertError);
        throw insertError;
      }
      
      console.log("Webhook v2: Nuevo registro de suscripción creado exitosamente");
      return;
    }
    
    // Actualizar la suscripción con los datos más recientes de Stripe
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);
      
    if (updateError) {
      console.error("Webhook v2: Error actualizando suscripción:", updateError);
      throw updateError;
    }
    
    console.log("Webhook v2: Suscripción actualizada exitosamente");
    
  } catch (error) {
    console.error("Webhook v2: Error en handleSubscriptionUpdated:", error);
    throw error;
  }
}

// Manejador para evento customer.subscription.deleted
async function handleSubscriptionDeleted(subscription, supabase) {
  console.log('Webhook v2: Procesando evento de suscripción eliminada:', subscription.id);
  
  try {
    // Actualizar el estado de la suscripción a cancelado
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);
      
    if (updateError) {
      console.error("Webhook v2: Error cancelando suscripción:", updateError);
      throw updateError;
    }
    
    console.log("Webhook v2: Suscripción cancelada exitosamente");
    
  } catch (error) {
    console.error("Webhook v2: Error en handleSubscriptionDeleted:", error);
    throw error;
  }
}

// Manejador para evento invoice.payment_succeeded
async function handleInvoicePaymentSucceeded(invoice, supabase, stripe) {
  console.log('Webhook v2: Procesando evento invoice.payment_succeeded:', invoice.id);
  
  try {
    // Si es una factura relacionada con una suscripción, actualizar nuestra suscripción
    if (invoice.subscription) {
      const subscriptionId = invoice.subscription;
      
      // Obtener los detalles de la suscripción de Stripe para asegurar que tenemos los datos más recientes
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      // Actualizar o crear la suscripción en nuestra base de datos
      await handleSubscriptionUpdated(subscription, supabase, stripe);
      
      console.log("Webhook v2: Suscripción actualizada después de pago exitoso");
    }
  } catch (error) {
    console.error("Webhook v2: Error en handleInvoicePaymentSucceeded:", error);
    throw error;
  }
}

// Manejador para evento invoice.payment_failed
async function handleInvoicePaymentFailed(invoice, supabase) {
  console.log('Webhook v2: Procesando evento invoice.payment_failed:', invoice.id);
  
  try {
    // Si es una factura relacionada con una suscripción, actualizar nuestra suscripción
    if (invoice.subscription) {
      const subscriptionId = invoice.subscription;
      
      // Actualizar el estado de la suscripción en nuestra base de datos
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscriptionId);
        
      if (updateError) {
        console.error("Webhook v2: Error actualizando suscripción después de fallo de pago:", updateError);
        throw updateError;
      }
      
      console.log("Webhook v2: Estado de suscripción actualizado después de fallo de pago");
    }
  } catch (error) {
    console.error("Webhook v2: Error en handleInvoicePaymentFailed:", error);
    throw error;
  }
}
