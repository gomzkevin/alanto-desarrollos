
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
        current_period_end: null
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

async function handleSubscriptionUpdated(subscription, supabase, stripe) {
  console.log('Webhook v2: Procesando evento de actualización de suscripción ID:', subscription.id);
  
  try {
    if (!subscription.metadata?.plan_id) {
      console.log("Webhook v2: La suscripción carece de metadatos plan_id, intentando recuperar de items de suscripción");
      
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
          
        if (planError) {
          console.error("Webhook v2: Error encontrando plan por ID de precio:", planError);
        } else if (plans) {
          console.log("Webhook v2: Plan encontrado para ID de precio:", plans.id);
          
          await stripe.subscriptions.update(subscription.id, {
            metadata: {
              plan_id: plans.id,
              ...subscription.metadata
            }
          });
        }
      }
    }
    
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
      
      let customerId, userId, empresaId;
      
      userId = subscription.metadata?.user_id;
      empresaId = subscription.metadata?.empresa_id;
      
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
      
      let planId = subscription.metadata?.plan_id;
      
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
          }
        }
      }
      
      if (!planId) {
        console.error("Webhook v2: No se pudo determinar ID del plan para suscripción", subscription.id);
        return;
      }
      
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
      
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
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
