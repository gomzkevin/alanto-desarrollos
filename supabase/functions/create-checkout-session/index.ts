
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Stripe } from "https://esm.sh/stripe@12.18.0?target=deno";

// Initialize Stripe with the API key from environment variables
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapping of plan types to Stripe products
const STRIPE_PRODUCTS = {
  desarrollo: 'prod_RyqU9V2MUpdoAE', // Development Plan
  prototipo: 'prod_RyqQdayNykeJTM',  // Prototype Plan
};

serve(async (req) => {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request data
    const { planId, userId, successUrl, cancelUrl } = await req.json();
    
    if (!planId || !userId || !successUrl || !cancelUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log("Creating checkout session for plan:", planId, "user:", userId);

    // Get plan details from Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const planResponse = await fetch(
      `${supabaseUrl}/rest/v1/subscription_plans?id=eq.${planId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const planData = await planResponse.json();

    if (!planData || planData.length === 0) {
      console.error('Plan not found:', planId);
      return new Response(
        JSON.stringify({ error: 'Plan not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const plan = planData[0];
    console.log("Found plan:", plan.name);
    
    // Get user information
    const userResponse = await fetch(
      `${supabaseUrl}/rest/v1/usuarios?auth_id=eq.${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const userData = await userResponse.json();

    if (!userData || userData.length === 0) {
      console.error('User not found:', userId);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const user = userData[0];
    console.log("Found user:", user.email);

    // Check if user already has a Stripe customer ID
    let customerId;
    const subscriptionResponse = await fetch(
      `${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const subscriptionData = await subscriptionResponse.json();

    // If user already has a Stripe customer, use it
    if (subscriptionData && subscriptionData.length > 0 && subscriptionData[0].stripe_customer_id) {
      customerId = subscriptionData[0].stripe_customer_id;
      console.log("Using existing customer ID:", customerId);
    } else {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.nombre,
        metadata: {
          userId: userId,
          empresaId: user.empresa_id?.toString() || ''
        }
      });
      
      customerId = customer.id;
      console.log("Created new customer ID:", customerId);
    }

    // Determine which Stripe product to use based on plan type
    let stripeProductId;
    if (plan.features && typeof plan.features === 'object' && plan.features.tipo) {
      stripeProductId = STRIPE_PRODUCTS[plan.features.tipo];
      console.log("Using product ID for type:", plan.features.tipo, stripeProductId);
    }

    // Create a Stripe checkout session
    let session;
    if (plan.stripe_price_id) {
      // If the plan already has a Stripe price ID, use it
      console.log("Using existing price ID:", plan.stripe_price_id);
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
    } else if (stripeProductId) {
      // If we have a product ID based on plan type, create a new price
      console.log("Creating new price for product:", stripeProductId);
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price_data: {
              currency: 'mxn',
              product: stripeProductId,
              unit_amount: Math.round(plan.price * 100), // Stripe uses cents
              recurring: {
                interval: plan.interval === 'month' ? 'month' : 'year',
                usage_type: 'licensed',
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
    } else {
      // If no product or price ID, create a temporary product
      console.log("Creating temporary product and price");
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
              unit_amount: Math.round(plan.price * 100), // Stripe uses cents
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

    console.log("Created checkout session:", session.id, "URL:", session.url);

    // Prepare response with checkout URL
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
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});
