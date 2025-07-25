-- PHASE 1: CRITICAL RLS POLICY IMPLEMENTATION
-- Enable RLS on all public tables and create company-scoped access policies

-- 1. Enable RLS on usuarios table and create policies
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Users can only see users from their own company
CREATE POLICY "Users can view users from same company" 
ON public.usuarios 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u 
    WHERE u.auth_id = auth.uid() 
    AND u.empresa_id = usuarios.empresa_id
    AND u.activo = true
  )
);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.usuarios 
FOR UPDATE 
USING (auth_id = auth.uid());

-- Only company admins can insert new users
CREATE POLICY "Company admins can insert users" 
ON public.usuarios 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios u 
    WHERE u.auth_id = auth.uid() 
    AND u.empresa_id = usuarios.empresa_id
    AND u.is_company_admin = true
    AND u.activo = true
  )
);

-- Only company admins can delete users (set inactive)
CREATE POLICY "Company admins can deactivate users" 
ON public.usuarios 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u 
    WHERE u.auth_id = auth.uid() 
    AND u.empresa_id = usuarios.empresa_id
    AND u.is_company_admin = true
    AND u.activo = true
  )
);

-- 2. Enable RLS on empresa_info and create policies
ALTER TABLE public.empresa_info ENABLE ROW LEVEL SECURITY;

-- Users can only see their own company info
CREATE POLICY "Users can view own company info" 
ON public.empresa_info 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u 
    WHERE u.auth_id = auth.uid() 
    AND u.empresa_id = empresa_info.id
    AND u.activo = true
  )
);

-- Only company admins can update company info
CREATE POLICY "Company admins can update company info" 
ON public.empresa_info 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u 
    WHERE u.auth_id = auth.uid() 
    AND u.empresa_id = empresa_info.id
    AND u.is_company_admin = true
    AND u.activo = true
  )
);

-- 3. Enable RLS on configuracion_financiera and create policies
ALTER TABLE public.configuracion_financiera ENABLE ROW LEVEL SECURITY;

-- Users can only see financial config from their company's desarrollos
CREATE POLICY "Users can view own company financial config" 
ON public.configuracion_financiera 
FOR SELECT 
USING (
  -- Global config (id=1) visible to all authenticated users
  id = 1 OR
  EXISTS (
    SELECT 1 FROM public.desarrollos d
    JOIN public.usuarios u ON u.empresa_id = d.empresa_id
    WHERE d.id = configuracion_financiera.desarrollo_id
    AND u.auth_id = auth.uid()
    AND u.activo = true
  )
);

-- Only users from the same company can update financial config
CREATE POLICY "Users can update own company financial config" 
ON public.configuracion_financiera 
FOR UPDATE 
USING (
  -- Allow updating global config for company admins
  (id = 1 AND EXISTS (
    SELECT 1 FROM public.usuarios u 
    WHERE u.auth_id = auth.uid() 
    AND u.is_company_admin = true
    AND u.activo = true
  )) OR
  -- Allow updating desarrollo-specific config for same company
  EXISTS (
    SELECT 1 FROM public.desarrollos d
    JOIN public.usuarios u ON u.empresa_id = d.empresa_id
    WHERE d.id = configuracion_financiera.desarrollo_id
    AND u.auth_id = auth.uid()
    AND u.activo = true
  )
);

-- 4. Enable RLS on leads table and create policies
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Users can only see leads from their own company
CREATE POLICY "Users can view own company leads" 
ON public.leads 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u 
    WHERE u.auth_id = auth.uid() 
    AND u.empresa_id = leads.empresa_id
    AND u.activo = true
  )
);

-- Users can insert leads for their own company
CREATE POLICY "Users can insert leads for own company" 
ON public.leads 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios u 
    WHERE u.auth_id = auth.uid() 
    AND u.empresa_id = leads.empresa_id
    AND u.activo = true
  )
);

-- Users can update leads from their own company
CREATE POLICY "Users can update own company leads" 
ON public.leads 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u 
    WHERE u.auth_id = auth.uid() 
    AND u.empresa_id = leads.empresa_id
    AND u.activo = true
  )
);

-- Users can delete leads from their own company
CREATE POLICY "Users can delete own company leads" 
ON public.leads 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u 
    WHERE u.auth_id = auth.uid() 
    AND u.empresa_id = leads.empresa_id
    AND u.activo = true
  )
);

-- 5. Enable RLS on cotizaciones table and create policies
ALTER TABLE public.cotizaciones ENABLE ROW LEVEL SECURITY;

-- Users can only see cotizaciones from their company's leads
CREATE POLICY "Users can view own company cotizaciones" 
ON public.cotizaciones 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.leads l
    JOIN public.usuarios u ON u.empresa_id = l.empresa_id
    WHERE l.id = cotizaciones.lead_id
    AND u.auth_id = auth.uid()
    AND u.activo = true
  )
);

-- Users can insert cotizaciones for their company's leads
CREATE POLICY "Users can insert cotizaciones for own company" 
ON public.cotizaciones 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.leads l
    JOIN public.usuarios u ON u.empresa_id = l.empresa_id
    WHERE l.id = cotizaciones.lead_id
    AND u.auth_id = auth.uid()
    AND u.activo = true
  )
);

-- Users can update cotizaciones from their company
CREATE POLICY "Users can update own company cotizaciones" 
ON public.cotizaciones 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.leads l
    JOIN public.usuarios u ON u.empresa_id = l.empresa_id
    WHERE l.id = cotizaciones.lead_id
    AND u.auth_id = auth.uid()
    AND u.activo = true
  )
);

-- Users can delete cotizaciones from their company
CREATE POLICY "Users can delete own company cotizaciones" 
ON public.cotizaciones 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.leads l
    JOIN public.usuarios u ON u.empresa_id = l.empresa_id
    WHERE l.id = cotizaciones.lead_id
    AND u.auth_id = auth.uid()
    AND u.activo = true
  )
);

-- 6. Enable RLS on propiedades table and create policies
ALTER TABLE public.propiedades ENABLE ROW LEVEL SECURITY;

-- Users can only see propiedades from their company's desarrollos
CREATE POLICY "Users can view own company propiedades" 
ON public.propiedades 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.desarrollos d
    JOIN public.usuarios u ON u.empresa_id = d.empresa_id
    WHERE d.id = propiedades.desarrollo_id
    AND u.auth_id = auth.uid()
    AND u.activo = true
  )
);

-- Users can insert propiedades for their company's desarrollos
CREATE POLICY "Users can insert propiedades for own company" 
ON public.propiedades 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.desarrollos d
    JOIN public.usuarios u ON u.empresa_id = d.empresa_id
    WHERE d.id = propiedades.desarrollo_id
    AND u.auth_id = auth.uid()
    AND u.activo = true
  )
);

-- Users can update propiedades from their company
CREATE POLICY "Users can update own company propiedades" 
ON public.propiedades 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.desarrollos d
    JOIN public.usuarios u ON u.empresa_id = d.empresa_id
    WHERE d.id = propiedades.desarrollo_id
    AND u.auth_id = auth.uid()
    AND u.activo = true
  )
);

-- Users can delete propiedades from their company
CREATE POLICY "Users can delete own company propiedades" 
ON public.propiedades 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.desarrollos d
    JOIN public.usuarios u ON u.empresa_id = d.empresa_id
    WHERE d.id = propiedades.desarrollo_id
    AND u.auth_id = auth.uid()
    AND u.activo = true
  )
);

-- 7. Update prototipos RLS policies (already enabled, but add company scoping)
DROP POLICY IF EXISTS "Public Read" ON public.prototipos;
DROP POLICY IF EXISTS "Public Insert" ON public.prototipos;
DROP POLICY IF EXISTS "Public Update" ON public.prototipos;
DROP POLICY IF EXISTS "Public Delete" ON public.prototipos;

-- Enable RLS if not already enabled
ALTER TABLE public.prototipos ENABLE ROW LEVEL SECURITY;

-- Company-scoped policies for prototipos
CREATE POLICY "Users can view own company prototipos" 
ON public.prototipos 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.desarrollos d
    JOIN public.usuarios u ON u.empresa_id = d.empresa_id
    WHERE d.id = prototipos.desarrollo_id
    AND u.auth_id = auth.uid()
    AND u.activo = true
  )
);

CREATE POLICY "Users can insert prototipos for own company" 
ON public.prototipos 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.desarrollos d
    JOIN public.usuarios u ON u.empresa_id = d.empresa_id
    WHERE d.id = prototipos.desarrollo_id
    AND u.auth_id = auth.uid()
    AND u.activo = true
  )
);

CREATE POLICY "Users can update own company prototipos" 
ON public.prototipos 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.desarrollos d
    JOIN public.usuarios u ON u.empresa_id = d.empresa_id
    WHERE d.id = prototipos.desarrollo_id
    AND u.auth_id = auth.uid()
    AND u.activo = true
  )
);

CREATE POLICY "Users can delete own company prototipos" 
ON public.prototipos 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.desarrollos d
    JOIN public.usuarios u ON u.empresa_id = d.empresa_id
    WHERE d.id = prototipos.desarrollo_id
    AND u.auth_id = auth.uid()
    AND u.activo = true
  )
);

-- 8. Create security function to check if user belongs to company
CREATE OR REPLACE FUNCTION public.user_belongs_to_company(user_uuid uuid, company_id integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
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

-- 9. Create audit logging function
CREATE OR REPLACE FUNCTION public.audit_log_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log important operations to a dedicated audit table (to be created separately)
  -- For now, we'll use RAISE NOTICE to log to database logs
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