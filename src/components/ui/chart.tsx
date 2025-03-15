
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
  console.log('LineChart colors:', props.colors);
  
  // Use the provided colors directly
  const chartColors = props.colors || ["#9b87f5", "#4ade80"];
  
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
      // Removing showGradient as it doesn't exist in the type definitions
      areaOpacity={0.2}
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
  
  // Use the provided colors directly
  const chartColors = props.colors || ["#9b87f5", "#4ade80"];
  
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
