
"use client";

import { LineChart as TremorLineChart } from "@tremor/react";
import { BarChart as TremorBarChart } from "@tremor/react";
import { DonutChart as TremorDonutChart } from "@tremor/react"; 
import { 
  AreaChart as TremorAreaChart,
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

// Helper function to process colors
const processColors = (colors) => {
  if (!colors) return undefined;
  
  // Map color names to their corresponding hex values if needed
  return colors.map(color => {
    if (color === 'teal') return '#14b8a6'; // teal-500
    if (color === 'indigo') return '#4f46e5'; // indigo-600
    if (color === 'emerald') return '#10b981'; // emerald-500
    return color; // Return as is if it's already a hex value or other valid color
  });
};

// Re-export the Tremor components with our custom names
export const LineChart = (props) => {
  // Add detailed logging of chart data before rendering
  console.log('LineChart rendering with data:', JSON.stringify(props.data?.slice(0, 2) || [], null, 2));
  console.log('LineChart categories:', props.categories);
  console.log('LineChart index:', props.index);
  console.log('LineChart colors:', props.colors);
  
  // Process the colors to ensure they're in the correct format
  const chartColors = processColors(props.colors) || ["#4f46e5", "#14b8a6"];
  
  return (
    <TremorLineChart 
      data={props.data}
      index={props.index}
      categories={props.categories}
      colors={chartColors}
      className={`${props.className || ''} bg-white text-xs`}
      showLegend={props.showLegend !== false}
      showTooltip={props.showTooltip !== false}
      showXAxis={props.showXAxis !== false}
      showYAxis={props.showYAxis !== false}
      yAxisWidth={props.yAxisWidth || 60}
      // Remove properties not supported by Tremor LineChart
      curveType={props.curveType || "linear"}
      showAnimation={props.showAnimation !== false}
      showGridLines={true}
      animationDuration={1000}
      autoMinValue={true}
      valueFormatter={props.valueFormatter}
    />
  );
};

export const BarChart = (props) => {
  // Add detailed logging of chart data before rendering
  console.log('BarChart rendering with data:', JSON.stringify(props.data?.slice(0, 2) || [], null, 2));
  console.log('BarChart categories:', props.categories);
  console.log('BarChart index:', props.index);
  console.log('BarChart colors:', props.colors);
  
  // Process the colors to ensure they're in the correct format
  const chartColors = processColors(props.colors) || ["#4f46e5", "#14b8a6"];
  
  return (
    <TremorBarChart 
      data={props.data}
      index={props.index}
      categories={props.categories}
      colors={chartColors}
      className={`${props.className || ''} bg-white text-xs`}
      showLegend={props.showLegend !== false}
      showTooltip={props.showTooltip !== false}
      showXAxis={props.showXAxis !== false}
      showYAxis={props.showYAxis !== false}
      yAxisWidth={props.yAxisWidth || 60}
      showAnimation={props.showAnimation !== false}
      showGridLines={true}
      animationDuration={1000}
      autoMinValue={true}
      minValue={0}
      valueFormatter={props.valueFormatter}
    />
  );
};

export const PieChart = TremorDonutChart;

// Create our custom AreaChart component properly
export const AreaChart = (props) => {
  const processedProps = {
    ...props,
    colors: processColors(props.colors)
  };
  return <TremorAreaChart {...processedProps} />;
};

// Export the original components directly
export {
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
