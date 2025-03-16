import { useState, useEffect, useRef } from 'react';
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { supabase, fetchFinancialConfig } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { toast } from "sonner";

interface FinancialConfig {
  comision_operador: number;
  mantenimiento_valor: number;
  es_mantenimiento_porcentaje: boolean;
  gastos_fijos: number;
  es_gastos_fijos_porcentaje: boolean;
  gastos_variables: number;
  es_gastos_variables_porcentaje: boolean;
  impuestos: number;
  es_impuestos_porcentaje: boolean;
  plusvalia_anual: number;
  tasa_interes: number;
}

interface CalculatorProps {
  desarrolloId?: string;
  prototipoId?: string;
  onDataUpdate?: (data: any[]) => void;
  shouldCalculate?: boolean;
}

export const Calculator = ({ desarrolloId, prototipoId, onDataUpdate, shouldCalculate = false }: CalculatorProps) => {
  const [propertyValue, setPropertyValue] = useState(3500000);
  const [occupancyRate, setOccupancyRate] = useState(74); // percentage
  const [nightlyRate, setNightlyRate] = useState(1800);
  const [years, setYears] = useState(10);
  const [annualGrowth, setAnnualGrowth] = useState(5); // percentage
  const [financialConfig, setFinancialConfig] = useState<FinancialConfig>({
    comision_operador: 15,
    mantenimiento_valor: 5,
    es_mantenimiento_porcentaje: true,
    gastos_fijos: 2500,
    es_gastos_fijos_porcentaje: false,
    gastos_variables: 12,
    es_gastos_variables_porcentaje: true,
    impuestos: 35,
    es_impuestos_porcentaje: true,
    plusvalia_anual: 4,
    tasa_interes: 7
  });
  
  const [chartData, setChartData] = useState<any[]>([]);
  const calculatorRef = useRef<HTMLDivElement>(null);
  
  const form = useForm({
    defaultValues: {
      propertyValue: propertyValue,
      occupancyRate: occupancyRate,
      nightlyRate: nightlyRate,
      annualGrowth: annualGrowth,
      years: years,
    }
  });

  useEffect(() => {
    const getFinancialConfig = async () => {
      try {
        if (prototipoId && prototipoId !== 'global') {
          const { data: prototipoData, error: prototipoError } = await supabase
            .from('prototipos')
            .select('*, precio')
            .eq('id', prototipoId)
            .single();
            
          if (prototipoError) {
            console.error('Error fetching prototipo data:', prototipoError);
          } else if (prototipoData) {
            if (prototipoData.precio) {
              setPropertyValue(prototipoData.precio);
            }
          }
        }
        
        const configData = await fetchFinancialConfig(desarrolloId);
        
        if (configData) {
          const config: FinancialConfig = {
            comision_operador: configData.comision_operador || 15,
            mantenimiento_valor: configData.mantenimiento_valor || 5,
            es_mantenimiento_porcentaje: configData.es_mantenimiento_porcentaje !== null ? configData.es_mantenimiento_porcentaje : true,
            gastos_fijos: configData.gastos_fijos || 2500,
            es_gastos_fijos_porcentaje: configData.es_gastos_fijos_porcentaje !== null ? configData.es_gastos_fijos_porcentaje : false,
            gastos_variables: configData.gastos_variables || 12,
            es_gastos_variables_porcentaje: configData.es_gastos_variables_porcentaje !== null ? configData.es_gastos_variables_porcentaje : true,
            impuestos: configData.impuestos || 35,
            es_impuestos_porcentaje: configData.es_impuestos_porcentaje !== null ? configData.es_impuestos_porcentaje : true,
            plusvalia_anual: configData.plusvalia_anual || 4,
            tasa_interes: configData.tasa_interes || 7
          };
          
          setFinancialConfig(config);
          
          if ((!prototipoId || prototipoId === 'global') && configData) {
            if (configData.adr_base) {
              setNightlyRate(configData.adr_base);
            }
            
            if (configData.ocupacion_anual) {
              setOccupancyRate(configData.ocupacion_anual);
            }
          }
        }
      } catch (err) {
        console.error('Error in financial config fetch:', err);
      }
    };
    
    getFinancialConfig();
  }, [desarrolloId, prototipoId]);
  
  useEffect(() => {
    if (!shouldCalculate && chartData.length > 0) return;
    
    const annualRevenue = nightlyRate * 365 * (occupancyRate / 100);
    
    const {
      comision_operador,
      mantenimiento_valor,
      es_mantenimiento_porcentaje,
      gastos_variables,
      es_gastos_variables_porcentaje,
      gastos_fijos,
      es_gastos_fijos_porcentaje,
      impuestos,
      es_impuestos_porcentaje,
      plusvalia_anual,
      tasa_interes
    } = financialConfig;
    
    let data = [];
    let airbnbCumulativeProfit = 0;
    
    for (let year = 1; year <= years; year++) {
      const yearlyGrowthFactor = Math.pow(1 + (annualGrowth / 100), year - 1);
      const thisYearRevenue = annualRevenue * yearlyGrowthFactor;
      
      const operatorCommission = thisYearRevenue * (comision_operador / 100);
      
      const maintenanceCost = es_mantenimiento_porcentaje 
        ? propertyValue * (mantenimiento_valor / 100) 
        : mantenimiento_valor;
        
      const variableExpenses = es_gastos_variables_porcentaje 
        ? thisYearRevenue * (gastos_variables / 100) 
        : gastos_variables;
        
      const fixedExpenses = es_gastos_fijos_porcentaje 
        ? propertyValue * (gastos_fijos / 100) 
        : gastos_fijos;
      
      const taxableBase = thisYearRevenue - operatorCommission - maintenanceCost - variableExpenses - fixedExpenses;
      const taxAmount = es_impuestos_porcentaje 
        ? taxableBase * (impuestos / 100) 
        : impuestos;
      
      const thisYearNetProfit = taxableBase - taxAmount;
      airbnbCumulativeProfit += thisYearNetProfit;
      
      const propertyAppreciation = propertyValue * (Math.pow(1 + (plusvalia_anual / 100), year) - 1);
      
      const alternativeInvestmentReturn = propertyValue * (Math.pow(1 + (tasa_interes / 100), year) - 1);
      
      const annualRoi = (thisYearNetProfit / propertyValue) * 100;
      
      const airbnbTotalValue = propertyValue + airbnbCumulativeProfit + propertyAppreciation;
      const alternativeTotalValue = propertyValue + alternativeInvestmentReturn;
      
      const difference = airbnbTotalValue - alternativeTotalValue;
      
      let adjustedOccupancyRate = occupancyRate;
      if (year <= 5) {
        adjustedOccupancyRate = occupancyRate - (5 - year) * 2;
      }
      
      const adjustedNightlyRate = nightlyRate * yearlyGrowthFactor;
      
      data.push({
        year,
        airbnbProfit: airbnbTotalValue,
        alternativeInvestment: alternativeTotalValue,
        yearlyROI: annualRoi.toFixed(1),
        difference: difference,
        thisYearNetProfit: thisYearNetProfit,
        initialPropertyValue: propertyValue,
        occupancyRate: adjustedOccupancyRate,
        nightlyRate: adjustedNightlyRate,
        comisionOperador: comision_operador,
        gastosFijos: gastos_fijos,
        gastosVariables: gastos_variables,
        mantenimientoValor: mantenimiento_valor,
        esMantenimientoPorcentaje: es_mantenimiento_porcentaje,
        impuestos: impuestos
      });
    }
    
    setChartData(data);
    
    if (onDataUpdate) {
      onDataUpdate(data);
    }
  }, [propertyValue, occupancyRate, nightlyRate, years, annualGrowth, financialConfig, shouldCalculate, onDataUpdate]);
  
  const handleNightlyRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setNightlyRate(value === '' ? 0 : Number(value));
  };
  
  return (
    <div className="space-y-6" ref={calculatorRef}>
      <Form {...form}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-5 p-6 bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-medium text-slate-800 mb-4">Propiedad e Inversión</h3>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-700 flex items-center">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></span>
                  Valor de la propiedad: {formatCurrency(propertyValue)}
                </label>
              </div>
              <Slider 
                value={[propertyValue]} 
                max={50000000} 
                min={1000000} 
                step={100000}
                onValueChange={(value) => setPropertyValue(value[0])}
                className="py-4"
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-700 flex items-center">
                  <span className="w-2 h-2 bg-amber-600 rounded-full mr-2"></span>
                  Años para proyección: {years}
                </label>
              </div>
              <Slider 
                value={[years]} 
                max={20} 
                min={1} 
                step={1}
                onValueChange={(value) => setYears(value[0])}
                className="py-4"
              />
            </div>
          </div>
          
          <div className="space-y-5 p-6 bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-medium text-slate-800 mb-4">Parámetros de Renta</h3>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-700 flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                  Porcentaje de ocupación anual: {occupancyRate}%
                </label>
              </div>
              <Slider 
                value={[occupancyRate]} 
                max={100} 
                min={40} 
                step={1}
                onValueChange={(value) => setOccupancyRate(value[0])}
                className="py-4"
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center">
                <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                Tarifa promedio por noche (MXN)
              </label>
              <Input 
                type="text" 
                value={formatCurrency(nightlyRate)} 
                onChange={handleNightlyRateChange}
                className="border border-slate-300"
                aria-label="Tarifa promedio por noche"
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-700 flex items-center">
                  <span className="w-2 h-2 bg-emerald-600 rounded-full mr-2"></span>
                  Crecimiento anual: {annualGrowth}%
                </label>
              </div>
              <Slider 
                value={[annualGrowth]} 
                max={10} 
                min={0} 
                step={0.5}
                onValueChange={(value) => setAnnualGrowth(value[0])}
                className="py-4"
              />
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default Calculator;
