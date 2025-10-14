-- Actualizar Plan Free: 1 desarrollo + 1 prototipo
UPDATE subscription_plans 
SET features = jsonb_build_object(
  'max_desarrollos', 1,
  'max_prototipos', 1,
  'max_vendedores', 1
)
WHERE id = '1529fe07-25b9-46a4-bb0e-72a4746f11f5';

-- Actualizar Plan Basic: 2 desarrollos + 5 prototipos
UPDATE subscription_plans 
SET features = jsonb_build_object(
  'max_desarrollos', 2,
  'max_prototipos', 5,
  'max_vendedores', 2,
  'analytics_avanzado', true,
  'exportacion_avanzada', true,
  'soporte_prioritario', true,
  'api_access', false,
  'audit_logs', false,
  'soporte_247', false,
  'white_label', false
)
WHERE id = 'e8df6cf8-c58a-4f32-9808-d22d01023c94';

-- Actualizar Plan Grow: 4 desarrollos + 10 prototipos
UPDATE subscription_plans 
SET features = jsonb_build_object(
  'max_desarrollos', 4,
  'max_prototipos', 10,
  'max_vendedores', 10,
  'analytics_avanzado', true,
  'api_access', true,
  'audit_logs', true,
  'exportacion_avanzada', true,
  'soporte_247', true,
  'soporte_prioritario', true,
  'white_label', false
)
WHERE id = '6a3101ca-9687-410d-af21-ee362895f057';