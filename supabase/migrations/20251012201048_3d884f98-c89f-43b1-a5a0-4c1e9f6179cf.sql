-- FASE 1 & 2: Asegurar plan Free y configurar infraestructura de invitaciones

-- Verificar y crear plan Free si no existe
INSERT INTO subscription_plans (name, description, price, interval, features)
VALUES (
  'Free',
  'Plan gratuito con funcionalidades básicas para comenzar',
  0,
  'month',
  '{"tipo": "desarrollo", "max_recursos": 1, "max_vendedores": 1}'::jsonb
)
ON CONFLICT (name) DO UPDATE 
SET 
  description = EXCLUDED.description,
  features = EXCLUDED.features;

-- Asegurar que invitaciones_empresa tenga todas las columnas necesarias
-- La tabla ya existe, solo verificamos estructura

-- Función para generar token único de invitación
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$;

-- RLS policies para invitaciones_empresa
DROP POLICY IF EXISTS "Admins can create invitations" ON invitaciones_empresa;
CREATE POLICY "Admins can create invitations"
ON invitaciones_empresa FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE auth_id = auth.uid()
      AND empresa_id = invitaciones_empresa.empresa_id
      AND is_company_admin = true
      AND activo = true
  )
);

DROP POLICY IF EXISTS "Admins can view company invitations" ON invitaciones_empresa;
CREATE POLICY "Admins can view company invitations"
ON invitaciones_empresa FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE auth_id = auth.uid()
      AND empresa_id = invitaciones_empresa.empresa_id
      AND is_company_admin = true
      AND activo = true
  )
);

DROP POLICY IF EXISTS "Admins can update company invitations" ON invitaciones_empresa;
CREATE POLICY "Admins can update company invitations"
ON invitaciones_empresa FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE auth_id = auth.uid()
      AND empresa_id = invitaciones_empresa.empresa_id
      AND is_company_admin = true
      AND activo = true
  )
);

DROP POLICY IF EXISTS "Admins can delete company invitations" ON invitaciones_empresa;
CREATE POLICY "Admins can delete company invitations"
ON invitaciones_empresa FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE auth_id = auth.uid()
      AND empresa_id = invitaciones_empresa.empresa_id
      AND is_company_admin = true
      AND activo = true
  )
);

-- Permitir lectura pública de invitaciones por token (para validación en signup)
DROP POLICY IF EXISTS "Public can view invitation by token" ON invitaciones_empresa;
CREATE POLICY "Public can view invitation by token"
ON invitaciones_empresa FOR SELECT
USING (true);

-- Función para validar y obtener invitación
CREATE OR REPLACE FUNCTION get_valid_invitation(p_token TEXT)
RETURNS TABLE (
  id UUID,
  empresa_id INTEGER,
  email TEXT,
  rol TEXT,
  estado TEXT,
  fecha_expiracion TIMESTAMPTZ,
  es_valida BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.empresa_id,
    i.email,
    i.rol,
    i.estado,
    i.fecha_expiracion,
    (i.estado = 'pendiente' AND i.fecha_expiracion > now()) AS es_valida
  FROM invitaciones_empresa i
  WHERE i.token = p_token;
END;
$$;