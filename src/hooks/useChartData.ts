
import { useState, useEffect } from 'react';

/**
 * Hook para procesar datos de gráficas y asegurar que tienen el formato correcto
 */
const useChartData = (rawData: any[]) => {
  const [processedData, setProcessedData] = useState<any[]>([]);

  useEffect(() => {
    if (!rawData || rawData.length === 0) {
      setProcessedData([]);
      return;
    }

    // Procesamos los datos para asegurar que tienen las propiedades correctas y son valores numéricos
    const enhancedData = rawData.map(item => ({
      ...item,
      "year_label": `Año ${item.year}`,
      "Renta vacacional": Number(item.airbnbProfit || 0),
      "Bonos US": Number(item.alternativeInvestment || 0)
    }));
    
    console.log("useChartData - Enhanced data:", JSON.stringify(enhancedData.slice(0, 2), null, 2));
    setProcessedData(enhancedData);
  }, [rawData]);

  return processedData;
};

export default useChartData;
