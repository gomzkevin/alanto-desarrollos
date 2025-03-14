
import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

const Calculator = () => {
  const [propertyValue, setPropertyValue] = useState(3500000);
  const [occupancyRate, setOccupancyRate] = useState(70); // percentage
  const [nightlyRate, setNightlyRate] = useState(1800);
  const [years, setYears] = useState(10);
  const [annualGrowth, setAnnualGrowth] = useState(5); // percentage
  
  // Alternative investment rate (for comparison)
  const alternativeRate = 7; // percentage
  
  const [chartData, setChartData] = useState<any[]>([]);
  const calculatorRef = useRef<HTMLDivElement>(null);
  
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Calculate the projection data
  useEffect(() => {
    const annualRevenue = nightlyRate * 365 * (occupancyRate / 100);
    
    // Operating expenses (estimated at 35% of revenue)
    const operatingExpenseRate = 0.35;
    
    let data = [];
    let airbnbCumulativeProfit = 0;
    let alternativeCumulativeProfit = 0;
    
    for (let year = 1; year <= years; year++) {
      // Calculate Airbnb investment
      const yearlyGrowthFactor = Math.pow(1 + (annualGrowth / 100), year - 1);
      const thisYearRevenue = annualRevenue * yearlyGrowthFactor;
      const thisYearExpenses = thisYearRevenue * operatingExpenseRate;
      const thisYearProfit = thisYearRevenue - thisYearExpenses;
      airbnbCumulativeProfit += thisYearProfit;
      
      // Property appreciation (estimated at 4% per year)
      const propertyAppreciation = propertyValue * Math.pow(1.04, year) - propertyValue;
      
      // Calculate alternative investment (e.g., stocks)
      const alternativeInvestmentReturn = propertyValue * Math.pow(1 + (alternativeRate / 100), year) - propertyValue;
      alternativeCumulativeProfit = alternativeInvestmentReturn;
      
      // Yearly ROI
      const roi = (thisYearProfit / propertyValue) * 100;
      
      data.push({
        year,
        airbnbProfit: airbnbCumulativeProfit + propertyAppreciation,
        alternativeInvestment: alternativeCumulativeProfit,
        yearlyROI: roi.toFixed(1)
      });
    }
    
    setChartData(data);
  }, [propertyValue, occupancyRate, nightlyRate, years, annualGrowth]);
  
  // Animate the calculator when in view
  useEffect(() => {
    const revealCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    };
    
    const observer = new IntersectionObserver(revealCallback, {
      threshold: 0.1,
    });
    
    if (calculatorRef.current) {
      observer.observe(calculatorRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  return (
    <section id="calculator" className="section bg-gradient-to-b from-slate-50 to-white relative">
      <div className="container px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16 reveal" ref={calculatorRef}>
          <div className="inline-block px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full mb-4">
            Calculadora
          </div>
          <h2 className="text-slate-800">
            Proyecta la <span className="text-indigo-600">rentabilidad</span> de la inversión
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Calcula y compara el rendimiento potencial de una propiedad para alquiler vacacional 
            frente a inversiones alternativas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 reveal" ref={calculatorRef}>
          {/* Inputs */}
          <div className="lg:col-span-1 space-y-6 glass-panel p-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Valor de la propiedad: {formatCurrency(propertyValue)}
              </label>
              <Slider 
                defaultValue={[propertyValue]} 
                max={50000000} 
                min={1000000} 
                step={100000}
                onValueChange={(value) => setPropertyValue(value[0])}
                className="py-4"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Porcentaje de ocupación anual: {occupancyRate}%
              </label>
              <Slider 
                defaultValue={[occupancyRate]} 
                max={100} 
                min={40} 
                step={1}
                onValueChange={(value) => setOccupancyRate(value[0])}
                className="py-4"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tarifa promedio por noche (MXN)
              </label>
              <Input 
                type="number" 
                value={nightlyRate} 
                onChange={(e) => setNightlyRate(parseInt(e.target.value) || 0)}
                className="glass-input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Crecimiento anual: {annualGrowth}%
              </label>
              <Slider 
                defaultValue={[annualGrowth]} 
                max={10} 
                min={0} 
                step={0.5}
                onValueChange={(value) => setAnnualGrowth(value[0])}
                className="py-4"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Años para proyección: {years}
              </label>
              <Slider 
                defaultValue={[years]} 
                max={20} 
                min={1} 
                step={1}
                onValueChange={(value) => setYears(value[0])}
                className="py-4"
              />
            </div>
          </div>
          
          {/* Chart & Results */}
          <div className="lg:col-span-2 glass-panel p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Comparativa de inversiones</h3>
              <p className="text-sm text-slate-600">
                Rendimiento acumulado de la propiedad vs. inversión alternativa ({alternativeRate}% anual)
              </p>
            </div>
            
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
            
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-indigo-600 font-medium">Retorno total (Airbnb)</p>
                <p className="text-xl font-bold text-indigo-700 mt-1 financial-number">
                  {formatCurrency(chartData[chartData.length - 1]?.airbnbProfit || 0)}
                </p>
              </div>
              
              <div className="p-4 bg-teal-50 rounded-lg">
                <p className="text-sm text-teal-600 font-medium">Retorno alternativo</p>
                <p className="text-xl font-bold text-teal-700 mt-1 financial-number">
                  {formatCurrency(chartData[chartData.length - 1]?.alternativeInvestment || 0)}
                </p>
              </div>
              
              <div className="p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-600 font-medium">ROI anual promedio</p>
                <p className="text-xl font-bold text-amber-700 mt-1 financial-number">
                  {chartData.length > 0 
                    ? (chartData.reduce((acc, item) => acc + parseFloat(item.yearlyROI), 0) / chartData.length).toFixed(1) 
                    : '0'}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative blurs */}
      <div className="absolute top-60 left-0 w-80 h-80 bg-indigo-100/30 rounded-full filter blur-3xl opacity-60 z-0"></div>
      <div className="absolute -bottom-20 right-0 w-80 h-80 bg-teal-100/30 rounded-full filter blur-3xl opacity-60 z-0"></div>
    </section>
  );
};

export default Calculator;
