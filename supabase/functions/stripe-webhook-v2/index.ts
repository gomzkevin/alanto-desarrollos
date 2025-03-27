
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import Stripe from 'https://esm.sh/stripe@14.0.0';

// Configuración de CORS para permitir solicitudes desde cualquier origen
// Importante: incluimos stripe-signature en los encabezados permitidos
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Max-Age": "86400",
};

// Este archivo debe configurarse en Supabase para NO requerir autenticación JWT
serve(async (req) => {
  console.log("Webhook v2: Solicitud recibida:", req.method, new URL(req.url).pathname);
  
  if (req.method === "OPTIONS") {
    console.log("Webhook v2: Manejando solicitud OPTIONS");
    return new Response(null, {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
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

    const rawBody = await req.text();
    console.log("Webhook v2: Longitud del cuerpo recibido:", rawBody.length);
    
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "whsec_Nc7JtPRL5RN953irfYvCDmzfBassGNqF";
    
    if (!stripeSecretKey) {
      console.error("Webhook v2: Configuración de Stripe incompleta - falta STRIPE_SECRET_KEY");
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

    let event;
    try {
      console.log("Webhook v2: Verificando firma con secreto:", webhookSecret.substring(0, 3) + "...");
      console.log("Webhook v2: Encabezado de firma:", signature);
      
      // Usar constructEventAsync en lugar de constructEvent
      event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
      
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

    console.log(`Webhook v2: Procesando evento: ${event.type}`);
    
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object, supabase);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object, supabase, stripe);
        break;
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

async function handleCheckoutSessionCompleted(session, supabase) {
  console.log('Webhook v2: Procesando evento checkout.session.completed:', JSON.stringify(session, null, 2));
  
  try {
    const { user_id, plan_id, empresa_id } = session.metadata || {};
    
    if (!user_id || !plan_id) {
      console.error("Webhook v2: Metadatos requeridos faltantes en la sesión:", session.metadata);
      return;
    }
    
    // Si tenemos un ID de suscripción de Stripe, verificamos si ya existe
    if (session.subscription) {
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
    }
    
    // Usamos upsert para evitar conflictos si la suscripción ya existe
    // pero capturamos el primer pago a través de checkout.session.completed
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id,
        plan_id,
        empresa_id: empresa_id || null,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        status: 'active', // Por defecto asumimos activa hasta que sepamos más
        current_period_start: new Date().toISOString(),
        current_period_end: null // Será actualizado cuando recibamos los detalles de la suscripción
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

// Nueva función separada para manejar específicamente eventos de suscripción creada
async function handleSubscriptionCreated(subscription, supabase, stripe) {
  console.log('Webhook v2: Procesando evento de suscripción creada ID:', subscription.id, 'Estado:', subscription.status);
  
  try {
    // Verificamos si la suscripción ya existe en nuestra base de datos
    const { data: existingSubscription, error: findError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscription.id)
      .maybeSingle();
      
    if (findError) {
      console.error("Webhook v2: Error verificando suscripción existente:", findError);
      throw findError;
    }
    
    if (existingSubscription) {
      console.log("Webhook v2: Actualizando suscripción existente con estado:", subscription.status);
      
      // Actualizamos la suscripción existente con los datos más recientes de Stripe
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
        console.error("Webhook v2: Error actualizando suscripción existente:", updateError);
        throw updateError;
      }
      
      console.log("Webhook v2: Suscripción existente actualizada con estado:", subscription.status);
      return;
    }
    
    // Si la suscripción no existe, necesitamos asegurarnos de que tengamos suficiente información
    // para crearla correctamente
    let userId = subscription.metadata?.user_id;
    let planId = subscription.metadata?.plan_id;
    let empresaId = subscription.metadata?.empresa_id;
    
    // Si no tenemos la información necesaria en los metadatos, intentamos obtenerla
    if (!userId || !planId) {
      console.log("Webhook v2: Información insuficiente en metadatos, buscando datos adicionales");
      
      // Intentamos encontrar el ID del plan a partir del precio
      if (!planId) {
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
            console.log("Webhook v2: Plan encontrado por precio:", planId);
          }
        }
      }
      
      // Si todavía no tenemos el user_id pero tenemos el email, buscamos el usuario
      if (!userId && subscription.customer_email) {
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', subscription.customer_email)
          .maybeSingle();
          
        if (!userError && userData) {
          userId = userData.auth_id;
          empresaId = userData.empresa_id;
          console.log("Webhook v2: Usuario encontrado por email:", userId);
        }
      }
    }
    
    // Si aún nos falta información crítica, no podemos continuar
    if (!userId || !planId) {
      console.error("Webhook v2: No se pudo determinar user_id o plan_id para la suscripción", subscription.id);
      return;
    }
    
    // Creamos una nueva suscripción
    const { data: newSubscription, error: insertError } = await supabase
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
      })
      .select()
      .single();
      
    if (insertError) {
      console.error("Webhook v2: Error creando nueva suscripción:", insertError);
      throw insertError;
    }
    
    console.log("Webhook v2: Nueva suscripción creada exitosamente:", newSubscription.id);
  } catch (error) {
    console.error("Webhook v2: Error en handleSubscriptionCreated:", error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription, supabase, stripe) {
  console.log('Webhook v2: Procesando evento de actualización de suscripción ID:', subscription.id, 'Estado:', subscription.status);
  
  try {
    // Verificamos primero si la suscripción existe en nuestra base de datos
    const { data: existingSubscription, error: findError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscription.id)
      .maybeSingle();
      
    if (findError) {
      console.error("Webhook v2: Error buscando suscripción para actualizar:", findError);
      throw findError;
    }
    
    // Si la suscripción no existe en nuestra base de datos, intentamos crearla
    if (!existingSubscription) {
      console.log("Webhook v2: Suscripción no encontrada para actualizar, intentando crear nueva");
      return await handleSubscriptionCreated(subscription, supabase, stripe);
    }
    
    // Actualizamos la suscripción con la información más reciente de Stripe
    console.log(`Webhook v2: Actualizando suscripción ${subscription.id} de estado ${existingSubscription.status} a ${subscription.status}`);
    
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status, // Actualizamos al estado más reciente de Stripe
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
    
    console.log("Webhook v2: Suscripción actualizada exitosamente con estado:", subscription.status);
  } catch (error) {
    console.error("Webhook v2: Error en handleSubscriptionUpdated:", error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription, supabase) {
  console.log('Webhook v2: Procesando evento de suscripción eliminada:', subscription.id);
  
  try {
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

async function handleInvoicePaymentSucceeded(invoice, supabase, stripe) {
  console.log('Webhook v2: Procesando evento invoice.payment_succeeded:', invoice.id);
  
  try {
    if (invoice.subscription) {
      const subscriptionId = invoice.subscription;
      console.log(`Webhook v2: Evento de pago exitoso para suscripción ${subscriptionId}`);
      
      // Obtenemos los detalles más recientes de la suscripción desde Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      console.log(`Webhook v2: Estado actual de la suscripción en Stripe: ${subscription.status}`);
      
      // Actualizamos la suscripción con los detalles más recientes
      await handleSubscriptionUpdated(subscription, supabase, stripe);
      
      console.log("Webhook v2: Suscripción actualizada después de pago exitoso");
    }
  } catch (error) {
    console.error("Webhook v2: Error en handleInvoicePaymentSucceeded:", error);
    throw error;
  }
}

async function handleInvoicePaymentFailed(invoice, supabase) {
  console.log('Webhook v2: Procesando evento invoice.payment_failed:', invoice.id);
  
  try {
    if (invoice.subscription) {
      const subscriptionId = invoice.subscription;
      
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
