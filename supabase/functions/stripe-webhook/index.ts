
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import Stripe from 'https://esm.sh/stripe@14.0.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  console.log("Received webhook request");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response(null, {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    // Only process POST requests for the webhook
    if (req.method !== "POST") {
      console.error(`Unsupported method: ${req.method}`);
      return new Response(
        JSON.stringify({ error: `Method ${req.method} not allowed` }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 405,
        }
      );
    }

    // Get the stripe signature from the headers
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      console.error("Missing Stripe signature");
      return new Response(
        JSON.stringify({ error: "Missing Stripe signature" }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 400,
        }
      );
    }

    // Get the raw body as text - IMPORTANT: do not parse as JSON to avoid modifying the raw body
    const body = await req.text();
    console.log("Received webhook body length:", body.length);
    
    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "whsec_Nc7JtPRL5RN953irfYvCDmzfBassGNqF";
    
    if (!stripeSecretKey || !webhookSecret) {
      console.error("Missing Stripe configuration", { 
        hasStripeKey: !!stripeSecretKey, 
        hasWebhookSecret: !!webhookSecret 
      });
      return new Response(
        JSON.stringify({ error: "Stripe is not configured correctly" }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 500,
        }
      );
    }

    console.log("Stripe configuration found, initializing client");
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-02-24.acacia", // Using the specified API version
    });

    // Verify webhook signature and construct event
    let event;
    try {
      console.log("Verifying webhook signature with secret:", webhookSecret.substring(0, 5) + "...");
      console.log("Signature header:", signature);
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log(`Webhook signature verification successful for event: ${event.type}`);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 401, // Changed to 401 for authentication failure
        }
      );
    }

    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase credentials are not configured");
      return new Response(
        JSON.stringify({ error: "Supabase configuration is missing" }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 500,
        }
      );
    }
    
    console.log("Supabase configuration found, initializing client");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle the event
    console.log(`Processing event: ${event.type}`);
    
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
        console.log(`Unhandled event type: ${event.type}`);
    }

    console.log("Webhook processed successfully");
    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unexpected error occurred",
        stack: error.stack 
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

// Handler for checkout.session.completed event
async function handleCheckoutSessionCompleted(session, supabase) {
  console.log('Processing checkout.session.completed event:', JSON.stringify(session, null, 2));
  
  try {
    // Extract metadata from the session
    const { user_id, plan_id, empresa_id } = session.metadata || {};
    
    if (!user_id || !plan_id) {
      console.error("Missing required metadata in session:", session.metadata);
      return;
    }
    
    // Check if the subscription was already created by another event
    const { data: existingSubscription, error: checkError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', session.subscription)
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking for existing subscription:", checkError);
      throw checkError;
    }
    
    if (existingSubscription) {
      console.log("Subscription already exists, skipping creation:", existingSubscription.id);
      return;
    }
    
    // Create a new subscription record
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
        current_period_end: null  // Will be updated when we receive the subscription details
      })
      .select()
      .single();
      
    if (subscriptionError) {
      console.error("Error creating subscription:", subscriptionError);
      throw subscriptionError;
    }
    
    console.log("Subscription created successfully:", subscription.id);
    
  } catch (error) {
    console.error("Error in handleCheckoutSessionCompleted:", error);
    throw error;
  }
}

// Handler for customer.subscription.created or customer.subscription.updated events
async function handleSubscriptionUpdated(subscription, supabase, stripe) {
  console.log('Processing subscription update event for subscription ID:', subscription.id);
  
  try {
    // If subscription was just created, let's make sure we have the plan data
    if (!subscription.metadata?.plan_id) {
      console.log("Subscription lacks plan_id metadata, attempting to retrieve from subscription items");
      
      // Get the subscription items to identify the price/plan
      const subscriptionItems = await stripe.subscriptionItems.list({
        subscription: subscription.id,
      });
      
      if (subscriptionItems.data.length > 0) {
        const priceId = subscriptionItems.data[0].price.id;
        
        // Look up the plan with this price ID
        const { data: plans, error: planError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('stripe_price_id', priceId)
          .maybeSingle();
          
        if (planError) {
          console.error("Error finding plan by price ID:", planError);
        } else if (plans) {
          console.log("Found matching plan for price ID:", plans.id);
          
          // Update the subscription metadata on Stripe
          await stripe.subscriptions.update(subscription.id, {
            metadata: {
              plan_id: plans.id,
              ...subscription.metadata
            }
          });
        }
      }
    }
    
    // Find the subscription in our database
    const { data: subscriptionData, error: findError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscription.id)
      .maybeSingle();
      
    if (findError) {
      console.error("Error finding subscription:", findError);
      throw findError;
    }
    
    if (!subscriptionData) {
      console.log("Subscription not found in database, creating new record");
      
      // Find the customer information
      let customerId, userId, empresaId;
      
      // First try to extract from metadata
      userId = subscription.metadata?.user_id;
      empresaId = subscription.metadata?.empresa_id;
      
      // If not in metadata, try to get user from customer email
      if (!userId && subscription.customer_email) {
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', subscription.customer_email)
          .maybeSingle();
          
        if (userError) {
          console.error("Error finding user by email:", userError);
        } else if (userData) {
          userId = userData.auth_id;
          empresaId = userData.empresa_id;
        }
      }
      
      if (!userId) {
        console.error("Could not determine user ID for subscription", subscription.id);
        return;
      }
      
      // Determine plan ID from metadata or subscription items
      let planId = subscription.metadata?.plan_id;
      
      if (!planId) {
        // Try to find the plan by the price ID
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
        console.error("Could not determine plan ID for subscription", subscription.id);
        return;
      }
      
      // Create new subscription record
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
        console.error("Error creating new subscription:", insertError);
        throw insertError;
      }
      
      console.log("New subscription record created successfully");
      return;
    }
    
    // Update the subscription with the latest data from Stripe
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
      console.error("Error updating subscription:", updateError);
      throw updateError;
    }
    
    console.log("Subscription updated successfully");
    
  } catch (error) {
    console.error("Error in handleSubscriptionUpdated:", error);
    throw error;
  }
}

// Handler for customer.subscription.deleted event
async function handleSubscriptionDeleted(subscription, supabase) {
  console.log('Processing subscription deleted event:', subscription.id);
  
  try {
    // Update the subscription status to cancelled
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);
      
    if (updateError) {
      console.error("Error cancelling subscription:", updateError);
      throw updateError;
    }
    
    console.log("Subscription cancelled successfully");
    
  } catch (error) {
    console.error("Error in handleSubscriptionDeleted:", error);
    throw error;
  }
}

// Handler for invoice.payment_succeeded event
async function handleInvoicePaymentSucceeded(invoice, supabase, stripe) {
  console.log('Processing invoice.payment_succeeded event:', invoice.id);
  
  try {
    // If this is a subscription-related invoice, update our subscription
    if (invoice.subscription) {
      const subscriptionId = invoice.subscription;
      
      // Get the subscription details from Stripe to ensure we have the latest data
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      // Update or create the subscription in our database
      await handleSubscriptionUpdated(subscription, supabase, stripe);
      
      console.log("Subscription updated after successful payment");
    }
  } catch (error) {
    console.error("Error in handleInvoicePaymentSucceeded:", error);
    throw error;
  }
}

// Handler for invoice.payment_failed event
async function handleInvoicePaymentFailed(invoice, supabase) {
  console.log('Processing invoice.payment_failed event:', invoice.id);
  
  try {
    // If this is a subscription-related invoice, update our subscription
    if (invoice.subscription) {
      const subscriptionId = invoice.subscription;
      
      // Update the subscription status in our database
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status: 'past_due', // or another appropriate status
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscriptionId);
        
      if (updateError) {
        console.error("Error updating subscription after payment failure:", updateError);
        throw updateError;
      }
      
      console.log("Subscription status updated after payment failure");
    }
  } catch (error) {
    console.error("Error in handleInvoicePaymentFailed:", error);
    throw error;
  }
}
