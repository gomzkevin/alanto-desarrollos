-- Harden usuarios RLS to fix infinite recursion and enforce proper access
-- 1) Ensure RLS is enabled
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 2) Drop existing usuarios policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view same company users" ON public.usuarios;
DROP POLICY IF EXISTS "Users can update own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Company admins can manage users" ON public.usuarios;
DROP POLICY IF EXISTS "Users can view users from same company" ON public.usuarios;
DROP POLICY IF EXISTS "Company admins can insert users" ON public.usuarios;
DROP POLICY IF EXISTS "Company admins can deactivate users" ON public.usuarios;

-- 3) Helper functions (security definer) to avoid recursion in policies
CREATE OR REPLACE FUNCTION public.current_user_empresa_id()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.empresa_id
  FROM public.usuarios u
  WHERE u.auth_id = auth.uid() AND u.activo = true
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_company_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(u.is_company_admin, false)
  FROM public.usuarios u
  WHERE u.auth_id = auth.uid() AND u.activo = true
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_company_admin_for(_empresa_id integer)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.usuarios u
    WHERE u.auth_id = auth.uid()
      AND u.empresa_id = _empresa_id
      AND u.is_company_admin = true
      AND u.activo = true
  )
$$;

-- 4) Policies
-- SELECT: allow user to read own row or rows from same company
CREATE POLICY "usuarios_select_own_or_company"
ON public.usuarios
FOR SELECT
TO authenticated
USING (
  auth_id = auth.uid() OR empresa_id = public.current_user_empresa_id()
);

-- UPDATE: allow user to update own row (non-privileged fields) and admins to update any user in their company
CREATE POLICY "usuarios_update_own_or_admin"
ON public.usuarios
FOR UPDATE
TO authenticated
USING (
  -- Can attempt update if updating own row or admin of the company
  auth_id = auth.uid() OR public.is_company_admin_for(empresa_id)
)
WITH CHECK (
  -- After update, row must remain in same company scope and:
  --  - If not admin, cannot change privileged fields (enforced by trigger below)
  --  - If admin, must belong to their company
  public.is_company_admin_for(empresa_id) OR auth_id = auth.uid()
);

-- INSERT: only company admins can insert users for their company
CREATE POLICY "usuarios_insert_company_admin"
ON public.usuarios
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_company_admin_for(empresa_id)
);

-- DELETE: only company admins can delete users in their company
CREATE POLICY "usuarios_delete_company_admin"
ON public.usuarios
FOR DELETE
TO authenticated
USING (
  public.is_company_admin_for(empresa_id)
);

-- 5) Trigger to prevent privilege escalation by non-admin users
CREATE OR REPLACE FUNCTION public.prevent_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If the acting user is not an admin for this company, they cannot modify privileged fields
  IF NOT public.is_company_admin_for(COALESCE(NEW.empresa_id, OLD.empresa_id)) THEN
    IF (NEW.empresa_id IS DISTINCT FROM OLD.empresa_id)
       OR (NEW.rol IS DISTINCT FROM OLD.rol)
       OR (NEW.is_company_admin IS DISTINCT FROM OLD.is_company_admin) THEN
      RAISE EXCEPTION 'Not authorized to modify privileged fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS usuarios_prevent_priv_escalation ON public.usuarios;
CREATE TRIGGER usuarios_prevent_priv_escalation
BEFORE UPDATE ON public.usuarios
FOR EACH ROW
EXECUTE FUNCTION public.prevent_privilege_escalation();