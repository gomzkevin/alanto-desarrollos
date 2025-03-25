
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import Stripe from 'https://esm.sh/stripe@14.0.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    // Get request body
    const requestData = await req.json();
    const { priceId, planId, userId, successPath } = requestData;
    
    console.log("Creating checkout session for plan:", planId, "user:", userId);
    
    // Validación de datos de entrada
    if (!priceId || !planId || !userId) {
      console.error("Missing required parameters:", { priceId, planId, userId });
      return new Response(
        JSON.stringify({ error: "Missing required parameters. Need priceId, planId, and userId." }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 400,
        }
      );
    }

    // Initialize Stripe with your secret key from environment variables
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY is not configured");
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
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

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
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user information to associate with the subscription
    const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .select("*, empresas:empresa_id(*)")
      .eq("auth_id", userId)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError.message);
      return new Response(
        JSON.stringify({ error: `Error fetching user data: ${userError.message}` }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 500,
        }
      );
    }

    // Get subscription plan details for metadata
    const { data: planData, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError) {
      console.error("Error fetching plan data:", planError.message);
      return new Response(
        JSON.stringify({ error: `Error fetching plan data: ${planError.message}` }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 500,
        }
      );
    }

    // Determine the success and cancel URLs
    const domain = req.headers.get("origin") || "http://localhost:5173";
    const successUrl = `${domain}${successPath || "/dashboard/configuracion"}?success=true&plan_id=${planId}`;
    const cancelUrl = `${domain}${successPath || "/dashboard/configuracion"}?canceled=true`;

    // Create a checkout session with Stripe
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId, // Stripe price ID
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: userData.email, // Use email from the user data
      client_reference_id: userId, // to link session to your user
      metadata: {
        user_id: userId,
        plan_id: planId,
        empresa_id: userData.empresa_id,
        plan_name: planData.name,
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          plan_id: planId,
          empresa_id: userData.empresa_id,
        },
      },
    });

    // Return the session URL for redirection
    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
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
