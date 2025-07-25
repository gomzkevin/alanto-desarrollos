-- FIX SECURITY DEFINER VIEWS
-- Drop and recreate views without SECURITY DEFINER

-- Drop the existing views
DROP VIEW IF EXISTS public.dashboard_metrics_view;
DROP VIEW IF EXISTS public.company_ventas_view;

-- Recreate dashboard_metrics_view without SECURITY DEFINER
CREATE VIEW public.dashboard_metrics_view AS
SELECT e.id AS empresa_id,
    e.nombre AS empresa_nombre,
    COALESCE(lead_stats.total_leads, (0)::bigint) AS total_leads,
    COALESCE(lead_stats.prospectos_activos, (0)::bigint) AS prospectos_activos,
    COALESCE(cotiz_stats.total_cotizaciones, (0)::bigint) AS total_cotizaciones,
    COALESCE(venta_stats.total_ventas, (0)::bigint) AS total_ventas,
    COALESCE(inventory_stats.total_unidades, (0)::bigint) AS total_unidades,
    COALESCE(inventory_stats.unidades_disponibles, (0)::bigint) AS unidades_disponibles,
    COALESCE(inventory_stats.unidades_reservadas, (0)::bigint) AS unidades_reservadas,
    COALESCE(inventory_stats.unidades_vendidas, (0)::bigint) AS unidades_vendidas,
    COALESCE(revenue_stats.ingresos_mes_actual, (0)::numeric) AS ingresos_mes_actual
   FROM (((((empresa_info e
     LEFT JOIN ( SELECT leads.empresa_id,
            count(*) AS total_leads,
            count(*) FILTER (WHERE (leads.estado = 'convertido'::text)) AS prospectos_activos
           FROM leads
          WHERE (leads.empresa_id IS NOT NULL)
          GROUP BY leads.empresa_id) lead_stats ON ((e.id = lead_stats.empresa_id)))
     LEFT JOIN ( SELECT d.empresa_id,
            count(c.id) AS total_cotizaciones
           FROM (cotizaciones c
             JOIN desarrollos d ON ((c.desarrollo_id = d.id)))
          GROUP BY d.empresa_id) cotiz_stats ON ((e.id = cotiz_stats.empresa_id)))
     LEFT JOIN ( SELECT d.empresa_id,
            count(v.id) AS total_ventas
           FROM (((ventas v
             JOIN unidades u ON ((v.unidad_id = u.id)))
             JOIN prototipos p ON ((u.prototipo_id = p.id)))
             JOIN desarrollos d ON ((p.desarrollo_id = d.id)))
          GROUP BY d.empresa_id) venta_stats ON ((e.id = venta_stats.empresa_id)))
     LEFT JOIN ( SELECT d.empresa_id,
            count(u.id) AS total_unidades,
            count(u.id) FILTER (WHERE ((u.estado)::text = 'disponible'::text)) AS unidades_disponibles,
            count(u.id) FILTER (WHERE ((u.estado)::text = ANY (ARRAY[('apartado'::character varying)::text, ('en_proceso'::character varying)::text]))) AS unidades_reservadas,
            count(u.id) FILTER (WHERE ((u.estado)::text = 'vendido'::text)) AS unidades_vendidas
           FROM ((unidades u
             JOIN prototipos p ON ((u.prototipo_id = p.id)))
             JOIN desarrollos d ON ((p.desarrollo_id = d.id)))
          GROUP BY d.empresa_id) inventory_stats ON ((e.id = inventory_stats.empresa_id)))
     LEFT JOIN ( SELECT d.empresa_id,
            COALESCE(sum(pg.monto), (0)::numeric) AS ingresos_mes_actual
           FROM (((((pagos pg
             JOIN compradores_venta cv ON ((pg.comprador_venta_id = cv.id)))
             JOIN ventas v ON ((cv.venta_id = v.id)))
             JOIN unidades u ON ((v.unidad_id = u.id)))
             JOIN prototipos p ON ((u.prototipo_id = p.id)))
             JOIN desarrollos d ON ((p.desarrollo_id = d.id)))
          WHERE ((pg.estado = 'registrado'::text) AND (date_trunc('month'::text, pg.fecha) = date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone)))
          GROUP BY d.empresa_id) revenue_stats ON ((e.id = revenue_stats.empresa_id)));

-- Recreate company_ventas_view without SECURITY DEFINER
CREATE VIEW public.company_ventas_view AS
SELECT v.id AS venta_id,
    v.precio_total,
    v.estado AS venta_estado,
    v.fecha_inicio,
    v.fecha_actualizacion,
    v.es_fraccional,
    v.notas,
    u.id AS unidad_id,
    u.numero AS unidad_numero,
    u.nivel AS unidad_nivel,
    u.estado AS unidad_estado,
    p.id AS prototipo_id,
    p.nombre AS prototipo_nombre,
    p.tipo AS prototipo_tipo,
    p.precio AS prototipo_precio,
    d.id AS desarrollo_id,
    d.nombre AS desarrollo_nombre,
    d.ubicacion AS desarrollo_ubicacion,
    d.empresa_id,
    cv.id AS comprador_venta_id,
    cv.monto_comprometido,
    cv.porcentaje_propiedad,
    l.id AS lead_id,
    l.nombre AS comprador_nombre,
    l.email AS comprador_email,
    l.telefono AS comprador_telefono,
    usr.id AS vendedor_id,
    usr.nombre AS vendedor_nombre,
    pago_stats.total_pagado,
    pago_stats.pagos_pendientes,
        CASE
            WHEN (v.precio_total > (0)::numeric) THEN round(((COALESCE(pago_stats.total_pagado, (0)::numeric) / v.precio_total) * (100)::numeric), 2)
            ELSE (0)::numeric
        END AS progreso_pago_porcentaje
   FROM (((((((ventas v
     JOIN unidades u ON ((v.unidad_id = u.id)))
     JOIN prototipos p ON ((u.prototipo_id = p.id)))
     JOIN desarrollos d ON ((p.desarrollo_id = d.id)))
     LEFT JOIN compradores_venta cv ON ((v.id = cv.venta_id)))
     LEFT JOIN leads l ON ((cv.comprador_id = l.id)))
     LEFT JOIN usuarios usr ON ((cv.vendedor_id = usr.id)))
     LEFT JOIN ( SELECT cv_1.venta_id,
            COALESCE(sum(pg.monto) FILTER (WHERE (pg.estado = 'registrado'::text)), (0)::numeric) AS total_pagado,
            count(pg.id) FILTER (WHERE (pg.estado = 'pendiente'::text)) AS pagos_pendientes
           FROM (compradores_venta cv_1
             LEFT JOIN pagos pg ON ((cv_1.id = pg.comprador_venta_id)))
          GROUP BY cv_1.venta_id) pago_stats ON ((v.id = pago_stats.venta_id)));