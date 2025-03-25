
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
    const { priceId, planId, userId, successPath } = await req.json();

    // Initialize Stripe with your secret key from environment variables
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get subscription plan details for metadata
    const { data: planData, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError) {
      throw new Error(`Error fetching plan data: ${planError.message}`);
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
      customer_email: planData.email, // optional, useful if you have it
      client_reference_id: userId, // to link session to your user
      metadata: {
        user_id: userId,
        plan_id: planId,
        plan_name: planData.name,
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          plan_id: planId,
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
