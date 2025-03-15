
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
      "Renta vacacional": "indigo",
      "Bonos US": "teal"
    };
    
    // If no categories provided or custom colors are provided, use defaults
    if (categories.length === 0 || props.colors) {
      return props.colors || ["indigo", "teal"];
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
      className={`${props.className || ''} bg-white`}
      colors={chartColors}
      // Ensure line thickness is visible
      lineThickness={8}
      showXAxis={true}
      showYAxis={true}
      animationDuration={1000}
      enableLegend={true}
      showLegend={props.showLegend !== false}
      showTooltip={props.showTooltip !== false}
      showGradient={false}
      valueFormatter={props.valueFormatter}
      yAxisWidth={props.yAxisWidth || 60}
      curveType="linear"
      autoMinValue={true}
      minValue={0}
      showPoints={true}
      customTooltip={props.customTooltip}
    />
  );
};

// Custom BarChart with improved formatting for year labels
export const BarChart = (props) => {
  // Add detailed logging of chart data before rendering
  console.log('BarChart rendering with data:', JSON.stringify(props.data, null, 2));
  console.log('BarChart categories:', props.categories);
  console.log('BarChart index:', props.index);
  
  // Map colors based on categories to enforce consistency
  const getColorMapping = () => {
    const categories = props.categories || [];
    const colorMap = {
      "Renta vacacional": "indigo",
      "Bonos US": "teal"
    };
    
    // If no categories provided or custom colors are provided, use defaults
    if (categories.length === 0 || props.colors) {
      return props.colors || ["indigo", "teal"];
    }
    
    // Map each category to its color
    return categories.map(category => colorMap[category] || "gray");
  };
  
  const chartColors = getColorMapping();
  
  // Custom formatter for x-axis labels (e.g., "Año 1", "Año 2", etc.)
  const customXAxisFormatter = props.xAxisFormatter || ((value) => {
    // Check if the value is a number representing a year
    if (typeof value === 'number' || !isNaN(Number(value))) {
      return `Año ${value}`;
    }
    return value;
  });
  
  console.log('BarChart will use colors:', chartColors);
  
  return (
    <TremorBarChart 
      {...props}
      showGridLines={true}
      showAnimation={true}
      className={`${props.className || ''} bg-white`}
      colors={chartColors}
      showXAxis={true}
      showYAxis={true}
      animationDuration={1000}
      enableLegend={true}
      showLegend={props.showLegend !== false}
      showTooltip={props.showTooltip !== false}
      valueFormatter={props.valueFormatter}
      yAxisWidth={props.yAxisWidth || 60}
      autoMinValue={true}
      minValue={0}
      xAxisFormatter={customXAxisFormatter}
      // Customize bar styling
      layout="vertical"
      showGradient={false}
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
