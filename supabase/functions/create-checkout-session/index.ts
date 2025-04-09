
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import Stripe from 'https://esm.sh/stripe@14.0.0';

// Configuración de CORS para permitir solicitudes desde cualquier origen
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  // Manejo de preflight requests CORS
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response(null, {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    // Verificar que sea una solicitud POST
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

    // Obtener el cuerpo de la solicitud
    const body = await req.json();
    const { priceId, planId, userId, empresaId, email, successPath } = body;

    console.log("Received request body:", JSON.stringify(body, null, 2));

    if (!priceId || !planId || !userId) {
      console.error("Missing required parameters:", { priceId, planId, userId });
      return new Response(
        JSON.stringify({ error: "Missing required parameters: priceId, planId, or userId" }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 400,
        }
      );
    }

    // Inicializar cliente Supabase
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

    // Inicializar Stripe con la clave secreta de producción
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    if (!stripeSecretKey) {
      console.error("Missing Stripe configuration");
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

    console.log("Creating checkout session for plan:", planId, "user:", userId);
    
    // Determinar la URL base para redirección
    const origin = req.headers.get("origin") || "https://desarrollos.alanto.mx";
    const successUrl = `${origin}${successPath || "/dashboard/configuracion"}?success=true&plan_id=${planId}`;
    const cancelUrl = `${origin}${successPath || "/dashboard/configuracion"}?canceled=true`;
    
    // Verificar si tenemos un empresaId o necesitamos obtenerlo
    let userEmpresaId = empresaId;
    let userEmail = email;
    
    if (!userEmpresaId || !userEmail) {
      // Obtener información del usuario
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('empresa_id, email')
        .eq('auth_id', userId)
        .single();
        
      if (userError) {
        console.error("Error retrieving user data:", userError);
        return new Response(
          JSON.stringify({ error: "Could not find user information" }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
            status: 404,
          }
        );
      }
      
      userEmpresaId = userData.empresa_id;
      userEmail = userData.email;
    }
    
    console.log("Creating Stripe checkout session with: ", {
      priceId,
      domain: origin,
      successUrl,
      cancelUrl,
      customerEmail: userEmail,
      metadata: {
        user_id: userId,
        plan_id: planId,
        empresa_id: userEmpresaId
      }
    });

    // Updated to use the production Stripe API key
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-02-24.acacia", // Ver de actualizar esto según la versión compatible
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Crear parámetros para la sesión de checkout
    const sessionParams = {
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: {
        user_id: userId,
        plan_id: planId,
        empresa_id: userEmpresaId
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          plan_id: planId,
          empresa_id: userEmpresaId
        }
      }
    };
    
    console.log("Creating session with params:", JSON.stringify(sessionParams, null, 2));

    // Crear sesión de checkout
    const session = await stripe.checkout.sessions.create(sessionParams);
    
    console.log("Stripe checkout session created successfully:", session.id);
    console.log("Session URL:", session.url);

    // Devolver URL de la sesión de checkout
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
      JSON.stringify({ 
        error: error.message || "An unexpected error occurred",
        details: error.toString()
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
