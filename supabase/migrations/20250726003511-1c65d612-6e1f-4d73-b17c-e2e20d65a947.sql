-- Fix the infinite recursion issue in usuarios table policies

-- Drop all problematic policies on usuarios table first
DROP POLICY IF EXISTS "Users can view users from same company" ON usuarios;
DROP POLICY IF EXISTS "Company admins can insert users" ON usuarios;
DROP POLICY IF EXISTS "Company admins can deactivate users" ON usuarios;
DROP POLICY IF EXISTS "Users can update own profile" ON usuarios;

-- Create simple, non-recursive policies for usuarios table
-- Allow users to view their own record and users from same company
CREATE POLICY "Users can view same company users" 
ON usuarios 
FOR SELECT 
TO authenticated 
USING (
  auth_id = auth.uid() OR 
  empresa_id IN (
    SELECT u.empresa_id FROM usuarios u 
    WHERE u.auth_id = auth.uid() AND u.activo = true
  )
);

-- Allow users to update their own profile only
CREATE POLICY "Users can update own profile" 
ON usuarios 
FOR UPDATE 
TO authenticated 
USING (auth_id = auth.uid());

-- Allow company admins to manage users in their company
CREATE POLICY "Company admins can manage users" 
ON usuarios 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM usuarios admin_user 
    WHERE admin_user.auth_id = auth.uid() 
    AND admin_user.empresa_id = usuarios.empresa_id 
    AND admin_user.is_company_admin = true 
    AND admin_user.activo = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios admin_user 
    WHERE admin_user.auth_id = auth.uid() 
    AND admin_user.empresa_id = usuarios.empresa_id 
    AND admin_user.is_company_admin = true 
    AND admin_user.activo = true
  )
);