
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export interface ProyeccionChartProps {
  chartData: any[];
}

export const ProyeccionChart: React.FC<ProyeccionChartProps> = ({ chartData }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
        <Legend />
        <Area type="monotone" dataKey="income" name="Ingresos" stackId="1" stroke="#4f46e5" fill="#c7d2fe" />
        <Area type="monotone" dataKey="expenses" name="Gastos" stackId="1" stroke="#f97316" fill="#fed7aa" />
        <Area type="monotone" dataKey="profit" name="Utilidad" stackId="2" stroke="#16a34a" fill="#bbf7d0" />
      </AreaChart>
    </ResponsiveContainer>
  );
};
