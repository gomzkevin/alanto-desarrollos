-- FIX CRITICAL SECURITY WARNINGS (CORRECTED)
-- Note: Views cannot have RLS enabled, only base tables can

-- 1. Enable RLS only on base tables (not views)
ALTER TABLE public.desarrollo_imagenes ENABLE ROW LEVEL SECURITY;

-- Drop insecure public policies on desarrollo_imagenes
DROP POLICY IF EXISTS "Public Read" ON public.desarrollo_imagenes;
DROP POLICY IF EXISTS "Public Insert" ON public.desarrollo_imagenes;
DROP POLICY IF EXISTS "Public Update" ON public.desarrollo_imagenes;
DROP POLICY IF EXISTS "Public Delete" ON public.desarrollo_imagenes;

-- Create secure policies for desarrollo_imagenes
CREATE POLICY "Users can view own company desarrollo images" 
ON public.desarrollo_imagenes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.desarrollos d
    JOIN public.usuarios u ON u.empresa_id = d.empresa_id
    WHERE d.id = desarrollo_imagenes.desarrollo_id
    AND u.auth_id = auth.uid()
    AND u.activo = true
  )
);

CREATE POLICY "Users can insert images for own company desarrollos" 
ON public.desarrollo_imagenes 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.desarrollos d
    JOIN public.usuarios u ON u.empresa_id = d.empresa_id
    WHERE d.id = desarrollo_imagenes.desarrollo_id
    AND u.auth_id = auth.uid()
    AND u.activo = true
  )
);

CREATE POLICY "Users can update own company desarrollo images" 
ON public.desarrollo_imagenes 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.desarrollos d
    JOIN public.usuarios u ON u.empresa_id = d.empresa_id
    WHERE d.id = desarrollo_imagenes.desarrollo_id
    AND u.auth_id = auth.uid()
    AND u.activo = true
  )
);

CREATE POLICY "Users can delete own company desarrollo images" 
ON public.desarrollo_imagenes 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.desarrollos d
    JOIN public.usuarios u ON u.empresa_id = d.empresa_id
    WHERE d.id = desarrollo_imagenes.desarrollo_id
    AND u.auth_id = auth.uid()
    AND u.activo = true
  )
);

-- 2. Fix all function search_path security issues
-- Update all existing functions to have secure search_path

-- Fix count_company_resources function
CREATE OR REPLACE FUNCTION public.count_company_resources(company_id integer, resource_type text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  resource_count INTEGER := 0;
BEGIN
  IF resource_type = 'desarrollo' THEN
    SELECT COUNT(*) INTO resource_count
    FROM public.desarrollos
    WHERE empresa_id = company_id;
    
  ELSIF resource_type = 'prototipo' THEN
    SELECT COUNT(p.id) INTO resource_count
    FROM public.prototipos p
    JOIN public.desarrollos d ON p.desarrollo_id = d.id
    WHERE d.empresa_id = company_id;
    
  ELSIF resource_type = 'vendedor' THEN
    SELECT COUNT(*) INTO resource_count
    FROM public.usuarios
    WHERE empresa_id = company_id AND rol = 'vendedor' AND activo = true;
  END IF;

  RETURN resource_count;
END;
$function$;

-- Fix verificar_invitacion function
CREATE OR REPLACE FUNCTION public.verificar_invitacion(token_invitacion text)
RETURNS TABLE(id uuid, empresa_id integer, email text, rol text, estado text, es_valida boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.empresa_id,
    i.email,
    i.rol,
    i.estado,
    (i.estado = 'pendiente' AND i.fecha_expiracion > now()) AS es_valida
  FROM public.invitaciones_empresa i
  WHERE i.token = token_invitacion;
END;
$function$;

-- Fix has_active_subscription function
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.subscriptions 
    WHERE user_id = user_uuid 
    AND status = 'active'
  );
END;
$function$;

-- Fix has_column function
CREATE OR REPLACE FUNCTION public.has_column(table_name text, column_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  column_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = $1
      AND column_name = $2
  ) INTO column_exists;
  
  RETURN column_exists;
END;
$function$;

-- Fix check_subscription_limit function
CREATE OR REPLACE FUNCTION public.check_subscription_limit(company_id integer, resource_type text, resources_to_add integer DEFAULT 1)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  current_count INTEGER;
  resource_limit INTEGER;
  active_subscription RECORD;
BEGIN
  SELECT s.*, sp.features INTO active_subscription
  FROM public.subscriptions s
  JOIN public.subscription_plans sp ON s.plan_id = sp.id
  WHERE s.empresa_id = company_id AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  IF active_subscription IS NULL THEN
    RETURN FALSE;
  END IF;
  
  current_count := public.count_company_resources(company_id, resource_type);
  
  IF resource_type = 'desarrollo' AND active_subscription.features->>'tipo' = 'desarrollo' THEN
    resource_limit := (active_subscription.features->>'max_recursos')::INTEGER;
  ELSIF resource_type = 'prototipo' AND active_subscription.features->>'tipo' = 'prototipo' THEN
    resource_limit := (active_subscription.features->>'max_recursos')::INTEGER;
  ELSIF resource_type = 'vendedor' THEN
    resource_limit := (active_subscription.features->>'max_vendedores')::INTEGER;
  ELSE
    resource_limit := NULL;
  END IF;
  
  IF resource_limit IS NULL THEN
    RETURN TRUE;
  END IF;
  
  RETURN (current_count + resources_to_add) <= resource_limit;
END;
$function$;

-- Fix get_company_subscription_status function
CREATE OR REPLACE FUNCTION public.get_company_subscription_status(company_id integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  result JSONB;
  subscription RECORD;
  resource_counts RECORD;
BEGIN
  SELECT 
    s.*,
    sp.name as plan_name,
    sp.description as plan_description,
    sp.price as plan_price,
    sp.interval as plan_interval,
    sp.features as plan_features
  INTO subscription
  FROM subscriptions s
  JOIN subscription_plans sp ON s.plan_id = sp.id
  WHERE s.empresa_id = company_id 
    AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  IF subscription IS NULL THEN
    RETURN jsonb_build_object(
      'isActive', false,
      'subscription', NULL,
      'resourceCounts', jsonb_build_object(
        'desarrollos', 0,
        'prototipos', 0,
        'vendedores', 0,
        'leads', 0,
        'ventas', 0
      ),
      'limits', jsonb_build_object(
        'maxRecursos', 0,
        'maxVendedores', 0,
        'tipo', NULL
      )
    );
  END IF;
  
  SELECT
    COALESCE(COUNT(DISTINCT d.id), 0) as desarrollos_count,
    COALESCE(COUNT(DISTINCT p.id), 0) as prototipos_count,
    COALESCE(COUNT(DISTINCT u.id) FILTER (WHERE u.rol = 'vendedor' AND u.activo = true), 0) as vendedores_count,
    COALESCE(COUNT(DISTINCT l.id), 0) as leads_count,
    COALESCE(COUNT(DISTINCT v.id), 0) as ventas_count
  INTO resource_counts
  FROM empresa_info e
  LEFT JOIN desarrollos d ON e.id = d.empresa_id
  LEFT JOIN prototipos p ON d.id = p.desarrollo_id
  LEFT JOIN usuarios u ON e.id = u.empresa_id
  LEFT JOIN leads l ON e.id = l.empresa_id
  LEFT JOIN ventas v ON v.unidad_id IN (
    SELECT un.id FROM unidades un 
    JOIN prototipos pr ON un.prototipo_id = pr.id 
    JOIN desarrollos dr ON pr.desarrollo_id = dr.id 
    WHERE dr.empresa_id = e.id
  )
  WHERE e.id = company_id;
  
  result := jsonb_build_object(
    'isActive', true,
    'subscription', jsonb_build_object(
      'id', subscription.id,
      'status', subscription.status,
      'currentPeriodStart', subscription.current_period_start,
      'currentPeriodEnd', subscription.current_period_end,
      'cancelAtPeriodEnd', subscription.cancel_at_period_end,
      'stripeCustomerId', subscription.stripe_customer_id,
      'stripeSubscriptionId', subscription.stripe_subscription_id
    ),
    'plan', jsonb_build_object(
      'id', subscription.plan_id,
      'name', subscription.plan_name,
      'description', subscription.plan_description,
      'price', subscription.plan_price,
      'interval', subscription.plan_interval,
      'features', subscription.plan_features
    ),
    'resourceCounts', jsonb_build_object(
      'desarrollos', resource_counts.desarrollos_count,
      'prototipos', resource_counts.prototipos_count,
      'vendedores', resource_counts.vendedores_count,
      'leads', resource_counts.leads_count,
      'ventas', resource_counts.ventas_count
    ),
    'limits', jsonb_build_object(
      'maxRecursos', (subscription.plan_features->>'max_recursos')::INTEGER,
      'maxVendedores', (subscription.plan_features->>'max_vendedores')::INTEGER,
      'tipo', subscription.plan_features->>'tipo'
    )
  );
  
  RETURN result;
END;
$function$;

-- Fix get_revenue_by_period function
CREATE OR REPLACE FUNCTION public.get_revenue_by_period(company_id integer, period_months integer DEFAULT 6)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  revenue_data JSONB := '[]'::jsonb;
  month_record RECORD;
BEGIN
  FOR month_record IN
    WITH months AS (
      SELECT 
        date_trunc('month', CURRENT_DATE - (i || ' months')::interval) as month_start,
        to_char(CURRENT_DATE - (i || ' months')::interval, 'Mon') as month_name
      FROM generate_series(period_months - 1, 0, -1) as i
    )
    SELECT 
      m.month_name,
      COALESCE(SUM(pg.monto), 0) as ingresos
    FROM months m
    LEFT JOIN pagos pg ON date_trunc('month', pg.fecha) = m.month_start
      AND pg.estado = 'registrado'
      AND pg.comprador_venta_id IN (
        SELECT cv.id FROM compradores_venta cv
        JOIN ventas v ON cv.venta_id = v.id
        JOIN unidades u ON v.unidad_id = u.id
        JOIN prototipos p ON u.prototipo_id = p.id
        JOIN desarrollos d ON p.desarrollo_id = d.id
        WHERE d.empresa_id = company_id
      )
    GROUP BY m.month_name, m.month_start
    ORDER BY m.month_start
  LOOP
    revenue_data := revenue_data || jsonb_build_object(
      'name', month_record.month_name,
      'ingresos', month_record.ingresos
    );
  END LOOP;
  
  RETURN revenue_data;
END;
$function$;

-- Fix get_subscription_status function
CREATE OR REPLACE FUNCTION public.get_subscription_status(company_id integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  result JSONB;
  subscription RECORD;
  plan RECORD;
  desarrollo_count INTEGER;
  prototipo_count INTEGER;
  vendedor_count INTEGER;
  resource_type TEXT;
  resource_limit INTEGER;
  resource_count INTEGER;
BEGIN
  SELECT s.*, sp.* INTO subscription
  FROM public.subscriptions s
  JOIN public.subscription_plans sp ON s.plan_id = sp.id
  WHERE s.empresa_id = company_id AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  IF subscription IS NULL THEN
    RETURN jsonb_build_object(
      'isActive', false,
      'resourceType', NULL,
      'resourceLimit', NULL,
      'resourceCount', 0,
      'vendorLimit', NULL,
      'vendorCount', 0
    );
  END IF;
  
  desarrollo_count := public.count_company_resources(company_id, 'desarrollo');
  prototipo_count := public.count_company_resources(company_id, 'prototipo');
  vendedor_count := public.count_company_resources(company_id, 'vendedor');
  
  resource_type := subscription.features->>'tipo';
  
  IF resource_type = 'desarrollo' THEN
    resource_count := desarrollo_count;
  ELSIF resource_type = 'prototipo' THEN
    resource_count := prototipo_count;
  ELSE
    resource_count := 0;
  END IF;
  
  resource_limit := (subscription.features->>'max_recursos')::INTEGER;
  
  result := jsonb_build_object(
    'isActive', subscription.status = 'active',
    'currentPlan', jsonb_build_object(
      'id', subscription.id,
      'name', subscription.name,
      'price', subscription.price,
      'interval', subscription.interval,
      'features', subscription.features
    ),
    'renewalDate', subscription.current_period_end,
    'resourceType', resource_type,
    'resourceLimit', resource_limit,
    'resourceCount', resource_count,
    'vendorLimit', (subscription.features->>'max_vendedores')::INTEGER,
    'vendorCount', vendedor_count
  );
  
  RETURN result;
END;
$function$;

-- Fix get_user_subscription_status function
CREATE OR REPLACE FUNCTION public.get_user_subscription_status(user_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_empresa_id INTEGER;
  subscription_status JSONB;
BEGIN
  SELECT empresa_id INTO user_empresa_id 
  FROM public.usuarios 
  WHERE id = user_uuid;
  
  IF user_empresa_id IS NULL THEN
    RETURN jsonb_build_object(
      'isActive', false,
      'currentPlan', NULL,
      'renewalDate', NULL
    );
  END IF;
  
  SELECT jsonb_build_object(
    'isActive', s.status = 'active',
    'currentPlan', jsonb_build_object(
      'id', sp.id,
      'name', sp.name,
      'price', sp.price,
      'interval', sp.interval,
      'features', sp.features
    ),
    'renewalDate', s.current_period_end,
    'empresa_id', user_empresa_id
  ) INTO subscription_status
  FROM public.subscriptions s
  JOIN public.subscription_plans sp ON s.plan_id = sp.id
  WHERE s.empresa_id = user_empresa_id AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  IF subscription_status IS NULL THEN
    RETURN jsonb_build_object(
      'isActive', false,
      'currentPlan', NULL,
      'renewalDate', NULL,
      'empresa_id', user_empresa_id
    );
  END IF;
  
  RETURN subscription_status;
END;
$function$;

-- Fix user_belongs_to_company function
CREATE OR REPLACE FUNCTION public.user_belongs_to_company(user_uuid uuid, company_id integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.usuarios u 
    WHERE u.auth_id = user_uuid 
    AND u.empresa_id = company_id
    AND u.activo = true
  );
END;
$$;

-- Fix audit_log_trigger function
CREATE OR REPLACE FUNCTION public.audit_log_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE NOTICE 'AUDIT: % deleted from % by user %', OLD.id, TG_TABLE_NAME, auth.uid();
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    RAISE NOTICE 'AUDIT: % updated in % by user %', NEW.id, TG_TABLE_NAME, auth.uid();
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    RAISE NOTICE 'AUDIT: % inserted into % by user %', NEW.id, TG_TABLE_NAME, auth.uid();
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;