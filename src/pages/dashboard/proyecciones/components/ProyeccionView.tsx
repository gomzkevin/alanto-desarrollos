
import React, { useState, useEffect } from 'react';
import { ProyeccionFilters } from './ProyeccionFilters';
import { ProyeccionResults } from './ProyeccionResults';
import { ProyeccionSummary } from './ProyeccionSummary';
import { ProyeccionTable } from './ProyeccionTable';

export interface ProyeccionViewProps {
  initialConfig: any;
}

export interface ProyeccionFiltersProps {
  initialConfig: any;
  onChange: (newConfig: any) => void;
}

export interface ProyeccionTableProps {
  tableData: any[];
}

export const ProyeccionView: React.FC<ProyeccionViewProps> = ({ initialConfig }) => {
  const [config, setConfig] = useState(initialConfig);
  const [results, setResults] = useState<any>(null);

  // Calculate financial projections when config changes
  useEffect(() => {
    if (!config) return;
    
    // Perform financial calculations here
    const calculatedResults = {
      roi: 15.5,
      returnPeriod: 36,
      totalInvestment: 5000000,
      projectedProfit: 1200000,
      monthlyProjection: [
        { month: 1, income: 50000, expenses: 30000, profit: 20000 },
        { month: 2, income: 55000, expenses: 32000, profit: 23000 },
        { month: 3, income: 60000, expenses: 33000, profit: 27000 },
        // Add more months as needed
      ]
    };
    
    setResults(calculatedResults);
  }, [config]);

  const handleConfigChange = (newConfig: any) => {
    setConfig(newConfig);
  };

  return (
    <div className="space-y-8">
      <ProyeccionFilters initialConfig={config} onChange={handleConfigChange} />
      
      {results && (
        <>
          <ProyeccionSummary summaryData={results} />
          <ProyeccionResults resultData={results} />
          <ProyeccionTable tableData={results.monthlyProjection} />
        </>
      )}
    </div>
  );
};

export default ProyeccionView;
