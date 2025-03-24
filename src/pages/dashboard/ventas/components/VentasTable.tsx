
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVentas } from '@/hooks/useVentas';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { VentaProgress } from './VentaProgress';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface VentasTableProps {
  refreshTrigger?: number;
}

type VentaWithPayments = {
  id: string;
  progreso: number;
  montoPagado: number;
}

export const VentasTable = ({ refreshTrigger = 0 }: VentasTableProps) => {
  const { ventas, isLoading, refetch } = useVentas();
  const [ventasPayments, setVentasPayments] = useState<Record<string, VentaWithPayments>>({});
  const [loadingPayments, setLoadingPayments] = useState(false);
  const { empresaId } = useUserRole();
  const navigate = useNavigate();
  
  // Efecto para refrescar cuando cambia el trigger
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('Refrescando ventas por trigger:', refreshTrigger);
      refetch();
    }
  }, [refreshTrigger, refetch]);

  // Efecto para refrescar cuando cambia empresaId
  useEffect(() => {
    if (empresaId) {
      console.log('Refrescando ventas por cambio de empresaId:', empresaId);
      refetch();
    }
  }, [empresaId, refetch]);

  // Fetch all payments for ventas to accurately display progress
  useEffect(() => {
    const fetchVentasPayments = async () => {
      if (!ventas.length) return;
      
      setLoadingPayments(true);
      try {
        // First get all compradores_venta for all ventas
        const ventaIds = ventas.map(v => v.id);
        console.log('Fetching payments for ventas:', ventaIds);
        
        const { data: compradoresVenta, error: errorCompradores } = await supabase
          .from('compradores_venta')
          .select('id, venta_id')
          .in('venta_id', ventaIds);
        
        if (errorCompradores) {
          console.error('Error fetching compradores:', errorCompradores);
          throw errorCompradores;
        }
        
        if (!compradoresVenta || compradoresVenta.length === 0) {
          // No compradores found for any ventas
          console.log('No compradores found for ventas');
          const emptyPayments = ventaIds.reduce((acc, ventaId) => {
            acc[ventaId] = { id: ventaId, progreso: 0, montoPagado: 0 };
            return acc;
          }, {} as Record<string, VentaWithPayments>);
          setVentasPayments(emptyPayments);
          return;
        }
        
        // Group compradores by venta_id
        const compradoresByVenta = compradoresVenta.reduce((acc, item) => {
          if (!acc[item.venta_id]) {
            acc[item.venta_id] = [];
          }
          acc[item.venta_id].push(item.id);
          return acc;
        }, {} as Record<string, string[]>);
        
        // For each venta with compradores, fetch pagos
        const paymentsData: Record<string, VentaWithPayments> = {};
        
        for (const ventaId of ventaIds) {
          const compradorIds = compradoresByVenta[ventaId] || [];
          let montoPagado = 0;
          
          if (compradorIds.length > 0) {
            // Get pagos for each comprador
            const { data: pagos, error: errorPagos } = await supabase
              .from('pagos')
              .select('monto, estado')
              .in('comprador_venta_id', compradorIds)
              .eq('estado', 'registrado');
            
            if (errorPagos) {
              console.error('Error fetching pagos:', errorPagos);
            } else if (pagos) {
              montoPagado = pagos.reduce((sum, pago) => sum + pago.monto, 0);
            }
          }
          
          // Find the corresponding venta to calculate progress
          const venta = ventas.find(v => v.id === ventaId);
          const progreso = venta?.precio_total 
            ? Math.round((montoPagado / venta.precio_total) * 100)
            : 0;
          
          paymentsData[ventaId] = {
            id: ventaId,
            progreso,
            montoPagado
          };
        }
        
        setVentasPayments(paymentsData);
      } catch (error) {
        console.error('Error fetching payments data:', error);
      } finally {
        setLoadingPayments(false);
      }
    };
    
    fetchVentasPayments();
  }, [ventas]);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'en_proceso':
        return <Badge variant="secondary">En Proceso</Badge>;
      case 'completada':
        return <Badge variant="success">Completada</Badge>;
      case 'cancelada':
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  const handleRowClick = (ventaId: string) => {
    navigate(`/dashboard/ventas/${ventaId}`);
  };

  if (isLoading || loadingPayments) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando ventas...</p>
        </div>
      </div>
    );
  }

  if (ventas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h3 className="text-xl font-semibold mb-2">No hay ventas registradas</h3>
        <p className="text-muted-foreground mb-4">
          Actualiza el estado de tus unidades para comenzar a dar seguimiento a tus ventas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[35%]">Desarrollo / Unidad</TableHead>
                <TableHead className="w-[12%]">Tipo</TableHead>
                <TableHead className="w-[15%]">Precio Total</TableHead>
                <TableHead className="w-[25%]">Progreso</TableHead>
                <TableHead className="w-[13%]">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ventas.map((venta) => {
                const paymentData = ventasPayments[venta.id] || { progreso: 0, montoPagado: 0 };
                
                return (
                  <TableRow 
                    key={venta.id} 
                    className="cursor-pointer hover:bg-muted/30"
                    onClick={() => handleRowClick(venta.id)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{venta.unidad?.prototipo?.desarrollo?.nombre || 'Desarrollo'}</p>
                        <p className="text-sm text-muted-foreground">
                          {venta.unidad?.prototipo?.nombre || 'Prototipo'} - Unidad {venta.unidad?.numero || 'N/A'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {venta.es_fraccional ? (
                        <Badge variant="outline">Fraccional</Badge>
                      ) : (
                        <Badge variant="outline">Individual</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(venta.precio_total)}</TableCell>
                    <TableCell>
                      <VentaProgress 
                        progreso={paymentData.progreso} 
                        montoTotal={venta.precio_total} 
                        montoPagado={paymentData.montoPagado}
                      />
                    </TableCell>
                    <TableCell>{getEstadoBadge(venta.estado)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default VentasTable;
