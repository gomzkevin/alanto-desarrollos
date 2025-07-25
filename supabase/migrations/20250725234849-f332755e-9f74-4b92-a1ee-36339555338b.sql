-- FIX REMAINING SECURITY WARNINGS

-- Fix remaining trigger functions that need search_path
CREATE OR REPLACE FUNCTION public.actualizar_estado_unidad_por_pagos()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  total_pagado NUMERIC;
  precio_total NUMERIC;
  unidad_id UUID;
  venta_id UUID;
BEGIN
  -- Obtener el ID de la venta de forma explícita con el nombre de la tabla
  SELECT cv.venta_id INTO venta_id 
  FROM public.compradores_venta cv 
  WHERE cv.id = NEW.comprador_venta_id;
  
  IF venta_id IS NOT NULL THEN
    -- Obtener unidad_id y precio_total
    SELECT v.unidad_id, v.precio_total INTO unidad_id, precio_total 
    FROM public.ventas v 
    WHERE v.id = venta_id;
    
    -- Calcular el total pagado para esta venta (todos los compradores)
    -- Usar nombres de tabla explícitos para evitar ambigüedad
    SELECT COALESCE(SUM(p.monto), 0) INTO total_pagado
    FROM public.pagos p
    JOIN public.compradores_venta cv ON p.comprador_venta_id = cv.id
    WHERE cv.venta_id = venta_id AND p.estado = 'verificado';
    
    -- Actualizar el estado de la venta
    IF total_pagado >= precio_total THEN
      UPDATE public.ventas SET estado = 'completada' WHERE id = venta_id;
      -- Actualizar el estado de la unidad
      UPDATE public.unidades SET estado = 'vendido' WHERE id = unidad_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.crear_comprador_venta()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  venta_id UUID;
BEGIN
  -- Si el estado cambia a apartado o en_proceso y se asigna un comprador
  IF (NEW.estado = 'apartado' OR NEW.estado = 'en_proceso') AND 
     NEW.comprador_id IS NOT NULL AND
     (OLD.comprador_id IS NULL OR OLD.comprador_id != NEW.comprador_id) THEN
    
    -- Obtener el ID de la venta
    SELECT id INTO venta_id FROM public.ventas WHERE unidad_id = NEW.id;
    
    IF venta_id IS NOT NULL THEN
      -- Verificar si ya existe un registro para este comprador en esta venta
      IF NOT EXISTS (
        SELECT 1 
        FROM public.compradores_venta 
        WHERE venta_id = venta_id AND comprador_id = NEW.comprador_id
      ) THEN
        -- Insertar registro de comprador_venta
        INSERT INTO public.compradores_venta (
          venta_id,
          comprador_id,
          vendedor_id,
          porcentaje_propiedad,
          monto_comprometido
        )
        SELECT 
          venta_id,
          NEW.comprador_id,
          NEW.vendedor_id,
          100, -- 100% para ventas no fraccionales
          (SELECT precio_total FROM public.ventas WHERE id = venta_id)
        RETURNING id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.crear_venta_desde_unidad()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  -- Si el estado cambia a apartado o en_proceso
  IF (NEW.estado = 'apartado' OR NEW.estado = 'en_proceso') AND 
     (OLD.estado = 'disponible' OR OLD.estado IS NULL) THEN
    
    -- Verificar si ya existe una venta para esta unidad
    IF NOT EXISTS (SELECT 1 FROM public.ventas WHERE unidad_id = NEW.id) THEN
      -- Obtener el precio del prototipo como precio_total
      INSERT INTO public.ventas (
        unidad_id, 
        precio_total,
        estado
      )
      SELECT 
        NEW.id,
        COALESCE(NEW.precio_venta, (SELECT precio FROM public.prototipos WHERE id = NEW.prototipo_id)),
        'en_proceso'
      RETURNING id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;