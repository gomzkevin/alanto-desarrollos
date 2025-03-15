
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
  console.log('LineChart rendering with data:', JSON.stringify(props.data?.slice(0, 2) || [], null, 2));
  console.log('LineChart categories:', props.categories);
  console.log('LineChart index:', props.index);
  
  // Ensure data has the correct properties
  const validatedData = (props.data || []).map(item => {
    // Create a copy to avoid modifying the original data
    const newItem = {...item};
    // Ensure Renta vacacional and Bonos US properties exist in each data point
    if (props.categories && props.categories.includes("Renta vacacional") && 
        typeof newItem["Renta vacacional"] === 'undefined') {
      newItem["Renta vacacional"] = newItem.airbnbProfit;
    }
    if (props.categories && props.categories.includes("Bonos US") && 
        typeof newItem["Bonos US"] === 'undefined') {
      newItem["Bonos US"] = newItem.alternativeInvestment;
    }
    return newItem;
  });
  
  // Use explicitly provided colors for the categories - force them directly
  const categoryColors = {
    "Renta vacacional": "#9b87f5",
    "Bonos US": "#4ade80"
  };
  
  // Map colors to categories explicitly
  const chartColors = props.categories?.map(category => categoryColors[category] || "#000") || ["#9b87f5", "#4ade80"];
  
  console.log('LineChart will use colors:', chartColors);
  console.log('LineChart validated data sample:', JSON.stringify(validatedData?.slice(0, 2) || [], null, 2));
  
  return (
    <TremorLineChart 
      {...props}
      data={validatedData}
      categories={props.categories}
      colors={chartColors}
      index={props.index}
      connectNulls={true}
      enableLegendSlider={false}
      showGridLines={true}
      showAnimation={true}
      className={`${props.className || ''} bg-white text-xs`}
      lineThickness={props.lineThickness || 3}
      showXAxis={true}
      showYAxis={true}
      animationDuration={1000}
      enableLegend={true}
      showLegend={props.showLegend !== false}
      showTooltip={props.showTooltip !== false}
      showGradient={props.showGradient !== false}
      valueFormatter={props.valueFormatter}
      yAxisWidth={props.yAxisWidth || 60}
      curveType="linear"
      autoMinValue={true}
      showPoints={props.showPoints !== false}
      areaOpacity={0.2}
      fontSize={10}
    />
  );
};

export const BarChart = (props) => {
  // Add detailed logging of chart data before rendering
  console.log('BarChart rendering with data:', JSON.stringify(props.data?.slice(0, 2) || [], null, 2));
  console.log('BarChart categories:', props.categories);
  console.log('BarChart index:', props.index);
  
  // Ensure data has the correct properties
  const validatedData = (props.data || []).map(item => {
    // Create a copy to avoid modifying the original data
    const newItem = {...item};
    // Ensure Renta vacacional and Bonos US properties exist in each data point
    if (props.categories && props.categories.includes("Renta vacacional") && 
        typeof newItem["Renta vacacional"] === 'undefined') {
      newItem["Renta vacacional"] = newItem.airbnbProfit;
    }
    if (props.categories && props.categories.includes("Bonos US") && 
        typeof newItem["Bonos US"] === 'undefined') {
      newItem["Bonos US"] = newItem.alternativeInvestment;
    }
    return newItem;
  });
  
  // Use explicitly provided colors for the categories
  const categoryColors = {
    "Renta vacacional": "#9b87f5",
    "Bonos US": "#4ade80"
  };
  
  // Map colors to categories explicitly
  const chartColors = props.categories?.map(category => categoryColors[category] || "#000") || ["#9b87f5", "#4ade80"];
  
  console.log('BarChart will use colors:', chartColors);
  console.log('BarChart validated data sample:', JSON.stringify(validatedData?.slice(0, 2) || [], null, 2));
  
  return (
    <TremorBarChart 
      {...props}
      data={validatedData}
      categories={props.categories}
      colors={chartColors}
      index={props.index}
      showGridLines={true}
      showAnimation={true}
      className={`${props.className || ''} bg-white text-xs`}
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
      fontSize={10}
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
