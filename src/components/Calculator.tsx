
import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

// Add props interface to accept a desarrollo_id
interface CalculatorProps {
  desarrolloId?: string;
}

export const Calculator = ({ desarrolloId }: CalculatorProps) => {
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

  // Fetch financial configuration from Supabase based on desarrollo_id
  useEffect(() => {
    const getFinancialConfig = async () => {
      try {
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
          
          // Also set initial property value and occupancy rate if they exist in config
          if (configData.adr_base) {
            setNightlyRate(configData.adr_base);
          }
          
          if (configData.ocupacion_anual) {
            setOccupancyRate(configData.ocupacion_anual);
          }
        }
      } catch (err) {
        console.error('Error in financial config fetch:', err);
      }
    };
    
    getFinancialConfig();
  }, [desarrolloId]);
  
  // Calculate the projection data
  useEffect(() => {
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
    let alternativeCumulativeProfit = 0;
    
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
      
      // Calculate alternative investment (e.g., stocks)
      const alternativeInvestmentReturn = propertyValue * (Math.pow(1 + (tasa_interes / 100), year) - 1);
      alternativeCumulativeProfit = alternativeInvestmentReturn;
      
      // Return on Investment (ROI)
      const annualRoi = (thisYearNetProfit / propertyValue) * 100;
      
      // Difference between cumulative Airbnb profit and alternative investment
      const difference = (airbnbCumulativeProfit + propertyAppreciation) - alternativeCumulativeProfit;
      
      data.push({
        year,
        airbnbProfit: airbnbCumulativeProfit + propertyAppreciation,
        alternativeInvestment: alternativeCumulativeProfit,
        yearlyROI: annualRoi.toFixed(1),
        difference: difference,
        thisYearNetProfit: thisYearNetProfit
      });
    }
    
    setChartData(data);
  }, [propertyValue, occupancyRate, nightlyRate, years, annualGrowth, financialConfig]);
  
  // Save financial configuration to Supabase
  const saveFinancialConfig = async () => {
    try {
      if (desarrolloId) {
        // Find the specific configuration entry for this desarrollo
        const { data: existingConfig, error: findError } = await supabase
          .from('configuracion_financiera')
          .select('id')
          .eq('desarrollo_id', desarrolloId)
          .maybeSingle();
          
        if (findError) {
          console.error('Error finding financial configuration:', findError);
          toast.error('Error al buscar la configuración del desarrollo');
          return;
        }
        
        if (existingConfig) {
          // Update existing configuration
          const { error } = await supabase
            .from('configuracion_financiera')
            .update({
              comision_operador: financialConfig.comision_operador,
              mantenimiento_valor: financialConfig.mantenimiento_valor,
              es_mantenimiento_porcentaje: financialConfig.es_mantenimiento_porcentaje,
              gastos_fijos: financialConfig.gastos_fijos,
              es_gastos_fijos_porcentaje: financialConfig.es_gastos_fijos_porcentaje,
              gastos_variables: financialConfig.gastos_variables,
              es_gastos_variables_porcentaje: financialConfig.es_gastos_variables_porcentaje,
              impuestos: financialConfig.impuestos,
              es_impuestos_porcentaje: financialConfig.es_impuestos_porcentaje,
              plusvalia_anual: financialConfig.plusvalia_anual,
              tasa_interes: financialConfig.tasa_interes,
              adr_base: nightlyRate,
              ocupacion_anual: occupancyRate
            })
            .eq('id', existingConfig.id);
          
          if (error) {
            console.error('Error updating financial configuration for desarrollo:', error);
            toast.error('Error al guardar la configuración del desarrollo');
          } else {
            toast.success('Configuración del desarrollo guardada correctamente');
          }
        } else {
          // Create a new configuration for this desarrollo
          const { error } = await supabase
            .from('configuracion_financiera')
            .insert({
              desarrollo_id: desarrolloId,
              comision_operador: financialConfig.comision_operador,
              mantenimiento_valor: financialConfig.mantenimiento_valor,
              es_mantenimiento_porcentaje: financialConfig.es_mantenimiento_porcentaje,
              gastos_fijos: financialConfig.gastos_fijos,
              es_gastos_fijos_porcentaje: financialConfig.es_gastos_fijos_porcentaje,
              gastos_variables: financialConfig.gastos_variables,
              es_gastos_variables_porcentaje: financialConfig.es_gastos_variables_porcentaje,
              impuestos: financialConfig.impuestos,
              es_impuestos_porcentaje: financialConfig.es_impuestos_porcentaje,
              plusvalia_anual: financialConfig.plusvalia_anual,
              tasa_interes: financialConfig.tasa_interes,
              adr_base: nightlyRate,
              ocupacion_anual: occupancyRate
            });
          
          if (error) {
            console.error('Error creating financial configuration for desarrollo:', error);
            toast.error('Error al crear la configuración del desarrollo');
          } else {
            toast.success('Configuración del desarrollo creada correctamente');
          }
        }
      } else {
        // Update global configuration
        const { error } = await supabase
          .from('configuracion_financiera')
          .update({
            comision_operador: financialConfig.comision_operador,
            mantenimiento_valor: financialConfig.mantenimiento_valor,
            es_mantenimiento_porcentaje: financialConfig.es_mantenimiento_porcentaje,
            gastos_fijos: financialConfig.gastos_fijos,
            es_gastos_fijos_porcentaje: financialConfig.es_gastos_fijos_porcentaje,
            gastos_variables: financialConfig.gastos_variables,
            es_gastos_variables_porcentaje: financialConfig.es_gastos_variables_porcentaje,
            impuestos: financialConfig.impuestos,
            es_impuestos_porcentaje: financialConfig.es_impuestos_porcentaje,
            plusvalia_anual: financialConfig.plusvalia_anual,
            tasa_interes: financialConfig.tasa_interes,
            adr_base: nightlyRate,
            ocupacion_anual: occupancyRate
          })
          .eq('id', 1);
        
        if (error) {
          console.error('Error saving financial configuration:', error);
          toast.error('Error al guardar la configuración');
        } else {
          console.log('Financial configuration saved successfully');
          toast.success('Configuración guardada correctamente');
        }
      }
    } catch (err) {
      console.error('Error in saving financial config:', err);
      toast.error('Error al guardar la configuración');
    }
  };

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
              onChange={(e) => setNightlyRate(parseInt(e.target.value) || 0)}
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
          
          <Button 
            type="button" 
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            onClick={saveFinancialConfig}
          >
            Guardar configuración
          </Button>
        </div>
      </Form>
      
      {/* Chart visualization - Will be shown in the parent component */}
      <div className="hidden">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Comparativa de inversiones</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" label={{ value: 'Años', position: 'insideBottomRight', offset: -5 }} />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value).replace('MXN', '')}
                label={{ value: 'Retorno (MXN)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Retorno']}
                labelFormatter={(label) => `Año ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="airbnbProfit" 
                name="Propiedad Airbnb"
                stroke="#4F46E5" 
                strokeWidth={3}
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="alternativeInvestment" 
                name="Inversión Alternativa"
                stroke="#14B8A6" 
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Render the chart data as a table */}
      <table className="w-full border-collapse hidden">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left p-3 font-medium text-slate-700">AÑO</th>
            <th className="text-left p-3 font-medium text-slate-700">RETORNO AIRBNB</th>
            <th className="text-left p-3 font-medium text-slate-700">RETORNO INVERSIÓN ALT.</th>
            <th className="text-left p-3 font-medium text-slate-700">DIFERENCIA</th>
            <th className="text-left p-3 font-medium text-slate-700">ROI ANUAL</th>
          </tr>
        </thead>
        <tbody>
          {chartData.map((item) => (
            <tr key={item.year} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-3">{item.year}</td>
              <td className="p-3">{formatCurrency(item.airbnbProfit)}</td>
              <td className="p-3">{formatCurrency(item.alternativeInvestment)}</td>
              <td className="p-3">{formatCurrency(item.difference)}</td>
              <td className="p-3">{item.yearlyROI}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Calculator;
