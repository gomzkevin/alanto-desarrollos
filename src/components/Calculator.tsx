
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

// Define an interface for the financial configuration
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

// Add props interface to accept a desarrollo_id and onDataUpdate callback
interface CalculatorProps {
  desarrolloId?: string;
  prototipoId?: string;
  onDataUpdate?: (data: any[]) => void;
  shouldCalculate?: boolean;
}

export const Calculator = ({ desarrolloId, prototipoId, onDataUpdate, shouldCalculate = false }: CalculatorProps) => {
  const [propertyValue, setPropertyValue] = useState(3500000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);  // Anticipo: 20%
  const [downPaymentAmount, setDownPaymentAmount] = useState(700000); // 20% of 3,500,000
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
      downPaymentPercent: downPaymentPercent,
      occupancyRate: occupancyRate,
      nightlyRate: nightlyRate,
      annualGrowth: annualGrowth,
      years: years,
    }
  });

  // Calculate the down payment amount when propertyValue or downPaymentPercent changes
  useEffect(() => {
    const amount = (propertyValue * downPaymentPercent) / 100;
    setDownPaymentAmount(amount);
  }, [propertyValue, downPaymentPercent]);

  // Fetch financial configuration from Supabase based on desarrollo_id and prototipo_id
  useEffect(() => {
    const getFinancialConfig = async () => {
      try {
        // If we have a prototipo_id, we prioritize its configuration
        if (prototipoId && prototipoId !== 'global') {
          // Try to get prototipo-specific configuration
          const { data: prototipoData, error: prototipoError } = await supabase
            .from('prototipos')
            .select('*, precio')
            .eq('id', prototipoId)
            .single();
            
          if (prototipoError) {
            console.error('Error fetching prototipo data:', prototipoError);
          } else if (prototipoData) {
            // Set property value from prototipo price if available
            if (prototipoData.precio) {
              setPropertyValue(prototipoData.precio);
            }
          }
        }
        
        // Proceed with fetching financial configuration (either desarrollo-specific or global)
        const configData = await fetchFinancialConfig(desarrolloId);
        
        if (configData) {
          // Convert the Supabase data to match our financialConfig state structure
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
          
          // If no prototipo is selected or no values were found, use desarrollo settings
          if ((!prototipoId || prototipoId === 'global') && configData) {
            // Set nightly rate if available
            if (configData.adr_base) {
              setNightlyRate(configData.adr_base);
            }
            
            // Set occupancy rate if available
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
  
  // Calculate the projection data when shouldCalculate is true
  useEffect(() => {
    if (!shouldCalculate && chartData.length > 0) return;
    
    const annualRevenue = nightlyRate * 365 * (occupancyRate / 100);
    
    // Get financial parameters
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
      // Calculate Airbnb investment
      const yearlyGrowthFactor = Math.pow(1 + (annualGrowth / 100), year - 1);
      const thisYearRevenue = annualRevenue * yearlyGrowthFactor;
      
      // Calculate expenses based on configuration
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
      
      // Calculate taxable base and taxes
      const taxableBase = thisYearRevenue - operatorCommission - maintenanceCost - variableExpenses - fixedExpenses;
      const taxAmount = es_impuestos_porcentaje 
        ? taxableBase * (impuestos / 100) 
        : impuestos;
      
      // Calculate net profit for this year
      const thisYearNetProfit = taxableBase - taxAmount;
      airbnbCumulativeProfit += thisYearNetProfit;
      
      // Property appreciation (estimated using plusvalia_anual)
      const propertyAppreciation = propertyValue * (Math.pow(1 + (plusvalia_anual / 100), year) - 1);
      
      // Calculate alternative investment - using full property value instead of just down payment
      const alternativeInvestmentReturn = propertyValue * (Math.pow(1 + (tasa_interes / 100), year) - 1);
      
      // Return on Investment (ROI) based on full property value
      const annualRoi = (thisYearNetProfit / propertyValue) * 100;
      
      // Add initial property value to both calculations to start from the initial investment
      const airbnbTotalValue = propertyValue + airbnbCumulativeProfit + propertyAppreciation;
      const alternativeTotalValue = propertyValue + alternativeInvestmentReturn;
      
      // Difference between Airbnb value and alternative investment
      const difference = airbnbTotalValue - alternativeTotalValue;
      
      data.push({
        year,
        airbnbProfit: airbnbTotalValue,
        alternativeInvestment: alternativeTotalValue,
        yearlyROI: annualRoi.toFixed(1),
        difference: difference,
        thisYearNetProfit: thisYearNetProfit,
        initialPropertyValue: propertyValue // Store the initial property value for reference
      });
    }
    
    setChartData(data);
    
    // Pass the data to the parent component if the callback exists
    if (onDataUpdate) {
      onDataUpdate(data);
    }
  }, [propertyValue, occupancyRate, nightlyRate, years, annualGrowth, financialConfig, shouldCalculate, onDataUpdate]);
  
  return (
    <div className="space-y-6" ref={calculatorRef}>
      <Form {...form}>
        <div className="space-y-5">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-700">
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
              <label className="text-sm font-medium text-slate-700">
                Anticipo: {downPaymentPercent}% ({formatCurrency(downPaymentAmount)})
              </label>
            </div>
            <Slider 
              value={[downPaymentPercent]} 
              max={100} 
              min={10} 
              step={1}
              onValueChange={(value) => setDownPaymentPercent(value[0])}
              className="py-4"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-700">
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
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tarifa promedio por noche (MXN)
            </label>
            <Input 
              type="number" 
              value={nightlyRate} 
              formatCurrency={true}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                // Extract the numeric value from the input
                const value = e.target.value.replace(/[^0-9]/g, '');
                setNightlyRate(value === '' ? 0 : Number(value));
              }}
              className="border border-slate-300"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-700">
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
          
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-700">
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
      </Form>
    </div>
  );
};

export default Calculator;
