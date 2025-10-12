
-- =====================================================
-- Fix: Permitir al trigger handle_new_user insertar en usuarios
-- =====================================================
-- El trigger se ejecuta en contexto del sistema (SECURITY DEFINER)
-- pero las políticas RLS están bloqueando las inserciones.
-- Necesitamos una política que permita inserciones desde el sistema.
-- =====================================================

-- Primero, eliminar la política restrictiva actual de INSERT
DROP POLICY IF EXISTS "usuarios_insert_company_admin" ON public.usuarios;

-- Crear nueva política que permita:
-- 1. Inserciones desde triggers del sistema (cuando auth.uid() es NULL)
-- 2. Inserciones por company admins para su empresa
CREATE POLICY "usuarios_insert_system_or_admin"
  ON public.usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Permitir si no hay usuario autenticado (contexto de sistema/trigger)
    auth.uid() IS NULL
    OR
    -- O si es company admin insertando para su empresa
    public.is_company_admin_for(empresa_id)
    OR
    -- O si el auth_id coincide con el usuario que está creando el registro (self-registration)
    auth_id = auth.uid()
  );

-- También necesitamos una política para el rol anon (para el registro inicial)
CREATE POLICY "usuarios_insert_anon"
  ON public.usuarios
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Verificar que el trigger está configurado correctamente
-- Recrear el trigger si es necesario para asegurar que está activo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Comentario para documentación
COMMENT ON POLICY "usuarios_insert_system_or_admin" ON public.usuarios IS 
'Permite inserciones desde triggers del sistema, self-registration, o por company admins para su empresa.';

COMMENT ON POLICY "usuarios_insert_anon" ON public.usuarios IS 
'Permite inserciones desde usuarios anónimos durante el proceso de registro inicial.';
