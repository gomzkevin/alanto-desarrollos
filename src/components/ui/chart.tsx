
"use client";

import { LineChart as TremorLineChart } from "@tremor/react";
import { BarChart as TremorBarChart } from "@tremor/react";
import { DonutChart as TremorDonutChart } from "@tremor/react"; 

// Re-export the Tremor components with our custom names
export const LineChart = (props) => (
  <TremorLineChart 
    {...props}
    connectNulls={true}
    enableLegendSlider={false}
    showGridLines={true}
    showAnimation={true}
    className={`${props.className || ''} bg-white`}
    colors={props.colors || ["indigo-500", "teal-500"]}
    // Ensure line thickness is visible
    customTooltip={props.customTooltip}
    showXAxis={true}
    showYAxis={true}
    animationDuration={1000}
    enableLegend={true}
    showLegend={props.showLegend !== false}
    showTooltip={props.showTooltip !== false}
    showGradient={true}
    lineThickness={5}
    valueFormatter={props.valueFormatter}
    yAxisWidth={props.yAxisWidth || 80}
    curveType={props.curveType || "monotone"}
  />
);

export const BarChart = TremorBarChart;
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
} from "@tremor/react";

// Export types with the proper syntax
export type { Color, DateRangePickerValue } from "@tremor/react";
