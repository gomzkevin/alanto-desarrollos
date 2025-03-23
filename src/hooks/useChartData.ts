

import { useState, useEffect } from 'react';
import { subMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChartDataPoint {
  date: string;
  Ventas: number;
}

const useChartData = () => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  
  useEffect(() => {
    // Generate sample data for the last 6 months
    const data = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return {
        date: format(date, 'MMM yyyy', { locale: es }),
        Ventas: Math.floor(Math.random() * 10000)
      };
    }).reverse();
    
    setChartData(data);
  }, []);
  
  return chartData;
};

export default useChartData;
