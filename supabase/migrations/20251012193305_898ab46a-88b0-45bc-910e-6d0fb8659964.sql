-- =====================================================
-- Fix: Add INSERT policy for empresa_info
-- =====================================================
-- Permite que usuarios autenticados creen empresas
-- durante el proceso de registro
-- =====================================================

-- Política para permitir INSERT de nuevas empresas
CREATE POLICY "Authenticated users can create companies"
  ON public.empresa_info
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Comentario para documentación
COMMENT ON POLICY "Authenticated users can create companies" ON public.empresa_info IS 
'Permite que usuarios autenticados creen empresas durante el registro. La seguridad posterior se maneja mediante las políticas de SELECT y UPDATE.';