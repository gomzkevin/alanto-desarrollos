-- Actualizar precios de planes nuevos
UPDATE subscription_plans 
SET price = 290 
WHERE name = 'Basic' 
  AND created_at >= '2025-10-12';

UPDATE subscription_plans 
SET price = 799 
WHERE name = 'Grow' 
  AND created_at >= '2025-10-12';

-- Eliminar planes antiguos (verificamos que no tengan suscripciones activas)
DELETE FROM subscription_plans 
WHERE name IN ('Plan Básico', 'Plan Medio', 'Plan Empresarial')
  AND id NOT IN (
    SELECT DISTINCT plan_id 
    FROM subscriptions 
    WHERE status = 'active'
  );