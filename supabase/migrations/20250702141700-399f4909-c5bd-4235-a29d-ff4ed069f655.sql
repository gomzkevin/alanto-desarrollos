-- FASE 1: Optimización de Consultas de Base de Datos

-- 1. Vista optimizada para métricas del dashboard
CREATE OR REPLACE VIEW dashboard_metrics_view AS
SELECT 
  e.id as empresa_id,
  e.nombre as empresa_nombre,
  
  -- Conteos de leads
  COALESCE(lead_stats.total_leads, 0) as total_leads,
  COALESCE(lead_stats.prospectos_activos, 0) as prospectos_activos,
  
  -- Conteos de cotizaciones
  COALESCE(cotiz_stats.total_cotizaciones, 0) as total_cotizaciones,
  
  -- Conteos de ventas
  COALESCE(venta_stats.total_ventas, 0) as total_ventas,
  
  -- Inventario de unidades
  COALESCE(inventory_stats.total_unidades, 0) as total_unidades,
  COALESCE(inventory_stats.unidades_disponibles, 0) as unidades_disponibles,
  COALESCE(inventory_stats.unidades_reservadas, 0) as unidades_reservadas,
  COALESCE(inventory_stats.unidades_vendidas, 0) as unidades_vendidas,
  
  -- Ingresos del mes actual
  COALESCE(revenue_stats.ingresos_mes_actual, 0) as ingresos_mes_actual

FROM empresa_info e

-- Estadísticas de leads
LEFT JOIN (
  SELECT 
    empresa_id,
    COUNT(*) as total_leads,
    COUNT(*) FILTER (WHERE estado = 'convertido') as prospectos_activos
  FROM leads 
  WHERE empresa_id IS NOT NULL
  GROUP BY empresa_id
) lead_stats ON e.id = lead_stats.empresa_id

-- Estadísticas de cotizaciones
LEFT JOIN (
  SELECT 
    d.empresa_id,
    COUNT(c.id) as total_cotizaciones
  FROM cotizaciones c
  JOIN desarrollos d ON c.desarrollo_id = d.id
  GROUP BY d.empresa_id
) cotiz_stats ON e.id = cotiz_stats.empresa_id

-- Estadísticas de ventas
LEFT JOIN (
  SELECT 
    d.empresa_id,
    COUNT(v.id) as total_ventas
  FROM ventas v
  JOIN unidades u ON v.unidad_id = u.id
  JOIN prototipos p ON u.prototipo_id = p.id
  JOIN desarrollos d ON p.desarrollo_id = d.id
  GROUP BY d.empresa_id
) venta_stats ON e.id = venta_stats.empresa_id

-- Estadísticas de inventario
LEFT JOIN (
  SELECT 
    d.empresa_id,
    COUNT(u.id) as total_unidades,
    COUNT(u.id) FILTER (WHERE u.estado = 'disponible') as unidades_disponibles,
    COUNT(u.id) FILTER (WHERE u.estado IN ('apartado', 'en_proceso')) as unidades_reservadas,
    COUNT(u.id) FILTER (WHERE u.estado = 'vendido') as unidades_vendidas
  FROM unidades u
  JOIN prototipos p ON u.prototipo_id = p.id
  JOIN desarrollos d ON p.desarrollo_id = d.id
  GROUP BY d.empresa_id
) inventory_stats ON e.id = inventory_stats.empresa_id

-- Ingresos del mes actual
LEFT JOIN (
  SELECT 
    d.empresa_id,
    COALESCE(SUM(pg.monto), 0) as ingresos_mes_actual
  FROM pagos pg
  JOIN compradores_venta cv ON pg.comprador_venta_id = cv.id
  JOIN ventas v ON cv.venta_id = v.id
  JOIN unidades u ON v.unidad_id = u.id
  JOIN prototipos p ON u.prototipo_id = p.id
  JOIN desarrollos d ON p.desarrollo_id = d.id
  WHERE pg.estado = 'registrado'
    AND date_trunc('month', pg.fecha) = date_trunc('month', CURRENT_DATE)
  GROUP BY d.empresa_id
) revenue_stats ON e.id = revenue_stats.empresa_id;

-- 2. Vista optimizada para ventas por empresa
CREATE OR REPLACE VIEW company_ventas_view AS
SELECT 
  v.id as venta_id,
  v.precio_total,
  v.estado as venta_estado,
  v.fecha_inicio,
  v.fecha_actualizacion,
  v.es_fraccional,
  v.notas,
  
  -- Datos de la unidad
  u.id as unidad_id,
  u.numero as unidad_numero,
  u.nivel as unidad_nivel,
  u.estado as unidad_estado,
  
  -- Datos del prototipo
  p.id as prototipo_id,
  p.nombre as prototipo_nombre,
  p.tipo as prototipo_tipo,
  p.precio as prototipo_precio,
  
  -- Datos del desarrollo
  d.id as desarrollo_id,
  d.nombre as desarrollo_nombre,
  d.ubicacion as desarrollo_ubicacion,
  d.empresa_id,
  
  -- Datos de compradores
  cv.id as comprador_venta_id,
  cv.monto_comprometido,
  cv.porcentaje_propiedad,
  
  -- Datos del lead/comprador
  l.id as lead_id,
  l.nombre as comprador_nombre,
  l.email as comprador_email,
  l.telefono as comprador_telefono,
  
  -- Datos del vendedor
  usr.id as vendedor_id,
  usr.nombre as vendedor_nombre,
  
  -- Totales de pagos
  pago_stats.total_pagado,
  pago_stats.pagos_pendientes,
  
  -- Progreso de pago
  CASE 
    WHEN v.precio_total > 0 THEN 
      ROUND((COALESCE(pago_stats.total_pagado, 0) / v.precio_total) * 100, 2)
    ELSE 0
  END as progreso_pago_porcentaje

FROM ventas v
JOIN unidades u ON v.unidad_id = u.id
JOIN prototipos p ON u.prototipo_id = p.id
JOIN desarrollos d ON p.desarrollo_id = d.id
LEFT JOIN compradores_venta cv ON v.id = cv.venta_id
LEFT JOIN leads l ON cv.comprador_id = l.id
LEFT JOIN usuarios usr ON cv.vendedor_id = usr.id

-- Estadísticas de pagos por venta
LEFT JOIN (
  SELECT 
    cv.venta_id,
    COALESCE(SUM(pg.monto) FILTER (WHERE pg.estado = 'registrado'), 0) as total_pagado,
    COUNT(pg.id) FILTER (WHERE pg.estado = 'pendiente') as pagos_pendientes
  FROM compradores_venta cv
  LEFT JOIN pagos pg ON cv.id = pg.comprador_venta_id
  GROUP BY cv.venta_id
) pago_stats ON v.id = pago_stats.venta_id;

-- 3. Function optimizada para estado de suscripción
CREATE OR REPLACE FUNCTION get_company_subscription_status(company_id integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  subscription RECORD;
  resource_counts RECORD;
BEGIN
  -- Obtener suscripción activa con detalles del plan
  SELECT 
    s.*,
    sp.name as plan_name,
    sp.description as plan_description,
    sp.price as plan_price,
    sp.interval as plan_interval,
    sp.features as plan_features
  INTO subscription
  FROM subscriptions s
  JOIN subscription_plans sp ON s.plan_id = sp.id
  WHERE s.empresa_id = company_id 
    AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- Si no hay suscripción, retornar estado inactivo
  IF subscription IS NULL THEN
    RETURN jsonb_build_object(
      'isActive', false,
      'subscription', NULL,
      'resourceCounts', jsonb_build_object(
        'desarrollos', 0,
        'prototipos', 0,
        'vendedores', 0,
        'leads', 0,
        'ventas', 0
      ),
      'limits', jsonb_build_object(
        'maxRecursos', 0,
        'maxVendedores', 0,
        'tipo', NULL
      )
    );
  END IF;
  
  -- Obtener conteos de recursos de forma optimizada
  SELECT
    COALESCE(COUNT(DISTINCT d.id), 0) as desarrollos_count,
    COALESCE(COUNT(DISTINCT p.id), 0) as prototipos_count,
    COALESCE(COUNT(DISTINCT u.id) FILTER (WHERE u.rol = 'vendedor' AND u.activo = true), 0) as vendedores_count,
    COALESCE(COUNT(DISTINCT l.id), 0) as leads_count,
    COALESCE(COUNT(DISTINCT v.id), 0) as ventas_count
  INTO resource_counts
  FROM empresa_info e
  LEFT JOIN desarrollos d ON e.id = d.empresa_id
  LEFT JOIN prototipos p ON d.id = p.desarrollo_id
  LEFT JOIN usuarios u ON e.id = u.empresa_id
  LEFT JOIN leads l ON e.id = l.empresa_id
  LEFT JOIN ventas v ON v.unidad_id IN (
    SELECT un.id FROM unidades un 
    JOIN prototipos pr ON un.prototipo_id = pr.id 
    JOIN desarrollos dr ON pr.desarrollo_id = dr.id 
    WHERE dr.empresa_id = e.id
  )
  WHERE e.id = company_id;
  
  -- Construir respuesta completa
  result := jsonb_build_object(
    'isActive', true,
    'subscription', jsonb_build_object(
      'id', subscription.id,
      'status', subscription.status,
      'currentPeriodStart', subscription.current_period_start,
      'currentPeriodEnd', subscription.current_period_end,
      'cancelAtPeriodEnd', subscription.cancel_at_period_end,
      'stripeCustomerId', subscription.stripe_customer_id,
      'stripeSubscriptionId', subscription.stripe_subscription_id
    ),
    'plan', jsonb_build_object(
      'id', subscription.plan_id,
      'name', subscription.plan_name,
      'description', subscription.plan_description,
      'price', subscription.plan_price,
      'interval', subscription.plan_interval,
      'features', subscription.plan_features
    ),
    'resourceCounts', jsonb_build_object(
      'desarrollos', resource_counts.desarrollos_count,
      'prototipos', resource_counts.prototipos_count,
      'vendedores', resource_counts.vendedores_count,
      'leads', resource_counts.leads_count,
      'ventas', resource_counts.ventas_count
    ),
    'limits', jsonb_build_object(
      'maxRecursos', (subscription.plan_features->>'max_recursos')::INTEGER,
      'maxVendedores', (subscription.plan_features->>'max_vendedores')::INTEGER,
      'tipo', subscription.plan_features->>'tipo'
    )
  );
  
  RETURN result;
END;
$$;

-- 4. Function para métricas de ingresos por período
CREATE OR REPLACE FUNCTION get_revenue_by_period(
  company_id integer,
  period_months integer DEFAULT 6
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  revenue_data JSONB := '[]'::jsonb;
  month_record RECORD;
BEGIN
  -- Generar datos de ingresos por mes
  FOR month_record IN
    WITH months AS (
      SELECT 
        date_trunc('month', CURRENT_DATE - (i || ' months')::interval) as month_start,
        to_char(CURRENT_DATE - (i || ' months')::interval, 'Mon') as month_name
      FROM generate_series(period_months - 1, 0, -1) as i
    )
    SELECT 
      m.month_name,
      COALESCE(SUM(pg.monto), 0) as ingresos
    FROM months m
    LEFT JOIN pagos pg ON date_trunc('month', pg.fecha) = m.month_start
      AND pg.estado = 'registrado'
      AND pg.comprador_venta_id IN (
        SELECT cv.id FROM compradores_venta cv
        JOIN ventas v ON cv.venta_id = v.id
        JOIN unidades u ON v.unidad_id = u.id
        JOIN prototipos p ON u.prototipo_id = p.id
        JOIN desarrollos d ON p.desarrollo_id = d.id
        WHERE d.empresa_id = company_id
      )
    GROUP BY m.month_name, m.month_start
    ORDER BY m.month_start
  LOOP
    revenue_data := revenue_data || jsonb_build_object(
      'name', month_record.month_name,
      'ingresos', month_record.ingresos
    );
  END LOOP;
  
  RETURN revenue_data;
END;
$$;