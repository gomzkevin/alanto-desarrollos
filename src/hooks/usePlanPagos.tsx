
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Pago } from './usePagos';

export interface PlanPago {
  id: string;
  comprador_venta_id: string;
  monto_total: number;
  plazo_meses: number;
  monto_mensual: number;
  dia_pago: number;
  anticipo: number;
  fecha_anticipo: string | null;
  incluye_finiquito: boolean;
  monto_finiquito: number | null;
  fecha_finiquito: string | null;
  created_at: string;
}

export interface PagoCalendarizado {
  numero: number;
  fecha: string;
  monto: number;
  descripcion: string;
  estado: 'pendiente' | 'pagado' | 'atrasado';
  pagado_id?: string;
  pagos_aplicados?: Pago[]; // Added to track multiple payments applied to a scheduled payment
  monto_pendiente?: number; // Added to track remaining amount for partial payments
}

export const usePlanPagos = (compradorVentaId?: string) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  
  // Fetch existing payment plan
  const fetchPlanPagos = async (): Promise<PlanPago | null> => {
    if (!compradorVentaId) return null;
    
    try {
      const { data, error } = await supabase
        .from('plan_pagos')
        .select('*')
        .eq('comprador_venta_id', compradorVentaId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error al obtener plan de pagos:', error);
      return null;
    }
  };
  
  const { data: planPagos, isLoading, error, refetch } = useQuery({
    queryKey: ['plan-pagos', compradorVentaId],
    queryFn: fetchPlanPagos,
    enabled: !!compradorVentaId
  });
  
  // Generate payment schedule based on plan
  const generatePaymentSchedule = (plan: PlanPago | null, pagos: Pago[]): PagoCalendarizado[] => {
    if (!plan) return [];
    
    const schedule: PagoCalendarizado[] = [];
    const today = new Date();
    
    // Group payments by month/year to handle partial payments
    const pagosPorFecha: Record<string, Pago[]> = {};
    
    pagos.forEach(pago => {
      const pagoDate = new Date(pago.fecha);
      const key = `${pagoDate.getFullYear()}-${pagoDate.getMonth() + 1}`;
      
      if (!pagosPorFecha[key]) {
        pagosPorFecha[key] = [];
      }
      
      pagosPorFecha[key].push(pago);
    });
    
    // Add down payment if it exists
    if (plan.anticipo > 0 && plan.fecha_anticipo) {
      const anticipoDate = new Date(plan.fecha_anticipo);
      const anticipoKey = `${anticipoDate.getFullYear()}-${anticipoDate.getMonth() + 1}`;
      const pagosAnticipo = pagosPorFecha[anticipoKey] || [];
      
      // Find payments that could be for anticipo
      const pagosAnticipoMatch = pagosAnticipo.filter(pago => {
        const pagoDate = new Date(pago.fecha);
        // Match payments that are +/- 5 days from the anticipo date
        return Math.abs(pagoDate.getTime() - anticipoDate.getTime()) <= 5 * 24 * 60 * 60 * 1000;
      });
      
      const totalPagado = pagosAnticipoMatch.reduce((sum, pago) => sum + pago.monto, 0);
      const montoPendiente = Math.max(0, plan.anticipo - totalPagado);
      
      schedule.push({
        numero: 0,
        fecha: plan.fecha_anticipo,
        monto: plan.anticipo,
        descripcion: 'Anticipo',
        estado: montoPendiente <= 0 ? 'pagado' : 
                (anticipoDate < today ? 'atrasado' : 'pendiente'),
        pagos_aplicados: pagosAnticipoMatch,
        monto_pendiente: montoPendiente
      });
    }
    
    // Add monthly payments
    const startDate = plan.fecha_anticipo ? new Date(plan.fecha_anticipo) : new Date();
    startDate.setDate(plan.dia_pago || 1); // Set to payment day
    
    for (let i = 0; i < plan.plazo_meses; i++) {
      const paymentDate = new Date(startDate);
      paymentDate.setMonth(paymentDate.getMonth() + i + 1); // Start next month
      
      const formattedDate = paymentDate.toISOString();
      const pagoKey = `${paymentDate.getFullYear()}-${paymentDate.getMonth() + 1}`;
      const pagosMensuales = pagosPorFecha[pagoKey] || [];
      
      // Find payments for this month
      const pagosMensualesMatch = pagosMensuales.filter(pago => {
        const pagoDate = new Date(pago.fecha);
        // Match payments that are within the same month or specifically tagged for this payment
        return pagoDate.getMonth() === paymentDate.getMonth() && 
               pagoDate.getFullYear() === paymentDate.getFullYear();
      });
      
      const totalPagado = pagosMensualesMatch.reduce((sum, pago) => sum + pago.monto, 0);
      const montoPendiente = Math.max(0, plan.monto_mensual - totalPagado);
      
      schedule.push({
        numero: i + 1,
        fecha: formattedDate,
        monto: plan.monto_mensual,
        descripcion: `Pago mensual ${i + 1}`,
        estado: montoPendiente <= 0 ? 'pagado' : 
                (paymentDate < today ? 'atrasado' : 'pendiente'),
        pagos_aplicados: pagosMensualesMatch,
        monto_pendiente: montoPendiente
      });
    }
    
    // Add final payment if applicable
    if (plan.incluye_finiquito && plan.monto_finiquito && plan.fecha_finiquito) {
      const finiquitoDate = new Date(plan.fecha_finiquito);
      const finiquitoKey = `${finiquitoDate.getFullYear()}-${finiquitoDate.getMonth() + 1}`;
      const pagosFiniquito = pagosPorFecha[finiquitoKey] || [];
      
      // Find payments that could be for finiquito
      const pagosFiniquitoMatch = pagosFiniquito.filter(pago => {
        const pagoDate = new Date(pago.fecha);
        // Match payments that are +/- 5 days from the finiquito date
        return Math.abs(pagoDate.getTime() - finiquitoDate.getTime()) <= 5 * 24 * 60 * 60 * 1000;
      });
      
      const totalPagado = pagosFiniquitoMatch.reduce((sum, pago) => sum + pago.monto, 0);
      const montoPendiente = Math.max(0, plan.monto_finiquito - totalPagado);
      
      schedule.push({
        numero: plan.plazo_meses + 1,
        fecha: plan.fecha_finiquito,
        monto: plan.monto_finiquito,
        descripcion: 'Finiquito',
        estado: montoPendiente <= 0 ? 'pagado' : 
                (finiquitoDate < today ? 'atrasado' : 'pendiente'),
        pagos_aplicados: pagosFiniquitoMatch,
        monto_pendiente: montoPendiente
      });
    }
    
    return schedule;
  };
  
  // Create new payment plan
  const createPlanPagos = async (newPlan: Omit<PlanPago, 'id' | 'created_at'>) => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('plan_pagos')
        .insert(newPlan)
        .select();
      
      if (error) throw error;
      
      await refetch();
      toast({
        title: "Plan de pagos creado",
        description: "El plan de pagos ha sido creado exitosamente"
      });
      
      return data;
    } catch (error) {
      console.error('Error al crear plan de pagos:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el plan de pagos",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };
  
  // Update existing payment plan
  const updatePlanPagos = async (id: string, updatedPlan: Partial<PlanPago>) => {
    setIsUpdating(true);
    try {
      const { data, error } = await supabase
        .from('plan_pagos')
        .update(updatedPlan)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      await refetch();
      toast({
        title: "Plan de pagos actualizado",
        description: "El plan de pagos ha sido actualizado exitosamente"
      });
      
      return data;
    } catch (error) {
      console.error('Error al actualizar plan de pagos:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el plan de pagos",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };
  
  return {
    planPagos,
    isLoading,
    error,
    refetch,
    createPlanPagos,
    updatePlanPagos,
    isCreating,
    isUpdating,
    generatePaymentSchedule
  };
};

export default usePlanPagos;
