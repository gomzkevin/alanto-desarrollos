
-- =====================================================
-- Fix: Recrear trigger y crear usuario faltante
-- =====================================================

-- 1. Verificar y recrear el trigger en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Crear manualmente el usuario que falta (gomz.kevin+1@gmail.com)
-- Primero verificamos si existe
DO $$
DECLARE
  v_auth_id UUID := '80610bbc-fe06-4459-80ac-fcaa9c05afc8';
  v_email TEXT := 'gomz.kevin+1@gmail.com';
  v_empresa_id INTEGER;
  v_user_exists BOOLEAN;
BEGIN
  -- Verificar si el usuario ya existe
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios WHERE auth_id = v_auth_id
  ) INTO v_user_exists;
  
  IF NOT v_user_exists THEN
    -- Crear nueva empresa para este usuario
    INSERT INTO public.empresa_info (nombre)
    VALUES ('Empresa ' || split_part(v_email, '@', 1))
    RETURNING id INTO v_empresa_id;
    
    -- Crear el usuario
    INSERT INTO public.usuarios (
      auth_id,
      email,
      nombre,
      empresa_id,
      rol,
      is_company_admin,
      activo
    ) VALUES (
      v_auth_id,
      v_email,
      split_part(v_email, '@', 1),
      v_empresa_id,
      'admin',
      true,
      true
    );
    
    RAISE NOTICE 'Usuario creado exitosamente con empresa_id: %', v_empresa_id;
  ELSE
    RAISE NOTICE 'Usuario ya existe, no se creó duplicado';
  END IF;
END $$;

-- 3. Verificar resultado
SELECT 
  u.id,
  u.auth_id,
  u.email,
  u.nombre,
  u.empresa_id,
  u.rol,
  u.is_company_admin,
  e.nombre as empresa_nombre
FROM public.usuarios u
LEFT JOIN public.empresa_info e ON u.empresa_id = e.id
WHERE u.auth_id = '80610bbc-fe06-4459-80ac-fcaa9c05afc8';
