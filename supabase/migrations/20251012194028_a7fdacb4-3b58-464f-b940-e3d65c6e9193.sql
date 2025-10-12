-- =====================================================
-- Fix: Actualizar flujo de registro para crear empresa via trigger
-- =====================================================
-- Este cambio mueve la creación de empresa al trigger handle_new_user
-- para que sea server-side y transaccional
-- =====================================================

-- 1. Eliminar la política que acabamos de crear (ya no es necesaria)
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.empresa_info;

-- 2. Actualizar el trigger handle_new_user para crear empresa cuando sea necesario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_empresa_id INTEGER;
  v_user_role app_role;
  v_nombre TEXT;
  v_is_company_admin BOOLEAN;
  v_empresa_nombre TEXT;
  v_new_empresa_id INTEGER;
  v_max_retries INTEGER := 5;
  v_retry_count INTEGER := 0;
BEGIN
  -- Extraer metadatos del usuario
  v_user_role := COALESCE((NEW.raw_user_meta_data->>'user_role')::app_role, 'vendedor'::app_role);
  v_nombre := COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1));
  v_is_company_admin := COALESCE((NEW.raw_user_meta_data->>'is_company_admin')::BOOLEAN, false);
  v_empresa_id := (NEW.raw_user_meta_data->>'empresa_id')::INTEGER;
  v_empresa_nombre := NEW.raw_user_meta_data->>'empresa_nombre';
  
  -- Si es company admin y no tiene empresa_id, crear empresa
  IF v_is_company_admin AND v_empresa_id IS NULL AND v_empresa_nombre IS NOT NULL THEN
    -- Intentar crear empresa con reintentos en caso de conflicto
    WHILE v_retry_count < v_max_retries LOOP
      BEGIN
        -- Obtener próximo ID disponible
        SELECT COALESCE(MAX(id), 0) + 1 INTO v_new_empresa_id FROM empresa_info;
        
        -- Crear empresa
        INSERT INTO empresa_info (id, nombre)
        VALUES (v_new_empresa_id, v_empresa_nombre)
        RETURNING id INTO v_empresa_id;
        
        -- Si llegamos aquí, la inserción fue exitosa
        EXIT;
        
      EXCEPTION
        WHEN unique_violation THEN
          -- Si hay conflicto de ID, reintentar
          v_retry_count := v_retry_count + 1;
          IF v_retry_count >= v_max_retries THEN
            RAISE EXCEPTION 'No se pudo generar un ID único para la empresa después de % intentos', v_max_retries;
          END IF;
      END;
    END LOOP;
  END IF;
  
  -- Insertar usuario en la tabla usuarios
  INSERT INTO usuarios (auth_id, email, nombre, empresa_id, rol, is_company_admin, activo)
  VALUES (NEW.id, NEW.email, v_nombre, v_empresa_id, v_user_role::TEXT, v_is_company_admin, true)
  ON CONFLICT (auth_id) DO UPDATE 
  SET email = EXCLUDED.email,
      nombre = EXCLUDED.nombre,
      empresa_id = COALESCE(EXCLUDED.empresa_id, usuarios.empresa_id);
  
  -- Insertar rol en user_roles si la tabla existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
    INSERT INTO user_roles (user_id, role, created_by)
    VALUES (NEW.id, v_user_role, NEW.id)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error en handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 3. Agregar política más específica para company admins (para crear empresas adicionales después)
CREATE POLICY "Company admins can insert companies"
  ON public.empresa_info
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_id = auth.uid()
        AND u.is_company_admin = true
        AND u.activo = true
    )
  );

-- Comentario para documentación
COMMENT ON POLICY "Company admins can insert companies" ON public.empresa_info IS 
'Permite que administradores de empresa autenticados creen empresas adicionales. La creación inicial durante registro se maneja mediante el trigger handle_new_user.';