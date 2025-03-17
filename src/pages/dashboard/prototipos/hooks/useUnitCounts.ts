
import { useMemo } from 'react';

interface UnitCounts {
  disponibles: number;
  vendidas: number;
  con_anticipo: number;
}

export const useUnitCounts = (unidades: any[]): UnitCounts => {
  const counts = useMemo(() => {
    if (unidades.length === 0) {
      return {
        disponibles: 0,
        vendidas: 0,
        con_anticipo: 0
      };
    }
    
    return {
      disponibles: unidades.filter(u => u.estado === 'disponible').length,
      vendidas: unidades.filter(u => u.estado === 'vendido').length,
      con_anticipo: unidades.filter(u => u.estado === 'apartado' || u.estado === 'en_proceso').length
    };
  }, [unidades]);
  
  return counts;
};

export default useUnitCounts;
