-- ============================================
-- FASE 1: Actualizar Estructura de Planes
-- ============================================

-- Crear tabla de feature flags
CREATE TABLE IF NOT EXISTS public.plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  required_plan_level INTEGER NOT NULL, -- 0=Free, 1=Basic, 2=Grow, 3=Enterprise
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en plan_features
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;

-- Política para que todos los usuarios autenticados puedan ver features
DROP POLICY IF EXISTS "Authenticated users can view plan features" ON public.plan_features;
CREATE POLICY "Authenticated users can view plan features"
ON public.plan_features
FOR SELECT
TO authenticated
USING (true);

-- Insertar features premium
INSERT INTO public.plan_features (feature_key, display_name, description, required_plan_level) VALUES
  ('analytics_avanzado', 'Proyecciones y Analytics', 'Acceso completo a proyecciones financieras y análisis avanzado', 1),
  ('exportacion_avanzada', 'Exportación Avanzada', 'Exportar cotizaciones y reportes a PDF con personalización completa', 1),
  ('api_access', 'API Access', 'Acceso a API REST, webhooks y integraciones externas', 2),
  ('audit_logs', 'Registros de Auditoría', 'Logs detallados de todas las acciones y eventos de seguridad', 2),
  ('white_label', 'White Label', 'Personalización completa de marca y dominio personalizado', 3),
  ('soporte_prioritario', 'Soporte Prioritario', 'Soporte técnico con respuesta prioritaria', 1),
  ('soporte_247', 'Soporte 24/7', 'Soporte técnico disponible 24 horas al día, 7 días a la semana', 2)
ON CONFLICT (feature_key) DO NOTHING;

-- ============================================
-- FASE 2: Sistema de Feature Gating
-- ============================================

-- Función para verificar acceso a features según el plan
CREATE OR REPLACE FUNCTION public.has_feature_access(
  p_company_id INTEGER,
  p_feature_key TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan_level INTEGER;
  v_required_level INTEGER;
  v_plan_name TEXT;
BEGIN
  -- Obtener el plan actual de la empresa
  SELECT 
    sp.name INTO v_plan_name
  FROM public.subscriptions s
  JOIN public.subscription_plans sp ON s.plan_id = sp.id
  WHERE s.empresa_id = p_company_id 
    AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- Si no hay suscripción activa, es plan Free (nivel 0)
  IF v_plan_name IS NULL THEN
    v_plan_level := 0;
  ELSE
    -- Mapear nombre de plan a nivel
    v_plan_level := CASE v_plan_name
      WHEN 'Free' THEN 0
      WHEN 'Basic' THEN 1
      WHEN 'Grow' THEN 2
      WHEN 'Enterprise' THEN 3
      ELSE 0
    END;
  END IF;
  
  -- Obtener nivel requerido para la feature
  SELECT required_plan_level INTO v_required_level
  FROM public.plan_features
  WHERE feature_key = p_feature_key;
  
  -- Si la feature no existe, denegar acceso por seguridad
  IF v_required_level IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar si el plan actual cumple con el nivel requerido
  RETURN v_plan_level >= v_required_level;
END;
$$;

-- ============================================
-- Actualizar planes existentes con nueva estructura
-- ============================================

-- Agregar constraint UNIQUE en name si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'subscription_plans_name_key'
  ) THEN
    ALTER TABLE public.subscription_plans ADD CONSTRAINT subscription_plans_name_key UNIQUE (name);
  END IF;
END $$;

-- Actualizar plan Free si existe, o insertarlo
INSERT INTO public.subscription_plans (name, description, price, interval, features, stripe_price_id)
VALUES (
  'Free',
  'Perfecto para probar la plataforma',
  0,
  'month',
  jsonb_build_object(
    'max_desarrollos', 1,
    'max_prototipos', 1,
    'max_vendedores', 1,
    'analytics_avanzado', false,
    'exportacion_avanzada', false,
    'api_access', false,
    'white_label', false,
    'audit_logs', false,
    'soporte_prioritario', false,
    'soporte_247', false
  ),
  NULL
)
ON CONFLICT (name) 
DO UPDATE SET
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  interval = EXCLUDED.interval,
  features = EXCLUDED.features;

-- Insertar plan Basic
INSERT INTO public.subscription_plans (name, description, price, interval, features)
VALUES (
  'Basic',
  'Para equipos que están creciendo',
  1899, -- $1,899 MXN
  'month',
  jsonb_build_object(
    'max_desarrollos', 2,
    'max_prototipos', 5,
    'max_vendedores', 5,
    'analytics_avanzado', true,
    'exportacion_avanzada', true,
    'api_access', false,
    'white_label', false,
    'audit_logs', false,
    'soporte_prioritario', true,
    'soporte_247', false
  )
)
ON CONFLICT (name) 
DO UPDATE SET
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  interval = EXCLUDED.interval,
  features = EXCLUDED.features;

-- Insertar plan Grow
INSERT INTO public.subscription_plans (name, description, price, interval, features)
VALUES (
  'Grow',
  'Para empresas establecidas',
  5699, -- $5,699 MXN
  'month',
  jsonb_build_object(
    'max_desarrollos', 4,
    'max_prototipos', 20,
    'max_vendedores', 10,
    'analytics_avanzado', true,
    'exportacion_avanzada', true,
    'api_access', true,
    'white_label', false,
    'audit_logs', true,
    'soporte_prioritario', true,
    'soporte_247', true
  )
)
ON CONFLICT (name)
DO UPDATE SET
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  interval = EXCLUDED.interval,
  features = EXCLUDED.features;

-- Insertar plan Enterprise
INSERT INTO public.subscription_plans (name, description, price, interval, features)
VALUES (
  'Enterprise',
  'Soluciones a medida para grandes empresas',
  0, -- Precio personalizado
  'month',
  jsonb_build_object(
    'max_desarrollos', 999,
    'max_prototipos', 999,
    'max_vendedores', 999,
    'analytics_avanzado', true,
    'exportacion_avanzada', true,
    'api_access', true,
    'white_label', true,
    'audit_logs', true,
    'soporte_prioritario', true,
    'soporte_247', true
  )
)
ON CONFLICT (name)
DO UPDATE SET
  description = EXCLUDED.description,
  interval = EXCLUDED.interval,
  features = EXCLUDED.features;

-- ============================================
-- FASE 8: Asignación automática de plan Free
-- ============================================

-- Función para asignar plan Free a nuevos usuarios/empresas
CREATE OR REPLACE FUNCTION public.assign_free_plan()
RETURNS TRIGGER AS $$
DECLARE
  v_free_plan_id UUID;
BEGIN
  -- Solo ejecutar si es el primer usuario de la empresa (company admin)
  IF NEW.is_company_admin = true THEN
    -- Obtener ID del plan Free
    SELECT id INTO v_free_plan_id
    FROM public.subscription_plans
    WHERE name = 'Free'
    LIMIT 1;
    
    -- Verificar que no exista ya una suscripción para esta empresa
    IF NOT EXISTS (
      SELECT 1 FROM public.subscriptions 
      WHERE empresa_id = NEW.empresa_id
    ) THEN
      -- Crear suscripción Free automática
      INSERT INTO public.subscriptions (
        user_id,
        empresa_id,
        plan_id,
        status,
        current_period_start,
        current_period_end
      ) VALUES (
        NEW.auth_id,
        NEW.empresa_id,
        v_free_plan_id,
        'active',
        NOW(),
        NOW() + INTERVAL '100 years' -- Free nunca expira
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Crear trigger para asignación automática
DROP TRIGGER IF EXISTS on_user_company_created ON public.usuarios;
CREATE TRIGGER on_user_company_created
  AFTER INSERT ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_free_plan();