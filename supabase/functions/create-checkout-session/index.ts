
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
    
    // Log the Stripe secret key being used (last 4 chars)
    if (stripeSecretKey) {
      const lastFourChars = stripeSecretKey.slice(-4);
      console.log(`Using Stripe key ending in: ${lastFourChars}`);
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
      .maybeSingle();

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

    if (!userData) {
      console.error("User not found:", userId);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 404,
        }
      );
    }

    // Get subscription plan details for metadata
    const { data: planData, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .maybeSingle();

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

    if (!planData) {
      console.error("Plan not found:", planId);
      return new Response(
        JSON.stringify({ error: "Plan not found" }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 404,
        }
      );
    }

    // Determine the success and cancel URLs
    const domain = req.headers.get("origin") || "http://localhost:5173";
    const successUrl = `${domain}${successPath || "/dashboard/configuracion"}?success=true&plan_id=${planId}`;
    const cancelUrl = `${domain}${successPath || "/dashboard/configuracion"}?canceled=true`;

    console.log("Creating Stripe checkout session with: ", { 
      priceId, 
      domain,
      successUrl, 
      cancelUrl,
      customerEmail: userData.email
    });

    try {
      // Create the checkout session with simplified parameters based on Stripe's example
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: userData.email,
        client_reference_id: userId,
        metadata: {
          user_id: userId,
          plan_id: planId,
          empresa_id: userData.empresa_id,
        },
      });

      console.log("Stripe checkout session created successfully:", session.id);
      console.log("Session URL:", session.url);

      // Return the session URL for redirection with clear cache control
      return new Response(
        JSON.stringify({ 
          url: session.url,
          sessionId: session.id
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate"
          },
          status: 200,
        }
      );
    } catch (stripeError) {
      console.error("Stripe checkout creation error:", stripeError);
      return new Response(
        JSON.stringify({ 
          error: stripeError.message || "Error creating Stripe checkout session",
          details: stripeError
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
  } catch (error) {
    console.error("General error creating checkout session:", error);
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
