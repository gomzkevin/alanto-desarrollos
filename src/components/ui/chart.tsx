
"use client";

import { LineChart as TremorLineChart } from "@tremor/react";
import { BarChart as TremorBarChart } from "@tremor/react";
import { DonutChart as TremorDonutChart } from "@tremor/react"; 
import { 
  AreaChart,
  BarList,
  Card,
  DateRangePicker,
  ProgressBar,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  TableBody,
  TableCell,
  TableFoot,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  Title,
  Tracker,
} from "@tremor/react";

// Re-export the Tremor components with our custom names
export const LineChart = (props) => {
  // Add detailed logging of chart data before rendering
  console.log('LineChart rendering with data:', JSON.stringify(props.data, null, 2));
  console.log('LineChart categories:', props.categories);
  console.log('LineChart index:', props.index);
  
  // Map colors based on categories to enforce consistency
  const getColorMapping = () => {
    const categories = props.categories || [];
    const colorMap = {
      "Renta vacacional": "#9b87f5", // Indigo/morado para Airbnb
      "Bonos US": "#4ade80"          // Verde para inversión alternativa
    };
    
    // If no categories provided or custom colors are provided, use defaults
    if (categories.length === 0 || props.colors) {
      return props.colors || ["#9b87f5", "#4ade80"];
    }
    
    // Map each category to its color
    return categories.map(category => colorMap[category] || "gray");
  };
  
  const chartColors = getColorMapping();
  
  console.log('LineChart will use colors:', chartColors);
  
  return (
    <TremorLineChart 
      {...props}
      connectNulls={true}
      enableLegendSlider={false}
      showGridLines={true}
      showAnimation={true}
      className={`${props.className || ''} bg-white text-xs`}
      colors={chartColors}
      // Ensure line thickness is visible
      lineThickness={2}
      showXAxis={true}
      showYAxis={true}
      animationDuration={1000}
      enableLegend={true}
      showLegend={props.showLegend !== false}
      showTooltip={props.showTooltip !== false}
      showGradient={true}
      valueFormatter={props.valueFormatter}
      yAxisWidth={props.yAxisWidth || 60}
      curveType="natural"
      autoMinValue={true}
      minValue={0}
      showPoints={true}
      customTooltip={props.customTooltip}
      areaOpacity={0.2}
      fontSize={10}
    />
  );
};

export const BarChart = (props) => {
  // Add detailed logging of chart data before rendering
  console.log('BarChart rendering with data:', JSON.stringify(props.data, null, 2));
  console.log('BarChart categories:', props.categories);
  console.log('BarChart index:', props.index);
  
  // Map colors based on categories to enforce consistency
  const getColorMapping = () => {
    const categories = props.categories || [];
    const colorMap = {
      "Renta vacacional": "#9b87f5", // Indigo/morado para Airbnb
      "Bonos US": "#4ade80"          // Verde para inversión alternativa
    };
    
    // If no categories provided or custom colors are provided, use defaults
    if (categories.length === 0 || props.colors) {
      return props.colors || ["#9b87f5", "#4ade80"];
    }
    
    // Map each category to its color
    return categories.map(category => colorMap[category] || "gray");
  };
  
  const chartColors = getColorMapping();
  
  console.log('BarChart will use colors:', chartColors);
  
  return (
    <TremorBarChart 
      {...props}
      showGridLines={true}
      showAnimation={true}
      className={`${props.className || ''} bg-white text-xs`}
      colors={chartColors}
      showXAxis={true}
      showYAxis={true}
      animationDuration={1000}
      enableLegend={true}
      showLegend={props.showLegend !== false}
      showTooltip={props.showTooltip !== false}
      showGradient={false}
      valueFormatter={props.valueFormatter}
      yAxisWidth={props.yAxisWidth || 60}
      autoMinValue={true}
      minValue={0}
      customTooltip={props.customTooltip}
      fontSize={10} // Reducing font size by 25% (from 12 to 10)
    />
  );
};

export const PieChart = TremorDonutChart;

// Export the original components directly
export {
  AreaChart,
  BarList,
  Card,
  DateRangePicker,
  ProgressBar,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  TableBody,
  TableCell,
  TableFoot,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  Title,
  Tracker,
};

// Export types with the proper syntax
export type { Color, DateRangePickerValue } from "@tremor/react";
