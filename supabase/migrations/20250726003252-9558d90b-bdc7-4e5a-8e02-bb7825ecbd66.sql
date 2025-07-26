-- Fix RLS policies to ensure company admins have proper access

-- Fix desarrollos policies
DROP POLICY IF EXISTS "Users can access desarrollos from their empresa" ON desarrollos;
CREATE POLICY "Users can access desarrollos from their empresa" 
ON desarrollos 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.auth_id = auth.uid() 
    AND u.empresa_id = desarrollos.empresa_id 
    AND u.activo = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.auth_id = auth.uid() 
    AND u.empresa_id = desarrollos.empresa_id 
    AND u.activo = true
  )
);

-- Fix leads policies to ensure company admins can access
DROP POLICY IF EXISTS "Users can view own company leads" ON leads;
CREATE POLICY "Users can view own company leads" 
ON leads 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.auth_id = auth.uid() 
    AND u.empresa_id = leads.empresa_id 
    AND u.activo = true
  )
);

DROP POLICY IF EXISTS "Users can insert leads for own company" ON leads;
CREATE POLICY "Users can insert leads for own company" 
ON leads 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.auth_id = auth.uid() 
    AND u.empresa_id = leads.empresa_id 
    AND u.activo = true
  )
);

DROP POLICY IF EXISTS "Users can update own company leads" ON leads;
CREATE POLICY "Users can update own company leads" 
ON leads 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.auth_id = auth.uid() 
    AND u.empresa_id = leads.empresa_id 
    AND u.activo = true
  )
);

DROP POLICY IF EXISTS "Users can delete own company leads" ON leads;
CREATE POLICY "Users can delete own company leads" 
ON leads 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.auth_id = auth.uid() 
    AND u.empresa_id = leads.empresa_id 
    AND u.activo = true
  )
);

-- Add missing policies for dashboard views
DROP POLICY IF EXISTS "Users can view company dashboard metrics" ON dashboard_metrics_view;
CREATE POLICY "Users can view company dashboard metrics" 
ON dashboard_metrics_view 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.auth_id = auth.uid() 
    AND u.empresa_id = dashboard_metrics_view.empresa_id 
    AND u.activo = true
  )
);

DROP POLICY IF EXISTS "Users can view company ventas" ON company_ventas_view;
CREATE POLICY "Users can view company ventas" 
ON company_ventas_view 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.auth_id = auth.uid() 
    AND u.empresa_id = company_ventas_view.empresa_id 
    AND u.activo = true
  )
);