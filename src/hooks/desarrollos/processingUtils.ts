
import { DesarrolloExtended } from './types';

/**
 * Safely processes amenidades data from various possible formats into a string array
 */
export function processAmenidades(desarrollo: any): string[] {
  if (!desarrollo || !desarrollo.amenidades) {
    return [];
  }

  try {
    if (typeof desarrollo.amenidades === 'string') {
      return JSON.parse(desarrollo.amenidades);
    } else if (Array.isArray(desarrollo.amenidades)) {
      return desarrollo.amenidades.map(val => String(val));
    } else if (typeof desarrollo.amenidades === 'object' && desarrollo.amenidades !== null) {
      return Object.values(desarrollo.amenidades).map(val => String(val));
    }
  } catch (e) {
    console.error('Error parsing amenidades:', e);
  }
  
  return [];
}

/**
 * Calculates statistics for a desarrollo based on its prototipos
 */
export function calculateDesarrolloStats(desarrollo: any, withStats: boolean): any {
  if (!withStats || !desarrollo.prototipos) {
    return {};
  }

  const totalPrototipos = desarrollo.prototipos.length;
  const totalUnidades = desarrollo.prototipos.reduce(
    (sum, p) => sum + (p.total_unidades || 0), 0
  );
  const unidadesDisponiblesTotal = desarrollo.prototipos.reduce(
    (sum, p) => sum + (p.unidades_disponibles || 0), 0
  );
  const unidadesVendidasTotal = desarrollo.prototipos.reduce(
    (sum, p) => sum + (p.unidades_vendidas || 0), 0
  );

  return {
    total_prototipos: totalPrototipos,
    total_unidades: totalUnidades,
    unidades_disponibles_total: unidadesDisponiblesTotal,
    unidades_vendidas_total: unidadesVendidasTotal
  };
}
